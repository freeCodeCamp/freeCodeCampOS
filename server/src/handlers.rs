use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use std::sync::Arc;

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

use runner::{NodeRunner, BashRunner, Runner};

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
    tracing::debug!("executing {} tests", lesson.tests.len());
    
    let mut results = Vec::new();
    let node_tests: Vec<_> = lesson.tests.iter().filter(|t| matches!(t.runner.as_str(), "node" | "js" | "javascript")).cloned().collect();
    let bash_tests: Vec<_> = lesson.tests.iter().filter(|t| matches!(t.runner.as_str(), "bash" | "sh")).cloned().collect();

    if !node_tests.is_empty() {
        let helpers = state.config.tooling.as_ref().and_then(|t| t.helpers.as_deref());
        results.extend(NodeRunner::execute(&project, node_tests, &hooks, helpers)
            .map_err(|e| {
                tracing::error!("failed to execute node tests: {}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to execute node tests: {}", e))
            })?);
    }
    if !bash_tests.is_empty() {
        results.extend(BashRunner::execute(&project, bash_tests, &hooks, None)
            .map_err(|e| {
                tracing::error!("failed to execute bash tests: {}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to execute bash tests: {}", e))
            })?);
    }

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
        crate::utils::perform_seed(seed).await
            .map_err(|e| {
                tracing::error!("failed to run seed for lesson {}: {}", lesson_id, e);
                (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to run seed: {}", e))
            })?;
        
        // Update last_seed state
        let project_dashed_name = project.meta.dashed_name.clone();
        if let Err(e) = state.update_course_state(|s| {
            s.last_seed = Some(config::LastSeed {
                project_dashed_name,
                lesson_number: lesson_id as i16,
            });
        }).await {
            tracing::error!("failed to update course state after seed: {}", e);
        }
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
