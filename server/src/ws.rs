//! WebSocket support for real-time updates

use axum::{
    extract::{ws::{Message, WebSocket, WebSocketUpgrade}, State},
    response::IntoResponse,
};
use futures::{sink::SinkExt, stream::StreamExt};
use std::sync::Arc;
use serde::{Deserialize, Serialize};
use tokio::sync::mpsc;
use crate::AppState;
use runner::execute_tests;
use config::Hooks;

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
                if msg == "reload" {
                    tracing::info!("hot-reload triggered, refreshing client state");
                    handle_select_project_current(&state_clone, &tx_out_clone).await;
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
                                let id = client_msg.data.get("id").and_then(|v| v.as_u64()).map(|v| v as u32);
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
                            _ => {
                                tracing::warn!("received unhandled event: {}", client_msg.event);
                            }
                        }
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
    pub test_id: u32,
    pub test_text: String,
    pub passed: bool,
    pub is_loading: bool,
}

impl From<config::Test> for ClientTest {
    fn from(test: config::Test) -> Self {
        Self {
            test_id: test.id,
            test_text: test.test_text,
            passed: matches!(test.state, config::TestState::Passed),
            is_loading: false,
        }
    }
}

async fn handle_select_project(state: &Arc<AppState>, tx: &mpsc::Sender<Message>, project_id: u32) {
    tracing::debug!("handling project selection: {}", project_id);
    if let Err(e) = state.update_course_state(|s| s.current_project = Some(project_id)).await {
        tracing::error!("failed to update course state: {}", e);
    }

    // Load project content
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
                let hooks = Hooks {
                    before_all: lesson.hooks.before_all.clone(),
                    after_all: lesson.hooks.after_all.clone(),
                    before_each: lesson.hooks.before_each.clone(),
                    after_each: lesson.hooks.after_each.clone(),
                };

                let work_dir = ".";
                match execute_tests(&project, lesson.tests.clone(), &hooks, work_dir) {
                    Ok(results) => {
                        tracing::info!("test execution finished for lesson {}", current_lesson);
                        let client_tests: Vec<ClientTest> = results.into_iter().map(ClientTest::from).collect();
                        send_message(tx, "update_tests", serde_json::json!({ "tests": client_tests })).await;
                        
                        if client_tests.iter().all(|t| t.passed) {
                            tracing::info!("all tests passed for lesson {}", current_lesson);
                        } else {
                            tracing::debug!("some tests failed for lesson {}", current_lesson);
                        }
                    }
                    Err(e) => {
                        tracing::error!("test execution failed: {}", e);
                        send_message(tx, "update_error", serde_json::json!({ "error": e.to_string() })).await;
                    }
                }
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
                     let seed_test = config::Test {
                        id: 0,
                        test_text: "Seed lesson".to_string(),
                        code: seed.clone(),
                        runner: "bash".to_string(),
                        state: Default::default(),
                    };
                    
                    let hooks = Hooks::default();
                    let work_dir = ".";
                    
                    if let Err(e) = execute_tests(&project, vec![seed_test], &hooks, work_dir) {
                        tracing::error!("failed to run seed for lesson reset: {}", e);
                        send_message(tx, "update_error", serde_json::json!({ "error": e.to_string() })).await;
                    } else {
                        tracing::info!("seed executed successfully for lesson {}", current_lesson);
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
        let update_res = state.update_projects(|projects| {
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
