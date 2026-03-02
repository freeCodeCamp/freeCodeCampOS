use std::path::PathBuf;
use std::fs;
use parser::CurriculumParser;
use config::AppConfig;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectSummary {
    pub id: u32,
    pub title: String,
    pub dashed_name: String,
    pub description: String,
    pub is_integrated: bool,
    pub is_public: bool,
    pub current_lesson: u32,
    pub number_of_lessons: u32,
    pub is_reset_enabled: bool,
    pub tags: Vec<String>,
}

pub fn discover_projects(config: &AppConfig) -> Vec<ProjectSummary> {
    tracing::info!("discovering projects");
    let mut projects = Vec::new();
    let locale = "english";
    
    if let Some(locale_dir) = config.curriculum.locales.get(locale) {
        let path = PathBuf::from(locale_dir);
        tracing::debug!("looking for project files in locale directory: {:?}", path);
        if let Ok(entries) = fs::read_dir(&path) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.extension().and_then(|s| s.to_str()) == Some("md") {
                    tracing::debug!("found markdown file: {:?}", path);
                    if let Ok(content) = fs::read_to_string(&path) {
                        match CurriculumParser::parse_project(&content) {
                            Ok(project) => {
                                let dashed_name = path.file_stem()
                                    .and_then(|s| s.to_str())
                                    .unwrap_or("unknown")
                                    .to_string();
                                
                                tracing::info!("discovered project: {} (id: {})", project.title, project.meta.id);
                                projects.push(ProjectSummary {
                                    id: project.meta.id,
                                    title: project.title,
                                    dashed_name,
                                    description: project.description,
                                    is_integrated: project.meta.is_integrated,
                                    is_public: project.meta.is_public,
                                    current_lesson: 0,
                                    number_of_lessons: project.lessons.len() as u32,
                                    is_reset_enabled: project.meta.is_reset_enabled,
                                    tags: Vec::new(),
                                });
                            },
                            Err(e) => tracing::error!("failed to parse project file at {:?}: {}", path, e),
                        }
                    } else {
                        tracing::error!("failed to read project file at {:?}", path);
                    }
                }
            }
        } else {
            tracing::error!("failed to read locale directory: {:?}", path);
        }
    } else {
        tracing::error!("locale 'english' not found in config");
    }
    
    // Sort projects by ID
    projects.sort_by_key(|p| p.id);
    tracing::info!("discovered {} total projects", projects.len());
    projects
}
