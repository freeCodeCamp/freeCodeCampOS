//! WebSocket support for real-time updates

use axum::{
    extract::{ws::{Message, WebSocket, WebSocketUpgrade}, State},
    response::IntoResponse,
};
use futures::{sink::SinkExt, stream::StreamExt};
use std::sync::Arc;
use std::io::Write;
use std::process::Command;
use serde::{Deserialize, Serialize};
use tokio::sync::mpsc;
use uuid::Uuid;
use tempfile::NamedTempFile;
use crate::AppState;
use runner::{NodeRunner, BashRunner, PythonRunner, Runner};
use config::ProjectSummary;

#[cfg(unix)]
use std::os::unix::fs::PermissionsExt;

#[derive(Debug, Deserialize)]
pub struct ClientMessage {
    pub event: String,
    pub data: serde_json::Value,
}

#[derive(Debug, Serialize)]
pub struct ServerMessage<T> {
    pub event: String,
    pub data: T,
}

pub async fn ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, state))
}

async fn handle_socket(socket: WebSocket, state: Arc<AppState>) {
    tracing::info!("new websocket connection established");
    let (mut sender, mut receiver) = socket.split();
    let mut rx = state.tx.subscribe();
    
    // Channel for sending messages to the client
    let (tx_out, mut rx_out) = mpsc::channel::<Message>(100);

    // Task to send messages to the client
    let mut sender_task = tokio::spawn(async move {
        while let Some(msg) = rx_out.recv().await {
            if sender.send(msg).await.is_err() {
                tracing::debug!("failed to send message to client, closing sender task");
                break;
            }
        }
    });

    // Send initial data to the client
    {
        tracing::debug!("sending initial project and config data to client");
        let projects = state.projects.read().await;
        let projects_msg = ServerMessage {
            event: "update_projects".to_string(),
            data: &*projects,
        };
        if let Ok(json) = serde_json::to_string(&projects_msg) {
            let _ = tx_out.send(Message::Text(json.into())).await;
        }

        let config_msg = ServerMessage {
            event: "update_freecodecamp_config".to_string(),
            data: &state.config,
        };
        if let Ok(json) = serde_json::to_string(&config_msg) {
            let _ = tx_out.send(Message::Text(json.into())).await;
        }

        // Send current project if it exists
        let cs = state.course_state.read().await;
        if let Some(id) = cs.current_project {
            tracing::info!("restoring session for project id: {}", id);
            drop(cs); // Release read lock
            handle_select_project(&state, &tx_out, id).await;
        }
    }

    let tx_out_clone = tx_out.clone();
    let state_clone = state.clone();

    tokio::select! {
        _ = async {
            while let Ok(msg) = rx.recv().await {
                if msg == "reload:discovery" || msg == "reload:watch" {
                    // Debounce: file watchers often fire multiple events per save.
                    // Wait briefly, then drain any extra reload messages so we
                    // only process one reload (and one test run) per save.
                    // If any drained message is "reload:discovery", upgrade to a full reload.
                    tokio::time::sleep(std::time::Duration::from_millis(300)).await;
                    let mut msg = msg;
                    while let Ok(queued) = rx.try_recv() {
                        if queued == "reload:discovery" {
                            msg = queued;
                        }
                    }

                    if msg == "reload:discovery" {
                        tracing::info!("config/curriculum change detected, reloading projects");

                        // Reload global state from disk
                        let _ = state_clone.load_projects().await;
                        let _ = state_clone.load_course_state().await;

                        // Send updated projects list to client
                        let projects = state_clone.projects.read().await;
                        send_message(&tx_out_clone, "update_projects", &*projects).await;
                        drop(projects);

                        handle_select_project_current(&state_clone, &tx_out_clone).await;
                    } else {
                        // Only auto-run tests for student file changes, not for
                        // config/state writes that the server itself produces.
                        let current_project_id = state_clone.course_state.read().await.current_project;
                        if let Some(project_id) = current_project_id {
                            if let Some(project) = state_clone.get_project(project_id).await {
                                if project.meta.run_tests_on_watch {
                                    tracing::info!("run_tests_on_watch is enabled, auto-running tests");
                                    handle_run_tests(&state_clone, &tx_out_clone).await;
                                }
                            }
                        }
                    }
                }
            }
        } => {},
        _ = async {
            while let Some(Ok(msg)) = receiver.next().await {
                if let Message::Text(text) = msg {
                    if let Ok(client_msg) = serde_json::from_str::<ClientMessage>(&text) {
                        tracing::debug!("received event: {}", client_msg.event);
                        match client_msg.event.as_str() {
                            "connect" => {
                                tracing::debug!("client connected event received");
                            },
                            "request_data" => {
                                if client_msg.data.get("request") == Some(&serde_json::json!("projects")) {
                                    tracing::debug!("client requested projects data");
                                    let projects = state_clone.projects.read().await;
                                    let msg = ServerMessage {
                                        event: "update_projects".to_string(),
                                        data: &*projects,
                                    };
                                    if let Ok(json) = serde_json::to_string(&msg) {
                                        let _ = tx_out_clone.send(Message::Text(json.into())).await;
                                    }
                                }
                            },
                            "select_project" => {
                                let id = client_msg.data.get("id").and_then(|v| v.as_str()).and_then(|v| Uuid::parse_str(v).ok());
                                tracing::info!("client selected project: {:?}", id);
                                if let Some(id) = id {
                                    handle_select_project(&state_clone, &tx_out_clone, id).await;
                                }
                            },
                            "run_tests" => {
                                tracing::info!("client requested test execution");
                                handle_run_tests(&state_clone, &tx_out_clone).await;
                            },
                            "reset_project" => {
                                tracing::info!("client requested project reset");
                                handle_reset_project(&state_clone, &tx_out_clone).await;
                            },
                            "go_to_next_lesson" => {
                                tracing::info!("client navigating to next lesson");
                                handle_change_lesson(&state_clone, &tx_out_clone, 1).await;
                            },
                            "go_to_previous_lesson" => {
                                tracing::info!("client navigating to previous lesson");
                                handle_change_lesson(&state_clone, &tx_out_clone, -1).await;
                            },
                            "change_language" => {
                                if let Some(locale) = client_msg.data.get("locale").and_then(|v| v.as_str()) {
                                    tracing::info!("client changed language to: {}", locale);
                                    let _ = state_clone.update_course_state(|s| {
                                        s.locale = locale.to_string();
                                    }).await;
                                }
                            }
                            "__run-client-code" => {
                                if let Some(code) = client_msg.data.as_str() {
                                    tracing::info!("client requested code execution via __run-client-code");
                                    handle_run_client_code(&tx_out_clone, code).await;
                                }
                            }
                            _ => {
                                tracing::warn!("received unhandled event: {}", client_msg.event);
                            }
                        }
                        // Send RESPONSE to clear debouncer on client
                        send_message(&tx_out_clone, "RESPONSE", serde_json::json!({ "event": client_msg.event })).await;
                    } else {
                        tracing::error!("failed to parse client message: {}", text);
                    }
                } else if let Message::Close(_) = msg {
                    tracing::info!("websocket connection closed by client");
                    break;
                }
            }
        } => {},
        _ = &mut sender_task => {},
    }
    
    tracing::info!("websocket task terminating");
    sender_task.abort();
}

