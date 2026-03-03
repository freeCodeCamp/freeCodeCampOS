use config::{AppConfig, CourseState, ProjectSummary};
use tokio::sync::{broadcast, RwLock};
use uuid::Uuid;

#[derive(Debug)]
pub struct AppState {
    pub config: AppConfig,
    pub tx: broadcast::Sender<String>,
    pub course_state: RwLock<CourseState>,
    pub projects: RwLock<Vec<ProjectSummary>>,
}

impl AppState {
    pub fn new(config: AppConfig) -> Self {
        let (tx, _) = broadcast::channel(100);
        
        // Use first locale as default if available
        let locale = config.curriculum.locales.keys().next().cloned().unwrap_or_else(|| "english".to_string());
        
        Self {
            config,
            tx,
            course_state: RwLock::new(CourseState {
                locale,
                ..Default::default()
            }),
            projects: RwLock::new(Vec::new()),
        }
    }

    pub async fn load_projects(&self) -> anyhow::Result<()> {
        tracing::info!("discovering projects from curriculum");
        let discovered = crate::projects::discover_projects(&self.config);
        
        let mut p = self.projects.write().await;
        let cs = self.course_state.write().await;
        
        *p = discovered.into_iter().map(|mut summary| {
            if let Some(&lesson) = cs.current_lessons.get(&summary.id) {
                summary.current_lesson = lesson;
            }
            summary
        }).collect();
        
        Ok(())
    }

    pub async fn load_course_state(&self) -> anyhow::Result<()> {
        let state_path = std::path::PathBuf::from(&self.config.config.state);
        if state_path.exists() {
            tracing::info!("loading course state from {:?}", state_path);
            let content = std::fs::read_to_string(state_path)?;
            let state: CourseState = serde_json::from_str(&content)?;
            let mut s = self.course_state.write().await;
            *s = state;
        } else {
            tracing::warn!("course state file not found at {:?}", state_path);
        }
        Ok(())
    }

    pub async fn update_projects<F, R>(&self, f: F) -> anyhow::Result<R>
    where
        F: FnOnce(&mut Vec<ProjectSummary>) -> R,
    {
        let res = {
            let mut p = self.projects.write().await;
            f(&mut p)
        };
        // Sync with course state for persistence
        let projects = self.projects.read().await;
        let mut cs = self.course_state.write().await;
        for p in projects.iter() {
            cs.current_lessons.insert(p.id, p.current_lesson);
        }
        drop(cs);
        self.save_course_state().await?;
        Ok(res)
    }

    pub async fn update_course_state<F, R>(&self, f: F) -> anyhow::Result<R>
    where
        F: FnOnce(&mut CourseState) -> R,
    {
        let res = {
            let mut s = self.course_state.write().await;
            f(&mut s)
        };
        self.save_course_state().await?;
        Ok(res)
    }

    pub async fn get_project(&self, project_id: Uuid) -> Option<config::Project> {
        let (locale, dashed_name) = {
            let cs = self.course_state.read().await;
            let projects = self.projects.read().await;
            let p = projects.iter().find(|p| p.id == project_id)?;
            (cs.locale.clone(), p.dashed_name.clone())
        };

        let locale_dir = self.config.curriculum.locales.get(&locale)?;
        let project_path = std::path::PathBuf::from(locale_dir).join(format!("{}.md", dashed_name));

        if !project_path.exists() {
            tracing::error!("project file not found at {:?}", project_path);
            return None;
        }

        match parser::CurriculumParser::parse_project(&project_path) {
            Ok(p) => Some(p),
            Err(e) => {
                tracing::error!("failed to parse project file at {:?}", project_path);
                eprintln!("{e:?}");
                None
            }
        }
    }

    pub async fn save_course_state(&self) -> anyhow::Result<()> {
        let state_path = std::path::PathBuf::from(&self.config.config.state);
        tracing::debug!("saving course state to {:?}", state_path);
        let content = {
            let state = self.course_state.read().await;
            serde_json::to_string_pretty(&*state)?
        };
        std::fs::write(state_path, content)?;
        Ok(())
    }
}
