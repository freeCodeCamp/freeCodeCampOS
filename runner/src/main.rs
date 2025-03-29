use config::{Config, Runner, Script, Test};
use node::NodeFile;
use python::PythonFile;
use std::io::Read;

mod config;
mod node;
mod python;
mod utils;

const NODE_SCRIPT: &str = include_str!("../scripts/node.js");
const PYTHON_SCRIPT: &str = include_str!("../scripts/python.py");

fn main() {
    let mut stdin = std::io::stdin();
    let mut buffer = String::new();

    stdin.read_to_string(&mut buffer).unwrap();

    let config: Config = serde_json::from_str(&buffer).unwrap();
    let lesson = config.lesson;

    let mut node_file = NodeFile::new(NODE_SCRIPT.to_string(), config.project.clone());
    let mut python_file = PythonFile::new(PYTHON_SCRIPT.to_string(), config.project.clone());

    for before_all in lesson.before_all {
        match before_all {
            Test {
                runner: Runner::Node,
                ..
            } => {
                node_file.handle_before_all(&before_all);
            }
            Test {
                runner: Runner::Python,
                ..
            } => {
                python_file.handle_before_all(&before_all);
            }
            Test { runner, .. } => {
                unimplemented!("Invalid runner ({runner:?}) for `before_all`")
            }
        }
    }

    for test in lesson.tests {
        match test.runner {
            Runner::Node => {
                let before_each = lesson
                    .before_each
                    .iter()
                    .find(|test| test.runner == Runner::Node);

                let after_each = lesson
                    .after_each
                    .iter()
                    .find(|test| test.runner == Runner::Node);
                node_file.handle_test(&test, before_each, after_each);
            }
            Runner::Python => {
                let before_each = lesson
                    .before_each
                    .iter()
                    .find(|test| test.runner == Runner::Python);

                let after_each = lesson
                    .after_each
                    .iter()
                    .find(|test| test.runner == Runner::Python);
                python_file.handle_test(&test, before_each, after_each);
            }
            _ => {
                unimplemented!("Invalid runner ({:?}) for `test`", test.runner)
            }
        }
    }

    for after_all in lesson.after_all {
        match after_all {
            Test {
                runner: Runner::Node,
                ..
            } => {
                node_file.handle_after_all(&after_all);
            }
            Test {
                runner: Runner::Python,
                ..
            } => {
                python_file.handle_after_all(&after_all);
            }
            Test { runner, .. } => {
                unimplemented!("Invalid runner ({runner:?}) for `after_all`")
            }
        }
    }

    let _node_res = node_file.run();
    let _python_res = python_file.run();
}