#[derive(Debug, Serialize)]
pub struct ClientTest {
    pub test_id: String,
    pub test_text: String,
    pub passed: bool,
    pub is_loading: bool,
    pub error: Option<config::TestError>,
}

impl From<config::Test> for ClientTest {
    fn from(test: config::Test) -> Self {
        Self {
            test_id: test.id.to_string(),
            test_text: test.test_text,
            passed: matches!(test.state, config::TestState::Passed),
            is_loading: matches!(test.state, config::TestState::Loading),
            error: test.error,
        }
    }
}

async fn handle_select_project(state: &Arc<AppState>, tx: &mpsc::Sender<Message>, project_id: Uuid) {
    tracing::debug!("handling project selection: {}", project_id);
    
    // Only update state if it has changed to prevent recursion during hot-reload
    let changed = {
        let s = state.course_state.read().await;
        s.current_project != Some(project_id)
    };
    if changed {
        if let Err(e) = state.update_course_state(|s| s.current_project = Some(project_id)).await {
            tracing::error!("failed to update course state: {}", e);
        }
    }

    // Load project content and notify client
    if let Some(project) = state.get_project(project_id).await {
        // Find current_lesson and project summary from projects
        let (current_lesson, p_summary) = {
            let projects = state.projects.read().await;
            let summary = projects.iter().find(|p| p.id == project_id).cloned();
            (summary.as_ref().map(|p| p.current_lesson).unwrap_or(0), summary)
        };

        if let Some(p_summary) = p_summary {
            tracing::debug!("sending project update for {}", p_summary.title);
            send_message(tx, "update_project", p_summary).await;
        }

        let lesson = project.lessons.iter().find(|l| l.id == current_lesson)
            .or_else(|| project.lessons.first());

        if let Some(lesson) = lesson {
            tracing::info!("loading lesson: {} - {}", lesson.id, lesson.title);
            let client_tests: Vec<ClientTest> = lesson.tests.clone().into_iter().map(ClientTest::from).collect();
            send_message(tx, "update_lesson", serde_json::json!({
                "lesson_number": lesson.id,
                "description": lesson.description,
                "tests": client_tests,
                "hints": []
            })).await;
        } else {
            tracing::warn!("no lesson found for project id: {}", project_id);
        }
    } else {
        tracing::error!("failed to load project with id: {}", project_id);
    }
}

