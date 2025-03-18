use std::{
    io::{BufRead, BufReader},
    process::Stdio,
    sync::{Arc, Mutex},
    thread,
};

use crate::config::{ProjectConfig, Runner, Runout, Script, Test, TestOut, TestState};

#[derive(Debug)]
pub struct NodeFile {
    pub content: String,
    pub config: ProjectConfig,
}

impl Script for NodeFile {
    fn handle_before_all(&mut self, test: &Test) {
        let before_all_str = "// --runner-end-before_all--";
        let idx = self
            .content
            .find(before_all_str)
            .expect(&format!("string '{before_all_str}' should exist"));

        match test {
            Test {
                runner: Runner::Node,
                code,
                ..
            } => {
                self.content.insert_str(idx, &format!("{code}\n  "));
            }
            _ => {
                unimplemented!("Seed for {self:?} must be a file or Runner::Node.")
            }
        }
    }

    fn handle_test(&mut self, test: &Test, before_each: Option<&Test>, after_each: Option<&Test>) {
        let test_function_str = "// --runner-end-test_functions--";
        let idx = self
            .content
            .find(test_function_str)
            .expect(&format!("string '{test_function_str}' should exist"));

        let before_each = match before_each {
            Some(Test {
                runner: Runner::Node,
                code,
                ..
            }) => code,
            _ => "",
        };

        let after_each = match after_each {
            Some(Test {
                runner: Runner::Node,
                code,
                ..
            }) => code,
            _ => "",
        };

        let test_id = test.id;
        let test_code = &test.code;

        let function = format!(
            "
    async function test_{test_id}() {{
        // --debug-before_each--
        {before_each}
        {test_code}
        // --debug-after_each--
        {after_each}

        console.log(JSON.stringify({{
            id: {test_id},
            error: null,
        }}));
    }}
"
        );

        self.content.insert_str(idx, &format!("{function}\n"));
        match self.config {
            ProjectConfig {
                blocking_tests: true,
                break_on_failure: true,
            } => {
                todo!()
            }
            ProjectConfig {
                blocking_tests: false,
                break_on_failure: false,
            } => {
                let tests_str = "// --runner-end-tests--";
                let idx = self
                    .content
                    .find(tests_str)
                    .expect(&format!("string '{tests_str}' should exist"));
                let call = format!("settled.push(test_{}());", test.id);

                self.content.insert_str(idx, &format!("{call}\n  "));
            }
            ProjectConfig {
                blocking_tests: true,
                break_on_failure: false,
            } => {
                let tests_str = "// --runner-end-tests-blocking_tests";
                let idx = self
                    .content
                    .find(tests_str)
                    .expect(&format!("string '{tests_str}' should exist"));

                let test_id = test.id;
                let call = format!(
                    "
    try {{
      await test_{test_id}();
    }} catch (e) {{
      handle_error(e, {test_id});
    }}
",
                );

                self.content.insert_str(idx, &format!("{call}\n  "));
            }
            ProjectConfig {
                blocking_tests: false,
                break_on_failure: true,
            } => {
                todo!()
            }
        }
    }

    fn handle_after_all(&mut self, test: &Test) {
        let after_all_str = "// --runner-end-after_all--";
        let idx = self
            .content
            .find(after_all_str)
            .expect(&format!("string '{after_all_str}' should exist"));

        match test {
            Test {
                runner: Runner::Node,
                code,
                ..
            } => {
                self.content.insert_str(idx, &format!("{code}\n"));
            }
            _ => {
                unimplemented!("Seed for {self:?} must be a file or Runner::Node.")
            }
        }
    }

    fn run(&self) -> Result<(), std::io::Error> {
        let mut child = std::process::Command::new("node")
            .arg("-e")
            .arg(&self.content)
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
                        eprintln!("Error reading stdout: {}", e);
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
                        eprintln!("Error reading stderr: {}", e);
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
        NodeFile { content, config }
    }
}
