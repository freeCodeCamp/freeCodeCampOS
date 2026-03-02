use crate::Runner;
use anyhow::Result;
use config::{Hooks, Project, Test, TestState};
use std::process::Command;

pub struct BashRunner;

impl Runner for BashRunner {
    fn execute(
        _project: &Project,
        tests: Vec<Test>,
        hooks: &Hooks,
        work_dir: &str,
    ) -> Result<Vec<Test>> {
        let mut results = Vec::new();

        let bash_before_all = hooks.before_all.get("bash");
        let bash_after_all = hooks.after_all.get("bash");
        let bash_before_each = hooks.before_each.get("bash");
        let bash_after_each = hooks.after_each.get("bash");

        // Run before_all hook
        if let Some(code) = bash_before_all {
            Command::new("bash")
                .arg("-c")
                .arg(code)
                .current_dir(work_dir)
                .status()?;
        }

        for mut test in tests {
            // Construct full script with hooks and exit code preservation
            let mut script = String::new();
            if let Some(code) = bash_before_each {
                script.push_str(code);
                script.push('\n');
            }
            script.push_str(&test.code);
            script.push_str("\nEXIT_CODE=$?\n");
            if let Some(code) = bash_after_each {
                script.push_str(code);
                script.push('\n');
            }
            script.push_str("exit $EXIT_CODE");

            // Execute bash script
            let output = Command::new("bash")
                .arg("-c")
                .arg(&script)
                .current_dir(work_dir)
                .output()?;

            if output.status.success() {
                test.state = TestState::Passed;
            } else {
                test.state = TestState::Failed;
            }

            results.push(test);
        }

        // Run after_all hook
        if let Some(code) = bash_after_all {
            Command::new("bash")
                .arg("-c")
                .arg(code)
                .current_dir(work_dir)
                .status()?;
        }

        Ok(results)
    }
}
