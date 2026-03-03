use std::path::PathBuf;
use std::fs;
use parser::CurriculumParser;
use config::{AppConfig, ProjectSummary, ProjectMeta};

pub fn discover_projects(config: &AppConfig) -> Vec<ProjectSummary> {
    tracing::info!("discovering projects from projects.json");
    let mut projects = Vec::new();
    let locale = "english";
    
    let projects_json_path = &config.config.projects;
    tracing::debug!("reading projects.json from: {:?}", projects_json_path);

    let project_metas: Vec<ProjectMeta> = match fs::read_to_string(projects_json_path) {
        Ok(content) => match serde_json::from_str(&content) {
            Ok(metas) => metas,
            Err(e) => {
                tracing::error!("failed to parse projects.json: {e}");
                return projects;
            }
        },
        Err(e) => {
            tracing::error!("failed to read projects.json: {e}");
            return projects;
        }
    };

    if let Some(locale_dir) = config.curriculum.locales.get(locale) {
        let base_path = PathBuf::from(locale_dir);
        
        for meta in project_metas {
            let project_path = base_path.join(format!("{}.md", meta.dashed_name));
            tracing::debug!("parsing project file: {:?}", project_path);
            
            match CurriculumParser::parse_project(&project_path, meta.clone()) {
                Ok(project) => {
                    tracing::info!("discovered project: {} (id: {})", project.title, project.meta.id);
                    projects.push(ProjectSummary {
                        id: project.meta.id,
                        order: project.meta.order,
                        title: project.title,
                        dashed_name: meta.dashed_name,
                        description: project.description,
                        is_integrated: project.meta.is_integrated,
                        is_public: project.meta.is_public,
                        current_lesson: 0,
                        number_of_lessons: project.lessons.len() as u32,
                        is_reset_enabled: project.meta.is_reset_enabled,
                        tags: project.meta.tags,
                        completed_date: None,
                    });
                },
                Err(e) => {
                    tracing::error!("failed to parse project file {project_path:?}: {e:?}");
                }
            }
        }
    } else {
        tracing::error!("locale 'english' not found in config");
    }
    
    // Sort projects by order
    projects.sort_by_key(|p| p.order);
    tracing::info!("discovered {} total projects", projects.len());
    projects
}
