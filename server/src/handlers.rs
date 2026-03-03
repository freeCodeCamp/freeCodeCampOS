use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use std::sync::Arc;
use parser::CurriculumParser;
use std::path::PathBuf;
use uuid::Uuid;

use crate::AppState;

pub async fn health_check() -> impl axum::response::IntoResponse {
    "OK"
}

pub async fn get_curriculum(
    Path(project_id): Path<String>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    tracing::info!("retrieving curriculum for project: {}", project_id);
    
    let project = state.get_project_by_dashed_name(&project_id).await
        .ok_or_else(|| {
            tracing::error!("project {} not found", project_id);
            (StatusCode::NOT_FOUND, format!("Project {} not found", project_id))
        })?;

    tracing::info!("curriculum retrieved: {}", project.title);
    // Return as JSON
    Ok(Json(serde_json::json!({
        "title": project.title,
        "description": project.description,
        "meta": project.meta,
        "lessons": project.lessons
    })))
}

use runner::execute_tests;
use config::Hooks;

pub async fn run_tests(
    Path((project_id, lesson_id)): Path<(String, u32)>,
    State(state): State<Arc<AppState>>,
    Json(_payload): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    tracing::info!("running tests for project: {}, lesson: {}", project_id, lesson_id);
    // 1. Find and parse project
    let project = state.get_project_by_dashed_name(&project_id).await
        .ok_or_else(|| {
            tracing::error!("project {} not found", project_id);
            (StatusCode::NOT_FOUND, format!("Project {} not found", project_id))
        })?;

    // 2. Find lesson
    let lesson = project.lessons.iter().find(|l| l.id == lesson_id)
        .ok_or_else(|| {
            tracing::error!("lesson {} not found in project {}", lesson_id, project_id);
            (StatusCode::NOT_FOUND, format!("Lesson {} not found", lesson_id))
        })?;

    // 3. Prepare hooks
    let hooks = lesson.hooks.clone();

    // 4. Execute tests
    // Use current directory as work_dir for now
    let work_dir = "."; 
    tracing::debug!("executing {} tests", lesson.tests.len());
    let results = execute_tests(&project, lesson.tests.clone(), &hooks, work_dir)
        .map_err(|e| {
            tracing::error!("failed to execute tests: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to execute tests: {}", e))
        })?;

    tracing::info!("test execution completed with {} results", results.len());

    // Check if all tests passed and advance to next lesson if they did
    let all_passed = results.iter().all(|t| matches!(t.state, config::TestState::Passed));
    if all_passed {
        let _ = state.update_projects(|projects| {
            if let Some(p) = projects.iter_mut().find(|p| p.dashed_name == project_id) {
                if p.current_lesson == lesson_id {
                    let next_lesson = lesson_id + 1;
                    if next_lesson < p.number_of_lessons {
                        tracing::info!("advancing lesson for project {} from {} to {}", project_id, lesson_id, next_lesson);
                        p.current_lesson = next_lesson;
                    }
                }
            }
        }).await;
        // Broadcast reload to notify WebSocket clients
        let _ = state.tx.send("reload".to_string());
    }

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
    tracing::info!("resetting lesson for project: {}, lesson: {}", project_id, lesson_id);
    // 1. Find and parse project
    let project = state.get_project_by_dashed_name(&project_id).await
        .ok_or_else(|| {
            tracing::error!("project {} not found", project_id);
            (StatusCode::NOT_FOUND, format!("Project {} not found", project_id))
        })?;

    // 2. Find lesson
    let lesson = project.lessons.iter().find(|l| l.id == lesson_id)
        .ok_or_else(|| {
            tracing::error!("lesson {} not found in project {}", lesson_id, project_id);
            (StatusCode::NOT_FOUND, format!("Lesson {} not found", lesson_id))
        })?;

    // 3. Run seed if it exists
    if let Some(seed) = &lesson.seed {
        tracing::debug!("running seed for lesson {}", lesson_id);
        // For now, we assume seed is bash commands if it's there.
        // We can use BashRunner to execute it.
        // We need to wrap it in a Test struct for the runner.
        let seed_test = config::Test {
            id: Uuid::new_v4(),
            test_text: "Seed lesson".to_string(),
            code: seed.clone(),
            runner: "bash".to_string(),
            state: Default::default(),
            feedback: None,
        };
        
        let hooks = Hooks::default();
        let work_dir = ".";
        
        execute_tests(&project, vec![seed_test], &hooks, work_dir)
            .map_err(|e| {
                tracing::error!("failed to run seed for lesson {}: {}", lesson_id, e);
                (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to run seed: {}", e))
            })?;
    } else {
        tracing::debug!("no seed found for lesson {}", lesson_id);
    }

    tracing::info!("lesson {} reset successful", lesson_id);
    Ok(Json(serde_json::json!({
        "project": project_id,
        "lesson": lesson_id,
        "status": "reset successful"
    })))
}
