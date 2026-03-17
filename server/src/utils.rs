//! Shared utilities for the server

pub async fn perform_seed(seed: &config::Seed, project_dashed_name: &str) -> anyhow::Result<()> {
    match seed {
        config::Seed::Command { runner, code } => {
            runner::run_cmd(runner, code)?;
        }
        config::Seed::File { path, code } => {
            let full_path = format!("{}/{}", project_dashed_name, path);
            runner::overwrite_file(&full_path, code)?;
        }
    }
    Ok(())
}
