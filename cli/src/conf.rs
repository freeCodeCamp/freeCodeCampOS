use std::error::Error;

use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Serialize, Deserialize, Debug)]
pub struct Conf {
    pub version: Version,
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
    pub landing: Option<Landing>,
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
    pub title: String,
    pub dashed_name: String,
    pub is_integrated: Option<bool>,
    pub description: String,
    pub is_public: Option<bool>,
    pub current_lesson: u16,
    pub run_tests_on_watch: Option<bool>,
    pub seed_every_lesson: Option<bool>,
    pub is_reset_enabled: Option<bool>,
    pub number_of_lessons: Option<u16>,
    pub blocking_tests: Option<bool>,
    pub break_on_failure: Option<bool>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct State {
    /// The current project the user is working on as a `String` or `Value::Null`
    pub current_project: Value,
    pub locale: String,
    pub last_seed: Option<LastSeed>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct LastSeed {
    pub project_dashed_name: Value,
    /// The lesson number last seeded
    ///
    /// Can be -1, because lessons start at 0, and -1 is used to indicate that no lesson has been seeded
    pub lesson_number: i16,
}
