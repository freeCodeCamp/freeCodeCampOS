use crate::Runner;
use anyhow::Result;
use config::{Hooks, Project, Test};
use std::fs;
use std::process::Command;
use tempfile::tempdir;

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
        let project_path = test_dir_path.join("project.json");
        fs::write(&project_path, serde_json::to_string(project)?)?;

        // Extract Node-specific hooks
        let node_hooks = serde_json::json!({
            "before_all": hooks.before_all.get("node"),
            "after_all": hooks.after_all.get("node"),
            "before_each": hooks.before_each.get("node"),
            "after_each": hooks.after_each.get("node"),
        });

        // Write hooks file
        let hooks_path = test_dir_path.join("hooks.json");
        fs::write(&hooks_path, serde_json::to_string(&node_hooks)?)?;

        // Write test files
        let mut test_paths = Vec::new();
        for (i, test) in tests.iter().enumerate() {
            let path = test_dir_path.join(format!("test-{}.json", i));
            fs::write(&path, serde_json::to_string(test)?)?;
            test_paths.push(path);
        }

        // Write helper scripts
        let entry_path = test_dir_path.join("index.js");
        fs::write(&entry_path, NODE_ENTRY)?;

        let worker_path = test_dir_path.join("worker.js");
        fs::write(&worker_path, NODE_WORKER)?;

        // Write manifest
        let manifest = serde_json::json!({
            "project_path": project_path.to_str().unwrap(),
            "hooks_path": hooks_path.to_str().unwrap(),
            "test_paths": test_paths.iter().map(|p| p.to_str().unwrap()).collect::<Vec<_>>(),
        });
        let manifest_path = test_dir_path.join("manifest.json");
        fs::write(&manifest_path, serde_json::to_string(&manifest)?)?;

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
