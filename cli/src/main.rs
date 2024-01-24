#![warn(clippy::pedantic)]
use std::{fs::canonicalize, path::Path};

use environment::Environment;
use features::Features;
use fs::Course;
use indicatif::ProgressBar;
use inquire::{
    error::InquireResult, min_length, validator::Validation, Confirm, CustomType, MultiSelect, Text,
};

mod conf;
mod environment;
mod features;
mod fixtures;
mod fs;

fn main() -> InquireResult<()> {
    let directory_name = Text::new("Name of course?")
        .with_help_message("This will be used as the directory name for the repository.")
        .with_validator(min_length!(1, "Minimum of 1 character"))
        .prompt()?;

    // Check if directory exists
    // If it does, prompt user to overwrite or exit
    let directory_exists = check_directory_exists(&directory_name);

    if directory_exists {
        let overwrite = Confirm::new("Directory already exists. Overwrite?")
            .with_help_message("This will delete the existing directory and all its contents. Or, exit the program without doing anything.")
            .with_default(false)
            .prompt()?;

        if !overwrite {
            println!("Exiting...");
            std::process::exit(0);
        }

        println!("Overwriting directory: {directory_name}");
        std::fs::remove_dir_all(
            canonicalize(&directory_name).expect("unable to canonicalize path"),
        )
        .expect("unable to delete directory");
        touch_course(&directory_name);
    } else {
        touch_course(&directory_name);
    }

    let is_git_repository = Confirm::new("Initialise as a git repository?")
        .with_default(true)
        .prompt()?;

    let is_translated = Confirm::new("Is this course going to be translated?")
        .with_default(true)
        .prompt()?;
    let num_projects = CustomType::<u8>::new("How many projects in the course?")
        .with_default(1)
        .with_formatter(&|i| format!("{i}"))
        // .with_error_message("Please type a valid number")
        .with_validator(|input: &u8| {
            if *input > 0 {
                Ok(Validation::Valid)
            } else {
                Ok(Validation::Invalid(
                    "Please enter a number greater than 0, and less than 256.".into(),
                ))
            }
        })
        .prompt()?;

    let features =
        MultiSelect::new("Features used in the course:", Features::VARIANTS.to_vec()).prompt()?;

    let environment = MultiSelect::new(
        "Environments used in the course:",
        Environment::VARIANTS.to_vec(),
    )
    .prompt()?;

    // TODO(FEATURE): Prompt developers for custom paths
    // let use_default_paths = Confirm::new("Use default paths?")
    //     .with_default(true)
    //     .with_help_message(
    //         "This uses the recommended paths for the various config files and directories.",
    //     )
    //     .prompt()?;

    let course = Course::new(
        directory_name.clone(),
        environment,
        features,
        is_git_repository,
        is_translated,
        num_projects,
    );

    let pb = ProgressBar::new(15);
    println!("Creating course...");

    course.create_course(&pb);

    pb.finish_with_message("done");
    println!("Created course: {directory_name}");
    println!("Start by `cd {directory_name}`.");

    Ok(())
}

/// Searches current directory if it already exists
fn check_directory_exists(directory_name: &str) -> bool {
    Path::new(directory_name).is_dir()
}

/// Creates the directory if it doesn't exist
/// Overwrites the directory if it exists
fn touch_course(directory_name: &str) {
    if let Err(e) = std::fs::create_dir(directory_name) {
        eprintln!("Error creating directory: {e}");
        std::process::exit(1);
    }
    println!("Created directory: {directory_name}");
}
