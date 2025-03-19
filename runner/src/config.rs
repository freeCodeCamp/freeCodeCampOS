use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    #[serde(default)]
    pub project: ProjectConfig,
    pub lesson: Lesson,
}

#[derive(Default, Debug, Clone, Serialize, Deserialize)]
pub struct ProjectConfig {
    #[serde(default)]
    pub break_on_failure: bool,
    #[serde(default)]
    pub blocking_tests: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Lesson {
    #[serde(default)]
    pub after_all: Vec<Test>,
    #[serde(default)]
    pub after_each: Vec<Test>,
    #[serde(default)]
    pub before_all: Vec<Test>,
    #[serde(default)]
    pub before_each: Vec<Test>,
    pub id: usize,
    pub tests: Vec<Test>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Test {
    pub code: String,
    pub id: usize,
    pub runner: Runner,
    #[serde(default)]
    pub state: TestState,
    /// Whether or not to run immediately. Runs out of context.
    #[serde(default)]
    pub force: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Runner {
    Node,
    Rust,
    Bash,
    Python,
}

pub trait Script {
    fn new(content: String, config: ProjectConfig) -> Self;
    fn handle_before_all(&mut self, test: &Test);
    fn handle_test(&mut self, test: &Test, before_each: Option<&Test>, after_each: Option<&Test>);
    fn handle_after_all(&mut self, test: &Test);
    fn run(&self) -> Result<(), std::io::Error>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestOut {
    pub id: usize,
    pub state: TestState,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Runout {
    pub id: usize,
    pub error: Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(content = "reason", tag = "condition")]
pub enum TestState {
    /// Test successfully executed
    Passed,
    /// Test failed to execute
    Failed { message: String },
    /// Test started, but was ended before completion
    Cancelled,
    /// Test was not executed
    Neutral,
}

impl Default for TestState {
    fn default() -> Self {
        TestState::Neutral
    }
}