async fn handle_run_tests(state: &Arc<AppState>, tx: &mpsc::Sender<Message>) {
    let project_id = state.course_state.read().await.current_project;
    if let Some(project_id) = project_id {
        let current_lesson = {
            let projects = state.projects.read().await;
            projects.iter().find(|p| p.id == project_id).map(|p| p.current_lesson).unwrap_or(0)
        };

        tracing::debug!("running tests for project {} lesson {}", project_id, current_lesson);
        if let Some(project) = state.get_project(project_id).await {
            if let Some(lesson) = project.lessons.iter().find(|l| l.id == current_lesson) {
                // Clear previous tests and console
                send_message(tx, "reset_tests", serde_json::json!({})).await;
                send_message(tx, "update_console", serde_json::json!({})).await;

                // Send loading state first
                let loading_tests: Vec<ClientTest> = lesson.tests.iter().map(|t| {
                    let mut lt = ClientTest::from(t.clone());
                    lt.is_loading = true;
                    lt
                }).collect();
                send_message(tx, "update_tests", serde_json::json!({ "tests": loading_tests })).await;

                let hooks = lesson.hooks.clone();
                let project_clone = project.clone();
                let tests_clone = lesson.tests.clone();
                let tx_clone = tx.clone();
                let state_clone = state.clone();
                let lesson_id = lesson.id;

                tokio::spawn(async move {
                    let state_for_runner = state_clone.clone();
                    let results = tokio::task::spawn_blocking(move || -> anyhow::Result<Vec<config::Test>> {
                        let mut results = Vec::new();
                        let node_tests: Vec<_> = tests_clone.iter().filter(|t| matches!(t.runner.as_str(), "node" | "js" | "javascript")).cloned().collect();
                        let bash_tests: Vec<_> = tests_clone.iter().filter(|t| matches!(t.runner.as_str(), "bash" | "sh")).cloned().collect();
                        let python_tests: Vec<_> = tests_clone.iter().filter(|t| matches!(t.runner.as_str(), "python" | "py")).cloned().collect();

                        if !node_tests.is_empty() {
                            let helpers = state_for_runner.config.tooling.as_ref().and_then(|t| t.helpers.as_deref());
                            results.extend(NodeRunner::execute(&project_clone, node_tests, &hooks, helpers)?);
                        }
                        if !bash_tests.is_empty() {
                            results.extend(BashRunner::execute(&project_clone, bash_tests, &hooks, None)?);
                        }
                        if !python_tests.is_empty() {
                            results.extend(PythonRunner::execute(&project_clone, python_tests, &hooks, None)?);
                        }                        Ok(results)
                    }).await;

                    match results {
                        Ok(Ok(results)) => {
                            tracing::info!("test execution finished for lesson {}", lesson_id);
                            let client_tests: Vec<ClientTest> = results.iter().cloned().map(ClientTest::from).collect();
                            send_message(&tx_clone, "update_tests", serde_json::json!({ "tests": client_tests })).await;
                            
                            // Send console updates for failed tests
                            for test in results.iter() {
                                if !matches!(test.state, config::TestState::Passed) {
                                    let ct = ClientTest::from(test.clone());
                                    send_message(&tx_clone, "update_console", serde_json::json!({
                                        "cons": {
                                            "test_id": ct.test_id,
                                            "test_text": ct.test_text,
                                            "passed": ct.passed,
                                            "is_loading": ct.is_loading,
                                            "error": ct.error
                                        }
                                    })).await;
                                }
                            }

                            if !results.is_empty() && results.iter().all(|t| matches!(t.state, config::TestState::Passed)) {
                                tracing::info!("all tests passed for lesson {}, moving to next lesson", lesson_id);
                                handle_change_lesson(&state_clone, &tx_clone, 1).await;
                            } else {
                                tracing::debug!("some tests failed for lesson {}", lesson_id);
                            }
                        }
                        Ok(Err(e)) => {
                            tracing::error!("test execution failed: {}", e);
                            send_message(&tx_clone, "update_error", serde_json::json!({ "error": e.to_string() })).await;
                        }
                        Err(e) => {
                            tracing::error!("task join error: {}", e);
                        }
                    }
                });
            } else {
                tracing::error!("lesson {} not found in project {}", current_lesson, project_id);
            }
        }
    } else {
        tracing::warn!("run-tests called without an active project");
    }
}

