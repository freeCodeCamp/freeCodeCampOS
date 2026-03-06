#![warn(clippy::pedantic)]
#![allow(clippy::struct_excessive_bools)]

use clap::Parser;
use clapper::{add_project, create_boilerplate, create_course, rename_project, Cli, SubCommand};
use inquire::error::InquireResult;

mod clapper;
mod conf;
mod environment;
mod features;
mod fixtures;
mod fs;

fn main() -> InquireResult<()> {
    let args = Cli::parse();

    match args.sub_commands {
        Some(SubCommand::Create) => {
            create_boilerplate()?;
        }
        Some(SubCommand::AddProject) => {
            add_project()?;
        }
        Some(SubCommand::RenameProject) => {
            rename_project()?;
        }
        None => {
            create_course()?;
        }
    }
    Ok(())
}
