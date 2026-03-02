//! Shared configuration types for freeCodeCampOS

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

/// Main application configuration
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct AppConfig {
    pub version: String,
    pub port: u16,
    pub client: ClientConfig,
    pub curriculum: CurriculumConfig,
    pub config: Config,
    pub hot_reload: Option<HotReloadConfig>,
}

/// Paths to course configuration and state files
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct Config {
    #[serde(rename = "projects.json")]
    pub projects: String,
    #[serde(rename = "state.json")]
    pub state: String,
}

/// Course state saved to `state.json`
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CourseState {
    pub current_project: Option<Uuid>,
    pub locale: String,
    pub last_seed: Option<LastSeed>,
    #[serde(default)]
    pub current_lessons: HashMap<Uuid, u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LastSeed {
    pub project_dashed_name: String,
    pub lesson_number: i16,
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
    pub id: Uuid,
    pub order: u32,
    #[serde(default)]
    pub is_integrated: bool,
    #[serde(default)]
    pub is_public: bool,
    #[serde(default)]
    pub run_tests_on_watch: bool,
    #[serde(default)]
    pub seed_every_lesson: bool,
    #[serde(default)]
    pub is_reset_enabled: bool,
    pub number_of_lessons: Option<u32>,
    pub blocking_tests: Option<bool>,
    pub break_on_failure: Option<bool>,
    #[serde(default)]
    pub tags: Vec<String>,
}

/// A summary of a project for listing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectSummary {
    pub id: Uuid,
    pub order: u32,
    pub title: String,
    pub dashed_name: String,
    pub description: String,
    pub is_integrated: bool,
    pub is_public: bool,
    pub current_lesson: u32,
    pub number_of_lessons: u32,
    pub is_reset_enabled: bool,
    pub tags: Vec<String>,
    pub completed_date: Option<u64>,
}

/// A lesson within a project
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Lesson {
    pub id: u32,
    pub title: String,
    pub description: String,
    pub tests: Vec<Test>,
    pub seed: Option<String>,
    pub hooks: Hooks,
}

/// A test that runs for a lesson
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Test {
    pub id: Uuid,
    pub test_text: String,
    pub code: String,
    pub runner: String,
    #[serde(default)]
    pub state: TestState,
    pub feedback: Option<String>,
}

/// Current state of a test
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
#[serde(rename_all = "UPPERCASE")]
pub enum TestState {
    #[default]
    Neutral,
    Loading,
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
    pub before_all: HashMap<String, String>,
    pub after_all: HashMap<String, String>,
    pub before_each: HashMap<String, String>,
    pub after_each: HashMap<String, String>,
}

/// Test manifest for execution
#[derive(Debug, Serialize, Deserialize)]
pub struct Manifest {
    pub project_path: String,
    pub hooks_path: String,
    pub test_paths: Vec<String>,
}