async fn handle_reset_project(state: &Arc<AppState>, tx: &mpsc::Sender<Message>) {
    let project_id = state.course_state.read().await.current_project;
    if let Some(project_id) = project_id {
        let current_lesson = {
            let projects = state.projects.read().await;
            projects.iter().find(|p| p.id == project_id).map(|p| p.current_lesson).unwrap_or(0)
        };

        tracing::info!("resetting project {} to lesson {} state", project_id, current_lesson);
        if let Some(project) = state.get_project(project_id).await {
            if let Some(lesson) = project.lessons.iter().find(|l| l.id == current_lesson) {
                if let Some(seed) = &lesson.seed {
                    state.is_seeding.store(true, std::sync::atomic::Ordering::Relaxed);
                    let seed_result = crate::utils::perform_seed(seed, &project.meta.dashed_name).await;
                    state.is_seeding.store(false, std::sync::atomic::Ordering::Relaxed);
                    if let Err(e) = seed_result {
                        tracing::error!("failed to run seed for lesson reset: {}", e);
                        send_message(tx, "update_error", serde_json::json!({ "error": e.to_string() })).await;
                    } else {
                        tracing::info!("seed executed successfully for lesson {}", current_lesson);
                        // Update last_seed state
                        let project_dashed_name = project.meta.dashed_name.clone();
                        let _ = state.update_course_state(|s| {
                            s.last_seed = Some(config::LastSeed {
                                project_dashed_name,
                                lesson_number: current_lesson as i16,
                            });
                        }).await;
                    }
                } else {
                    tracing::debug!("no seed found for lesson {}", current_lesson);
                }
            }
        }
    }
}

async fn handle_change_lesson(state: &Arc<AppState>, tx: &mpsc::Sender<Message>, delta: i32) {
    let project_id = state.course_state.read().await.current_project;
    if let Some(project_id) = project_id {
        let update_res = state.update_projects(|projects: &mut Vec<ProjectSummary>| {
            if let Some(p_summary) = projects.iter_mut().find(|p| p.id == project_id) {
                let new_lesson = (p_summary.current_lesson as i32 + delta).max(0) as u32;
                if new_lesson < p_summary.number_of_lessons {
                    tracing::info!("changing lesson from {} to {}", p_summary.current_lesson, new_lesson);
                    p_summary.current_lesson = new_lesson;
                    return Some((new_lesson, p_summary.clone()));
                }
            }
            None
        }).await;

        match update_res {
            Ok(Some((new_lesson, p_summary_clone))) => {
                if let Some(project) = state.get_project(project_id).await {
                    if let Some(lesson) = project.lessons.iter().find(|l| l.id == new_lesson) {
                        // Check if we should seed this lesson
                        let already_seeded = {
                            let s = state.course_state.read().await;
                            s.last_seed.as_ref().map_or(false, |ls| {
                                ls.project_dashed_name == project.meta.dashed_name && ls.lesson_number == new_lesson as i16
                            })
                        };

                        if project.meta.seed_every_lesson && !already_seeded {
                            tracing::info!("seeding lesson {} because seed_every_lesson is enabled and it was not yet seeded", new_lesson);
                            if let Some(seed) = &lesson.seed {
                                state.is_seeding.store(true, std::sync::atomic::Ordering::Relaxed);
                                let seed_result = crate::utils::perform_seed(seed, &project.meta.dashed_name).await;
                                state.is_seeding.store(false, std::sync::atomic::Ordering::Relaxed);
                                if let Err(e) = seed_result {
                                    tracing::error!("failed to run seed for lesson change: {}", e);
                                    send_message(tx, "update_error", serde_json::json!({ "error": e.to_string() })).await;
                                } else {
                                    // Update last_seed state
                                    let project_dashed_name = project.meta.dashed_name.clone();
                                    let _ = state.update_course_state(|s| {
                                        s.last_seed = Some(config::LastSeed {
                                            project_dashed_name,
                                            lesson_number: new_lesson as i16,
                                        });
                                    }).await;
                                }
                            }
                        }

                        let client_tests: Vec<ClientTest> = lesson.tests.clone().into_iter().map(ClientTest::from).collect();
                        send_message(tx, "update_project", p_summary_clone).await;
                        send_message(tx, "update_lesson", serde_json::json!({
                            "lesson_number": lesson.id,
                            "description": lesson.description,
                            "tests": client_tests,
                            "hints": []
                        })).await;
                    }
                }
            }
            Ok(None) => tracing::warn!("failed to change lesson for project id: {}", project_id),
            Err(e) => tracing::error!("failed to update projects state: {}", e),
        }
    }
}

