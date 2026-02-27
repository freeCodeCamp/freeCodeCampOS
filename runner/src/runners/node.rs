use crate::Runner;
use anyhow::Result;
use freecodecamp_config::{Hooks, Project, Test};
use std::fs;
use std::io::Write;
use std::process::Command;
use tempfile::{tempdir, NamedTempFile};

pub struct NodeRunner;

// Embedded scripts
const NODE_ENTRY: &str = include_str!("../../scripts/node/index.js");
const NODE_WORKER: &str = include_str!("../../scripts/node/test-worker.js");

impl Runner for NodeRunner {
    fn execute(
        project: &Project,
        tests: Vec<Test>,
        hooks: &Hooks,
        work_dir: &str,
    ) -> Result<Vec<Test>> {
        // Create temporary directory for test files
        let test_dir = tempdir()?;
        let test_dir_path = test_dir.path().to_path_buf();

        // Write project file
        let mut project_file = NamedTempFile::new_in(&test_dir_path)?;
        project_file.write_all(serde_json::to_string(project)?.as_bytes())?;
        let project_path = project_file.path().to_path_buf();

        // Write hooks file
        let mut hooks_file = NamedTempFile::new_in(&test_dir_path)?;
        hooks_file.write_all(serde_json::to_string(hooks)?.as_bytes())?;
        let hooks_path = hooks_file.path().to_path_buf();

        // Write test files
        let mut test_paths = Vec::new();
        for test in tests.iter() {
            let mut test_file = NamedTempFile::new_in(&test_dir_path)?;
            test_file.write_all(serde_json::to_string(test)?.as_bytes())?;
            let path = test_file.path().to_path_buf();
            test_paths.push(path);
        }

        // Write helper scripts
        let mut entry_file = NamedTempFile::new_in(&test_dir_path)?;
        entry_file.write_all(NODE_ENTRY.as_bytes())?;
        let entry_path = entry_file.path().to_path_buf();

        let mut worker_file = NamedTempFile::new_in(&test_dir_path)?;
        worker_file.write_all(NODE_WORKER.as_bytes())?;
        let worker_path = worker_file.path().to_path_buf();

        // Write manifest
        let manifest = serde_json::json!({
            "project_path": project_path.to_str().unwrap(),
            "hooks_path": hooks_path.to_str().unwrap(),
            "test_paths": test_paths.iter().map(|p| p.to_str().unwrap()).collect::<Vec<_>>(),
        });
        let mut manifest_file = NamedTempFile::new_in(&test_dir_path)?;
        manifest_file.write_all(serde_json::to_string(&manifest)?.as_bytes())?;
        let manifest_path = manifest_file.path().to_path_buf();

        // Execute Node runner
        let output = Command::new("node")
            .arg(entry_path.to_str().unwrap())
            .env("MANIFEST_PATH", manifest_path.to_str().unwrap())
            .env("TEST_WORKER_PATH", worker_path.to_str().unwrap())
            .current_dir(work_dir)
            .output()?;

        if !output.status.success() {
            eprintln!(
                "Node runner failed:\nstdout: {}\nstderr: {}",
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
