use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use std::sync::Arc;
use freecodecamp_parser::CurriculumParser;
use std::fs;
use std::path::PathBuf;

use crate::AppState;

pub async fn health_check() -> impl axum::response::IntoResponse {
    "OK"
}

pub async fn get_curriculum(
    Path(project_id): Path<String>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    // Find project file path from config
    // For now we use english locale and look in the directory from config
    let locale = "english";
    let locale_dir = state.config.curriculum.locales.get(locale)
        .ok_or((StatusCode::NOT_FOUND, "Locale not found".to_string()))?;
    
    let project_path = PathBuf::from(locale_dir).join(format!("{}.md", project_id));
    
    if !project_path.exists() {
        return Err((StatusCode::NOT_FOUND, format!("Project file not found at {:?}", project_path)));
    }

    let content = fs::read_to_string(&project_path)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to read file: {}", e)))?;

    let parsed = CurriculumParser::parse_project(&content)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to parse project: {}", e)))?;

    // Return as JSON
    Ok(Json(serde_json::json!({
        "title": parsed.title,
        "description": parsed.description,
        "meta": parsed.meta,
        "lessons": parsed.lessons
    })))
}

use freecodecamp_runner::execute_tests;
use freecodecamp_config::Hooks;

pub async fn run_tests(
    Path((project_id, lesson_id)): Path<(String, u32)>,
    State(state): State<Arc<AppState>>,
    Json(_payload): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    // 1. Find and parse project
    let locale = "english";
    let locale_dir = state.config.curriculum.locales.get(locale)
        .ok_or((StatusCode::NOT_FOUND, "Locale not found".to_string()))?;
    
    let project_path = PathBuf::from(locale_dir).join(format!("{}.md", project_id));
    
    if !project_path.exists() {
        return Err((StatusCode::NOT_FOUND, format!("Project file not found at {:?}", project_path)));
    }

    let content = fs::read_to_string(&project_path)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to read file: {}", e)))?;

    let project = CurriculumParser::parse_project(&content)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to parse project: {}", e)))?;

    // 2. Find lesson
    let lesson = project.lessons.iter().find(|l| l.id == lesson_id)
        .ok_or((StatusCode::NOT_FOUND, format!("Lesson {} not found", lesson_id)))?;

    // 3. Prepare hooks
    let hooks = Hooks {
        before_all: lesson.before_all.clone(),
        after_all: lesson.after_all.clone(),
        before_each: lesson.before_each.clone(),
        after_each: lesson.after_each.clone(),
    };

    // 4. Execute tests
    // Use current directory as work_dir for now
    let work_dir = "."; 
    let results = execute_tests(&project, lesson.tests.clone(), &hooks, work_dir)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to execute tests: {}", e)))?;

    Ok(Json(serde_json::json!({
        "project": project_id,
        "lesson": lesson_id,
        "tests": results
    })))
}

pub async fn reset_lesson(
    Path((project_id, lesson_id)): Path<(String, u32)>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    // 1. Find and parse project
    let locale = "english";
    let locale_dir = state.config.curriculum.locales.get(locale)
        .ok_or((StatusCode::NOT_FOUND, "Locale not found".to_string()))?;
    
    let project_path = PathBuf::from(locale_dir).join(format!("{}.md", project_id));
    
    if !project_path.exists() {
        return Err((StatusCode::NOT_FOUND, format!("Project file not found at {:?}", project_path)));
    }

    let content = fs::read_to_string(&project_path)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to read file: {}", e)))?;

    let project = CurriculumParser::parse_project(&content)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to parse project: {}", e)))?;

    // 2. Find lesson
    let lesson = project.lessons.iter().find(|l| l.id == lesson_id)
        .ok_or((StatusCode::NOT_FOUND, format!("Lesson {} not found", lesson_id)))?;

    // 3. Run seed if it exists
    if let Some(seed) = &lesson.seed {
        // For now, we assume seed is bash commands if it's there.
        // We can use BashRunner to execute it.
        // We need to wrap it in a Test struct for the runner.
        let seed_test = freecodecamp_config::Test {
            id: 0,
            code: seed.clone(),
            runner: "bash".to_string(),
            state: Default::default(),
        };
        
        let hooks = Hooks::default();
        let work_dir = ".";
        
        execute_tests(&project, vec![seed_test], &hooks, work_dir)
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to run seed: {}", e)))?;
    }

    Ok(Json(serde_json::json!({
        "project": project_id,
        "lesson": lesson_id,
        "status": "reset successful"
    })))
}
