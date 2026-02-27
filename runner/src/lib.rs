//! Test runner library for freeCodeCampOS

use anyhow::Result;
use config::{Hooks, Project, Test};

pub mod runners;
pub use runners::{node::NodeRunner, bash::BashRunner};

/// Trait for test runners
pub trait Runner {
    fn execute(
        project: &Project,
        tests: Vec<Test>,
        hooks: &Hooks,
        work_dir: &str,
    ) -> Result<Vec<Test>>;
}

/// Execute tests using the appropriate runner
pub fn execute_tests(
    project: &Project,
    tests: Vec<Test>,
    hooks: &Hooks,
    work_dir: &str,
) -> Result<Vec<Test>> {
    if tests.is_empty() {
        return Ok(vec![]);
    }

    let runner = &tests[0].runner;
    match runner.as_str() {
        "node" | "javascript" | "js" => NodeRunner::execute(project, tests, hooks, work_dir),
        "bash" | "sh" => BashRunner::execute(project, tests, hooks, work_dir),
        _ => Err(anyhow::anyhow!("Unsupported runner: {}", runner)),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_runner_trait() {
        // Test that runners implement the trait correctly
        // This would require actual execution environment
    }
}
