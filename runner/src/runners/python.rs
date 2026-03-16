use crate::Runner;
use anyhow::Result;
use config::{Hooks, Project, Test};
use std::fs;
use std::process::Command;
use tempfile::Builder;

pub struct PythonRunner;

// Embedded scripts
const PYTHON_ENTRY: &str = include_str!("../../scripts/python/index.py");
const PYTHON_WORKER: &str = include_str!("../../scripts/python/test_worker.py");

impl Runner for PythonRunner {
    fn execute(
        project: &Project,
        tests: Vec<Test>,
        hooks: &Hooks,
        helpers: Option<&str>,
    ) -> Result<Vec<Test>> {
        // Create temporary directory for test files in CWD
        let test_dir = Builder::new().prefix(".fcc-tests-").tempdir_in(".")?;
        let test_dir_path = test_dir.path().to_path_buf();

        // Write project file
        let project_path = test_dir_path.join("project.json");
        fs::write(&project_path, serde_json::to_string(project)?)?;

        // Extract Python-specific hooks
        let python_hooks = serde_json::json!({
            "before_all": hooks.before_all.as_ref().filter(|h| h.runner == "python" || h.runner == "py").map(|h| &h.code),
            "after_all": hooks.after_all.as_ref().filter(|h| h.runner == "python" || h.runner == "py").map(|h| &h.code),
            "before_each": hooks.before_each.as_ref().filter(|h| h.runner == "python" || h.runner == "py").map(|h| &h.code),
            "after_each": hooks.after_each.as_ref().filter(|h| h.runner == "python" || h.runner == "py").map(|h| &h.code),
        });

        // Write hooks file
        let hooks_path = test_dir_path.join("hooks.json");
        fs::write(&hooks_path, serde_json::to_string(&python_hooks)?)?;

        // Write test files
        let mut test_paths = Vec::new();
        for (i, test) in tests.iter().enumerate() {
            let path = test_dir_path.join(format!("test-{}.json", i));
            fs::write(&path, serde_json::to_string(test)?)?;
            test_paths.push(path);
        }

        // Write runner scripts
        let entry_path = test_dir_path.join("index.py");
        fs::write(&entry_path, PYTHON_ENTRY)?;

        let worker_path = test_dir_path.join("test_worker.py");
        fs::write(&worker_path, PYTHON_WORKER)?;

        // Resolve absolute path for helpers if provided
        let absolute_helpers_path = helpers.map(|h| {
            std::fs::canonicalize(h).map(|p| p.to_string_lossy().to_string()).unwrap_or_else(|_| h.to_string())
        });

        // Write manifest
        let manifest = serde_json::json!({
            "project_path": project_path.to_str().unwrap(),
            "hooks_path": hooks_path.to_str().unwrap(),
            "test_paths": test_paths.iter().map(|p| p.to_str().unwrap()).collect::<Vec<_>>(),
            "helpers_path": absolute_helpers_path,
        });
        let manifest_path = test_dir_path.join("manifest.json");
        fs::write(&manifest_path, serde_json::to_string(&manifest)?)?;

        // Execute Python runner
        let output = Command::new("python3")
            .arg(entry_path.to_str().unwrap())
            .env("MANIFEST_PATH", manifest_path.to_str().unwrap())
            .env("TEST_WORKER_PATH", worker_path.to_str().unwrap())
            .output()?;

        if !output.status.success() {
            eprintln!(
                "Python runner failed:\nstdout: {}\nstderr: {}",
                String::from_utf8_lossy(&output.stdout),
                String::from_utf8_lossy(&output.stderr)
            );
        }

        // Read back test results
        let mut results = Vec::new();
        for test_path in test_paths {
            if let Ok(content) = fs::read_to_string(&test_path) {
                if let Ok(test) = serde_json::from_str::<Test>(&content) {
                    results.push(test);
                }
            }
        }

        Ok(results)
    }
}
