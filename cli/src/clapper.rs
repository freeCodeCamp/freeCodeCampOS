use clap::{Parser, Subcommand};
use std::path::PathBuf;
use std::{fs::canonicalize, path::Path};

use crate::conf::Conf;
use crate::features::Features;
use crate::fs::Course;
use crate::{conf::Project, environment::Environment};
use indicatif::ProgressBar;
use inquire::{
    error::InquireResult, min_length, validator::Validation, Confirm, CustomType, MultiSelect, Text,
};

#[derive(Debug, Parser)]
/// A CLI tool to help developers create courses for freeCodeCamp
pub struct Cli {
    #[command(subcommand)]
    pub sub_commands: Option<SubCommand>,
}

#[derive(Debug, Subcommand)]
pub enum SubCommand {
    /// Add a project to an existing course
    ///
    /// Run this command in the root directory of the course.
    AddProject,
}

/// Appends and creates the necessary metadata for a new project within an existing course
pub fn add_project() -> InquireResult<()> {
    // Validate the string is a valid file and directory name
    let validator = |input: &str| {
        if input.chars().all(|c| c.is_ascii_alphanumeric() || c == '-') {
            Ok(Validation::Valid)
        } else {
            Ok(Validation::Invalid(
                "Your dashed name should be a valid string for a file and directory name".into(),
            ))
        }
    };
    let dashed_name = Text::new("Dashed name of project?")
        .with_help_message("This will be used as the directory name for the project.")
        .with_validator(validator)
        .prompt()?;
    let title = Text::new("Title of project?")
        .with_help_message("This will be used as the title of the project.")
        .with_validator(min_length!(1, "Minimum of 1 character"))
        .prompt()?;
    let description = Text::new("Description of project?")
        .with_help_message("This will be used as the description of the project.")
        .with_validator(min_length!(1, "Minimum of 1 character"))
        .prompt()?;
    let is_integrated = Confirm::new("Is this project integrated?")
        .with_default(false)
        .prompt()?;
    let is_public = Confirm::new("Is this project public?")
        .with_default(true)
        .prompt()?;
    let run_tests_on_watch = Confirm::new("Run tests on watch?")
        .with_default(!is_integrated)
        .prompt()?;
    let is_reset_enabled = Confirm::new("Is reset enabled?")
        .with_default(true)
        .prompt()?;
    let mut seed_every_lesson = false;
    let mut blocking_tests = false;
    let mut break_on_failure = false;
    if is_integrated {
        blocking_tests = Confirm::new("Blocking tests?")
            .with_default(true)
            .prompt()?;
        if blocking_tests {
            break_on_failure = Confirm::new("Break on failure?")
                .with_default(true)
                .prompt()?;
        }
    } else {
        seed_every_lesson = Confirm::new("Seed every lesson?")
            .with_default(true)
            .prompt()?;
    }

    let freecodecamp_conf = get_config();

    create_curriculum_file(&freecodecamp_conf, &dashed_name, &title, &description);
    create_boilerplate_folder(&dashed_name);

    let mut projects = get_projects();
    let latest_project = projects.last();

    let id = match latest_project {
        Some(project) => project.id + 1,
        None => 1,
    };
    let project = Project {
        id,
        dashed_name,
        current_lesson: 0,
        is_integrated,
        is_public,
        run_tests_on_watch,
        seed_every_lesson,
        is_reset_enabled,
        blocking_tests,
        break_on_failure,
        number_of_lessons: 1,
    };
    projects.push(project);
    create_project_metadata(&freecodecamp_conf, &projects);

    Ok(())
}

pub fn create_course() -> InquireResult<()> {
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

    let pb = ProgressBar::new(14);
    println!("Creating course...");

    course.create_course(&pb);

    pb.finish_with_message("done");
    println!("Created course: {directory_name}");
    println!("Start by `cd {directory_name} && npm i`.");
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

fn get_projects() -> Vec<Project> {
    let freecodecamp_conf = get_config();

    let projects_path = freecodecamp_conf.config.projects;

    let projects_file = match std::fs::read_to_string(projects_path) {
        Ok(projects) => projects,
        Err(e) => {
            eprintln!("Error reading projects.json file: {e}");
            std::process::exit(1);
        }
    };

    let projects: Vec<Project> = match serde_json::from_str(&projects_file) {
        Ok(projects) => projects,
        Err(e) => {
            eprintln!("Error parsing projects.json file: {e}");
            std::process::exit(1);
        }
    };

    projects
}

/// Gets the `freecodecamp.conf.json` file in the current directory
fn get_config() -> Conf {
    let path = Path::new("freecodecamp.conf.json");
    let file = match std::fs::read(path) {
        Ok(file) => file,
        Err(e) => {
            eprintln!("Error opening config file: {e}");
            std::process::exit(1);
        }
    };

    let freecodecamp_conf: Conf = match serde_json::from_slice(&file) {
        Ok(freecodecamp_conf) => freecodecamp_conf,
        Err(e) => {
            eprintln!("Error parsing config file: {e}");
            std::process::exit(1);
        }
    };

    freecodecamp_conf
}

fn create_curriculum_file(
    freecodecamp_conf: &Conf,
    dashed_name: &str,
    title: &str,
    description: &str,
) {
    let markdown = format!(
        r#"# {title}

{description}

## 0

### --description--

Placeholder description.

### --tests--

Placeholder test.

```js
assert.fail();
```

## --fcc-end--
"#
    );

    let curriculum_path = PathBuf::from(freecodecamp_conf.curriculum.locales.english.clone());
    if let Err(e) = std::fs::write(curriculum_path.join(format!("{dashed_name}.md")), markdown) {
        eprintln!("Error writing curriculum file: {e}");
        std::process::exit(1);
    };
}

fn create_boilerplate_folder(dashed_name: &str) {
    match std::fs::create_dir(dashed_name) {
        Ok(()) => {
            let gitkeep_path = PathBuf::from(dashed_name).join(".gitkeep");
            match std::fs::write(gitkeep_path, "") {
                Ok(()) => (),
                Err(e) => {
                    eprintln!("Error writing .gitkeep file: {e}");
                    std::process::exit(1);
                }
            };
        }
        Err(e) => {
            eprintln!("Error creating boilerplate directory: {e}");
            std::process::exit(1);
        }
    };
}

fn create_project_metadata(freecodecamp_conf: &Conf, projects: &[Project]) {
    let projects_path = &freecodecamp_conf.config.projects;
    if let Err(e) = std::fs::write(
        projects_path,
        serde_json::to_string_pretty(projects).expect("unable to serialize projects"),
    ) {
        eprintln!("Error writing projects.json file: {e}");
        std::process::exit(1);
    }
}
