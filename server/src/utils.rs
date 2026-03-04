//! Shared utilities for the server

pub async fn perform_seed(seed: &config::Seed) -> anyhow::Result<()> {
    match seed {
        config::Seed::Command { runner, code } => {
            runner::run_cmd(runner, code)?;
        }
        config::Seed::File { path, code } => {
            runner::overwrite_file(path, code)?;
        }
    }
    Ok(())
}
