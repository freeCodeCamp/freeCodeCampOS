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
use crate::projects::discover_projects;

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
    let (mut sender, mut receiver) = socket.split();
    let mut rx = state.tx.subscribe();
    
    // Channel for sending messages to the client
    let (tx_out, mut rx_out) = mpsc::channel::<Message>(100);

    // Task to send messages to the client
    let mut sender_task = tokio::spawn(async move {
        while let Some(msg) = rx_out.recv().await {
            if sender.send(msg).await.is_err() {
                break;
            }
        }
    });

    // Send initial data to the client
    let projects = discover_projects(&state.config);
    
    // update-projects
    let projects_msg = ServerMessage {
        event: "update-projects".to_string(),
        data: &projects,
    };
    if let Ok(json) = serde_json::to_string(&projects_msg) {
        let _ = tx_out.send(Message::Text(json.into())).await;
    }

    // update-freeCodeCamp-config
    let config_msg = ServerMessage {
        event: "update-freeCodeCamp-config".to_string(),
        data: &state.config,
    };
    if let Ok(json) = serde_json::to_string(&config_msg) {
        let _ = tx_out.send(Message::Text(json.into())).await;
    }

    let tx_out_clone = tx_out.clone();
    let config_clone = state.config.clone();

    tokio::select! {
        _ = async {
            while let Ok(msg) = rx.recv().await {
                // Forward reload messages to client
                if tx_out_clone.send(Message::Text(msg.into())).await.is_err() {
                    break;
                }
            }
        } => {},
        _ = async {
            while let Some(Ok(msg)) = receiver.next().await {
                if let Message::Text(text) = msg {
                    if let Ok(client_msg) = serde_json::from_str::<ClientMessage>(&text) {
                        tracing::debug!("Received message: {:?}", client_msg);
                        match client_msg.event.as_str() {
                            "connect" => {
                                // Already sent initial data above
                            },
                            "request-data" => {
                                if client_msg.data.get("request") == Some(&serde_json::json!("projects")) {
                                    let projects = discover_projects(&config_clone);
                                    let msg = ServerMessage {
                                        event: "update-projects".to_string(),
                                        data: &projects,
                                    };
                                    if let Ok(json) = serde_json::to_string(&msg) {
                                        let _ = tx_out_clone.send(Message::Text(json.into())).await;
                                    }
                                }
                            }
                            _ => {
                                tracing::warn!("Unhandled event: {}", client_msg.event);
                            }
                        }
                    }
                } else if let Message::Close(_) = msg {
                    break;
                }
            }
        } => {},
        _ = &mut sender_task => {},
    }
    
    sender_task.abort();
}
