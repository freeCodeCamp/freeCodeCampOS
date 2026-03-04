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


