//! Test runner library for freeCodeCampOS

use anyhow::Result;
use config::{Hooks, Project, Test};

pub mod runners;
pub use runners::{node::NodeRunner, bash::BashRunner, python::PythonRunner};

/// Trait for test runners
pub trait Runner {
    fn execute(
        project: &Project,
        tests: Vec<Test>,
        hooks: &Hooks,
        helpers: Option<&str>,
    ) -> Result<Vec<Test>>;
}

pub fn run_cmd(
    runner: &str,
    code: &str,
) -> Result<()> {
    match runner {
        "python" | "py" => {
            let output = std::process::Command::new("python3")
                .arg("-c")
                .arg(code)
                .output()?;
            if !output.status.success() {
                anyhow::bail!("Python command failed: {}", String::from_utf8_lossy(&output.stderr));
            }
        }
        "node" | "js" | "javascript" => {
            let output = std::process::Command::new("node")
                .arg("-e")
                .arg(code)
                .output()?;
            if !output.status.success() {
                anyhow::bail!("Node command failed: {}", String::from_utf8_lossy(&output.stderr));
            }
        }
        _ => {
            let output = std::process::Command::new("bash")
                .arg("-c")
                .arg(code)
                .output()?;
            if !output.status.success() {
                anyhow::bail!("Bash command failed: {}", String::from_utf8_lossy(&output.stderr));
            }
        }
    }
    Ok(())
}

pub fn overwrite_file(
    path: &str,
    code: &str,
) -> Result<()> {
    let path = std::path::Path::new(path.trim_matches('"'));
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::write(path, code)?;
    Ok(())
}


