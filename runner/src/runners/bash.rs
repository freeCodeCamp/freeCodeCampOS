use crate::Runner;
use anyhow::Result;
use config::{Hooks, Project, Test, TestState};
use std::process::Command;

pub struct BashRunner;

impl Runner for BashRunner {
    fn execute(
        _project: &Project,
        tests: Vec<Test>,
        _hooks: &Hooks,
        work_dir: &str,
    ) -> Result<Vec<Test>> {
        let mut results = Vec::new();

        for mut test in tests {
            // Execute bash script
            let output = Command::new("bash")
                .arg("-c")
                .arg(&test.code)
                .current_dir(work_dir)
                .output()?;

            if output.status.success() {
                test.state = TestState::Passed;
            } else {
                test.state = TestState::Failed;
            }

            results.push(test);
        }

        Ok(results)
    }
}
