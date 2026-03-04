use crate::Runner;
use anyhow::Result;
use config::{Hooks, Project, Test};
use std::process::Command;

pub struct BashRunner;

impl Runner for BashRunner {
    fn execute(
        _project: &Project,
        tests: Vec<Test>,
        hooks: &Hooks,
    ) -> Result<Vec<Test>> {
        let mut results = Vec::new();

        let bash_before_all = hooks.before_all.as_ref().filter(|h| h.runner == "bash" || h.runner == "sh").map(|h| &h.code);
        let bash_after_all = hooks.after_all.as_ref().filter(|h| h.runner == "bash" || h.runner == "sh").map(|h| &h.code);
        let bash_before_each = hooks.before_each.as_ref().filter(|h| h.runner == "bash" || h.runner == "sh").map(|h| &h.code);
        let bash_after_each = hooks.after_each.as_ref().filter(|h| h.runner == "bash" || h.runner == "sh").map(|h| &h.code);

        // Run before_all hook
        if let Some(code) = bash_before_all {
            Command::new("bash")
                .arg("-c")
                .arg(code)
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
                .output()?;

            if output.status.success() {
                test.state = config::TestState::Passed;
            } else {
                test.state = config::TestState::Failed;
                let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
                let message = if stderr.is_empty() {
                    "Test failed".to_string()
                } else {
                    stderr.clone()
                };
                test.error = Some(config::TestError {
                    message,
                    detail: Some(serde_json::json!({
                        "stdout": String::from_utf8_lossy(&output.stdout),
                        "stderr": stderr,
                        "exit_code": output.status.code()
                    })),
                });
            }

            results.push(test);
        }

        // Run after_all hook
        if let Some(code) = bash_after_all {
            Command::new("bash")
                .arg("-c")
                .arg(code)
                .status()?;
        }

        Ok(results)
    }
}
