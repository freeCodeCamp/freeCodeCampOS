use std::error::Error;

use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Serialize, Deserialize, Debug)]
pub struct Conf {
    pub version: Version,
    pub port: Option<u32>,
    pub client: Option<Client>,
    pub config: Config,
    pub curriculum: Curriculum,
    #[serde(rename = "hotReload")]
    pub hot_reload: Option<HotReload>,
    pub tooling: Option<Tooling>,
}

#[derive(Debug)]
pub struct Version {
    pub major: u8,
    pub minor: u8,
    pub patch: u8,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Client {
    pub assets: Option<Assets>,
    pub landing: Option<Value>,
    #[serde(rename = "static")]
    pub static_files: Option<Value>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Assets {
    pub header: String,
    pub favicon: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Landing {
    pub title: String,
    pub description: String,
    #[serde(rename = "faq-link")]
    pub faq_link: Option<String>,
    #[serde(rename = "faq-text")]
    pub faq_text: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Config {
    #[serde(rename = "projects.json")]
    pub projects: String,
    #[serde(rename = "state.json")]
    pub state: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Curriculum {
    pub locales: Locales,
    pub assertions: Option<Value>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Locales {
    pub english: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct HotReload {
    pub ignore: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Tooling {
    pub helpers: Option<String>,
    pub plugins: Option<String>,
}

impl TryFrom<&str> for Version {
    type Error = Box<dyn Error>;

    fn try_from(s: &str) -> Result<Self, Self::Error> {
        let mut split = s.split('.');
        let major = split.next().unwrap().parse::<u8>()?;
        let minor = split.next().unwrap().parse::<u8>()?;
        let patch = split.next().unwrap().parse::<u8>()?;
        Ok(Version {
            major,
            minor,
            patch,
        })
    }
}

impl Serialize for Version {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        format!("{}.{}.{}", self.major, self.minor, self.patch).serialize(serializer)
    }
}

impl<'a> Deserialize<'a> for Version {
    fn deserialize<D>(deserializer: D) -> Result<Version, D::Error>
    where
        D: serde::Deserializer<'a>,
    {
        let s: &str = serde::Deserialize::deserialize(deserializer)?;
        Version::try_from(s).map_err(serde::de::Error::custom)
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Project {
    pub id: u16,
    #[serde(rename = "dashedName")]
    pub dashed_name: String,
    #[serde(rename = "isIntegrated", default = "default_false")]
    pub is_integrated: bool,
    #[serde(rename = "isPublic", default = "default_true")]
    pub is_public: bool,
    #[serde(rename = "currentLesson", default = "default_0")]
    pub current_lesson: u16,
    #[serde(rename = "runTestsOnWatch", default = "default_false")]
    pub run_tests_on_watch: bool,
    #[serde(rename = "seedEveryLesson", default = "default_false")]
    pub seed_every_lesson: bool,
    #[serde(rename = "isResetEnabled", default = "default_false")]
    pub is_reset_enabled: bool,
    #[serde(rename = "numberofLessons", default = "default_1")]
    pub number_of_lessons: u16,
    #[serde(rename = "blockingTests", default = "default_false")]
    pub blocking_tests: bool,
    #[serde(rename = "breakOnFailure", default = "default_false")]
    pub break_on_failure: bool,
}

fn default_false() -> bool {
    false
}

fn default_true() -> bool {
    true
}

fn default_1() -> u16 {
    1
}

fn default_0() -> u16 {
    0
}

#[derive(Serialize, Deserialize, Debug)]
pub struct State {
    #[serde(rename = "currentProject")]
    /// The current project the user is working on as a `String` or `Value::Null`
    pub current_project: Value,
    pub locale: String,
    #[serde(rename = "lastSeed")]
    pub last_seed: Option<LastSeed>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct LastSeed {
    #[serde(rename = "projectDashedName")]
    pub project_dashed_name: Value,
    #[serde(rename = "lessonNumber")]
    /// The lesson number last seeded
    ///
    /// Can be -1, because lessons start at 0, and -1 is used to indicate that no lesson has been seeded
    pub lesson_number: i16,
}