async fn handle_select_project_current(state: &Arc<AppState>, tx: &mpsc::Sender<Message>) {
    let id = state.course_state.read().await.current_project;
    if let Some(id) = id {
        tracing::debug!("re-selecting current project: {}", id);
        handle_select_project(state, tx, id).await;
    }
}

async fn handle_run_client_code(tx: &mpsc::Sender<Message>, code: &str) {
    if !code.starts_with("#!") {
        send_message(tx, "RESPONSE", serde_json::json!({
            "event": "__run-client-code",
            "error": "Code must start with a shebang (#!), e.g. '#!/usr/bin/env node'"
        })).await;
        return;
    }

    let mut temp_file = match NamedTempFile::new() {
        Ok(file) => file,
        Err(e) => {
            tracing::error!("failed to create temporary file for __run-client-code: {}", e);
            send_message(tx, "RESPONSE", serde_json::json!({
                "event": "__run-client-code",
                "error": format!("Failed to create temporary file: {}", e)
            })).await;
            return;
        }
    };

    if let Err(e) = temp_file.write_all(code.as_bytes()) {
        tracing::error!("failed to write code to temporary file: {}", e);
        send_message(tx, "RESPONSE", serde_json::json!({
            "event": "__run-client-code",
            "error": format!("Failed to write code to temporary file: {}", e)
        })).await;
        return;
    }

    let path = temp_file.path().to_owned();

    #[cfg(unix)]
    {
        if let Ok(metadata) = std::fs::metadata(&path) {
            let mut permissions = metadata.permissions();
            permissions.set_mode(0o755);
            if let Err(e) = std::fs::set_permissions(&path, permissions) {
                tracing::warn!("failed to set executable permissions on temporary file: {}", e);
            }
        }
    }

    // Use spawn_blocking for long running or blocking process execution
    let tx_clone = tx.clone();
    tokio::task::spawn_blocking(move || {
        let output = Command::new(&path)
            .output();

        let runtime = tokio::runtime::Handle::current();
        match output {
            Ok(output) => {
                let stdout = String::from_utf8_lossy(&output.stdout).to_string();
                let stderr = String::from_utf8_lossy(&output.stderr).to_string();
                let exit_code = output.status.code();
                
                runtime.block_on(async {
                    send_message(&tx_clone, "RESPONSE", serde_json::json!({
                        "event": "__run-client-code",
                        "data": {
                            "event": "__run-client-code",
                            "stdout": stdout,
                            "stderr": stderr,
                            "exit_code": exit_code
                        }
                    })).await;
                });
            }
            Err(e) => {
                tracing::error!("failed to execute client code: {}", e);
                runtime.block_on(async {
                    send_message(&tx_clone, "RESPONSE", serde_json::json!({
                        "event": "__run-client-code",
                        "error": format!("Failed to execute code: {}", e)
                    })).await;
                });
            }
        }
    });
}

async fn send_message<T: Serialize>(tx: &mpsc::Sender<Message>, event: &str, data: T) {
    tracing::debug!("sending event to client: {}", event);
    let msg = ServerMessage {
        event: event.to_string(),
        data,
    };
    if let Ok(json) = serde_json::to_string(&msg) {
        if tx.send(Message::Text(json.into())).await.is_err() {
            tracing::error!("failed to send message for event: {}", event);
        }
    }
}
