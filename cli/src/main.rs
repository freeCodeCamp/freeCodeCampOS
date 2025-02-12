#![warn(clippy::pedantic)]
#![allow(clippy::struct_excessive_bools)]

use clap::Parser;
use clapper::{add_project, create_course, Cli, SubCommand};
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
        Some(SubCommand::AddProject) => {
            unimplemented!()
            // add_project()?;
        }
        None => {
            create_course()?;
        }
    }
    Ok(())
}
