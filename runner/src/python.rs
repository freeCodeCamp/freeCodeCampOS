use std::{
    io::{BufRead, BufReader, Write},
    process::Stdio,
    sync::{Arc, Mutex},
    thread,
};

use tempfile::NamedTempFile;

use crate::config::{ProjectConfig, Runner, Runout, Script, Test, TestOut, TestState};

#[derive(Debug)]
pub struct PythonFile {
    pub content: String,
    pub config: ProjectConfig,
}

impl Script for PythonFile {
    fn handle_before_all(&mut self, test: &Test) {
        let before_all_str = "# --runner-end-before_all--";
        let idx = self
            .content
            .find(before_all_str)
            .expect(&format!("string '{before_all_str}' should exist"));

        match test {
            Test {
                runner: Runner::Python,
                code,
                ..
            } => {
                self.content.insert_str(idx, &format!("{code}\n{:4}", " "));
            }
            _ => {
                unimplemented!("Test for {self:?} must be a file or Runner::Python.")
            }
        }
    }

    fn handle_test(&mut self, test: &Test, before_each: Option<&Test>, after_each: Option<&Test>) {
        let test_function_str = "# --runner-end-test_functions--";
        let idx = self
            .content
            .find(test_function_str)
            .expect(&format!("string '{test_function_str}' should exist"));

        let before_each = match before_each {
            Some(Test {
                runner: Runner::Python,
                code,
                ..
            }) => code,
            _ => "",
        }
        .replace("\n", "\n        ");

        let after_each = match after_each {
            Some(Test {
                runner: Runner::Python,
                code,
                ..
            }) => code,
            _ => "",
        }
        .replace("\n", "\n        ");

        let test_id = test.id;
        let test_code = &test.code.replace("\n", "\n        ");

        let function = format!(
            "
    def test_{test_id}():
        # --debug-before_each--
        {before_each}
        {test_code}
        # --debug-after_each--
        {after_each}

        print('{{\"id\": {test_id}, \"error\": null}}')
",
        );

        self.content.insert_str(idx, &format!("{function}\n"));
        match self.config {
            ProjectConfig {
                blocking_tests: false,
                ..
            } => {
                unimplemented!("all tests must be blocking if the Python runner is used")
            }
            ProjectConfig {
                break_on_failure: false,
                ..
            } => {
                let tests_str = "# --runner-end-tests--";
                let idx = self
                    .content
                    .find(tests_str)
                    .expect(&format!("string '{tests_str}' should exist"));

                let test_id = test.id;
                let call = format!(
                    "
    try:
        test_{test_id}()
    except Exception as e:
        handle_error(e, {test_id})
"
                );

                self.content.insert_str(idx, &format!("{call}\n{:4}", " "));
            }
            ProjectConfig {
                break_on_failure: true,
                ..
            } => {
                let _tests_str = "# --runner-end-tests-break_on_failure--";
                todo!()
            }
        }
    }

    fn handle_after_all(&mut self, test: &Test) {
        let after_all_str = "# --runner-end-after_all--";
        let idx = self
            .content
            .find(after_all_str)
            .expect(&format!("string '{after_all_str}' should exist"));

        match test {
            Test {
                runner: Runner::Python,
                code,
                ..
            } => {
                self.content.insert_str(idx, &format!("{code}\n"));
            }
            _ => {
                unimplemented!("Seed for {self:?} must be a file or Runner::Python.")
            }
        }
    }

    fn run(&self) -> Result<(), std::io::Error> {
        let mut file = NamedTempFile::with_suffix(".py").unwrap();
        file.write_all(&self.content.as_bytes()).unwrap();
        let mut child = std::process::Command::new("python3")
            .arg(file.path().to_str().unwrap())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()?;

        let stdout = child.stdout.take().unwrap();
        let stdout = Arc::new(Mutex::new(BufReader::new(stdout)));
        let stderr = child.stderr.take().unwrap();
        let stderr = Arc::new(Mutex::new(BufReader::new(stderr)));

        let stdout_clone = Arc::clone(&stdout);
        let stdout_handle = thread::spawn(move || {
            let mut reader = stdout_clone.lock().unwrap();
            let mut line = String::new();
            loop {
                line.clear();
                match reader.read_line(&mut line) {
                    Ok(0) => break,
                    Ok(_) => {
                        if let Ok(runout) = serde_json::from_str::<Runout>(&line) {
                            // Test passed
                            let test_out: TestOut = TestOut {
                                id: runout.id,
                                state: TestState::Passed,
                            };
                            println!("{}", serde_json::to_string(&test_out).unwrap());
                        } else {
                            // STDOUT from process
                            println!("{}", line.trim());
                        }
                    }
                    Err(e) => {
                        println!("Error reading stdout: {}", e);
                        break;
                    }
                }
            }
        });

        let stderr_clone = Arc::clone(&stderr);
        let stderr_handle = thread::spawn(move || {
            let mut reader = stderr_clone.lock().unwrap();
            let mut line = String::new();
            loop {
                line.clear();
                match reader.read_line(&mut line) {
                    Ok(0) => break,
                    Ok(_) => {
                        if let Ok(runout) = serde_json::from_str::<Runout>(&line) {
                            // Test failed
                            let test_out: TestOut = TestOut {
                                id: runout.id,
                                state: TestState::Failed {
                                    message: runout.error.to_string(),
                                },
                            };
                            println!("{}", serde_json::to_string(&test_out).unwrap());
                        } else {
                            // STDERR from process
                            println!("{}", line.trim());
                        }
                    }
                    Err(e) => {
                        println!("Error reading stderr: {}", e);
                        break;
                    }
                }
            }
        });

        let handles = vec![stdout_handle, stderr_handle];

        for handle in handles {
            handle.join().unwrap();
        }

        Ok(())
    }

    fn new(content: String, config: ProjectConfig) -> Self {
        PythonFile { content, config }
    }
}
