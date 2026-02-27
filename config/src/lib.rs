//! Shared configuration types for freeCodeCampOS

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Main application configuration
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct AppConfig {
    pub version: String,
    pub port: u16,
    pub client: ClientConfig,
    pub curriculum: CurriculumConfig,
    pub hot_reload: Option<HotReloadConfig>,
}

/// Client configuration
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ClientConfig {
    pub assets: ClientAssets,
    pub landing: HashMap<String, LandingConfig>,
    pub static_paths: HashMap<String, String>,
}

/// Client assets
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ClientAssets {
    pub header: String,
    pub favicon: String,
}

/// Landing page configuration per locale
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LandingConfig {
    pub title: String,
    pub description: String,
    pub faq_link: String,
    pub faq_text: String,
}

/// Curriculum configuration
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct CurriculumConfig {
    pub locales: HashMap<String, String>,
    pub assertions: HashMap<String, String>,
}

/// Hot reload configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HotReloadConfig {
    pub ignore: Vec<String>,
}

/// Project metadata embedded in markdown
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ProjectMeta {
    pub id: u32,
    #[serde(rename = "isIntegrated")]
    pub is_integrated: bool,
    #[serde(rename = "is_public")]
    pub is_public: bool,
    #[serde(rename = "runTestsOnWatch")]
    pub run_tests_on_watch: bool,
    #[serde(rename = "seedEveryLesson")]
    pub seed_every_lesson: bool,
    #[serde(rename = "isResetEnabled")]
    pub is_reset_enabled: bool,
    #[serde(rename = "numberofLessons")]
    pub number_of_lessons: Option<u32>,
    #[serde(rename = "blockingTests")]
    pub blocking_tests: Option<bool>,
    #[serde(rename = "breakOnFailure")]
    pub break_on_failure: Option<bool>,
}

/// A lesson within a project
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Lesson {
    pub id: u32,
    pub title: String,
    pub description: String,
    pub tests: Vec<Test>,
    pub seed: Option<String>,
    pub before_each: Option<String>,
    pub after_each: Option<String>,
    pub before_all: Option<String>,
    pub after_all: Option<String>,
}

/// A test that runs for a lesson
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Test {
    pub id: u32,
    pub code: String,
    pub runner: String,
    #[serde(default)]
    pub state: TestState,
}

/// Current state of a test
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "UPPERCASE")]
pub enum TestState {
    #[default]
    Neutral,
    Passed,
    Failed,
}

impl TestState {
    pub fn with_content(self, content: impl Into<String>) -> TestStateWithContent {
        TestStateWithContent {
            kind: self,
            content: content.into(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestStateWithContent {
    pub kind: TestState,
    pub content: String,
}

/// A parsed project
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub meta: ProjectMeta,
    pub title: String,
    pub description: String,
    pub lessons: Vec<Lesson>,
}

/// Hook definitions for tests
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct Hooks {
    pub before_all: Option<String>,
    pub after_all: Option<String>,
    pub before_each: Option<String>,
    pub after_each: Option<String>,
}

/// Test manifest for execution
#[derive(Debug, Serialize, Deserialize)]
pub struct Manifest {
    pub project_path: String,
    pub hooks_path: String,
    pub test_paths: Vec<String>,
}
