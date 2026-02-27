//! HTTP server for freeCodeCampOS

use axum::{
    routing::{get, post},
    Router,
};
use freecodecamp_config::AppConfig;
use std::net::SocketAddr;
use std::sync::Arc;
use tower_http::cors::CorsLayer;
use notify::{RecursiveMode, Watcher};

use rust_embed::RustEmbed;
use axum::response::{IntoResponse, Response};
use axum::http::{header, StatusCode, Uri};

mod handlers;
mod state;
mod ws;

pub use state::AppState;

#[derive(RustEmbed)]
#[folder = "../client/dist/"]
struct Assets;

async fn static_handler(uri: Uri) -> impl IntoResponse {
    let mut path = uri.path().trim_start_matches('/').to_string();

    if path.is_empty() {
        path = "index.html".to_string();
    }

    match Assets::get(path.as_str()) {
        Some(content) => {
            let mime = mime_guess::from_path(path).first_or_octet_stream();
            ([(header::CONTENT_TYPE, mime.as_ref())], content.data).into_response()
        }
        None => {
            // Fallback to index.html for SPA
            if let Some(index) = Assets::get("index.html") {
                ([(header::CONTENT_TYPE, "text/html")], index.data).into_response()
            } else {
                (StatusCode::NOT_FOUND, "Not Found").into_response()
            }
        }
    }
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::fmt::init();

    // Load configuration
    let config = load_config().unwrap_or_else(|e| {
        tracing::warn!("Failed to load config, using defaults: {}", e);
        AppConfig {
            port: 8080,
            ..Default::default()
        }
    });

    let app_state = Arc::new(AppState::new(config.clone()));

    // Setup watcher
    let state_for_watcher = app_state.clone();
    let mut watcher = notify::recommended_watcher(move |res: notify::Result<notify::Event>| {
        match res {
            Ok(event) => {
                if event.kind.is_modify() {
                    // Notify clients
                    let _ = state_for_watcher.tx.send("reload".to_string());
                }
            }
            Err(e) => tracing::error!("watch error: {:?}", e),
        }
    })?;

    // Start watching locales directories
    for path in config.curriculum.locales.values() {
        if let Ok(path) = std::fs::canonicalize(path) {
            watcher.watch(&path, RecursiveMode::Recursive)?;
        }
    }

    // Build router
    let app = Router::new()
        .route("/api/curriculum/:project", get(handlers::get_curriculum))
        .route("/api/tests/:project/:lesson", post(handlers::run_tests))
        .route("/api/reset/:project/:lesson", post(handlers::reset_lesson))
        .route("/health", get(handlers::health_check))
        .route("/ws", get(ws::ws_handler))
        .fallback(static_handler)
        .with_state(app_state)
        .layer(CorsLayer::permissive());

    // Start server
    let addr = SocketAddr::from(([127, 0, 0, 1], config.port));
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    
    tracing::info!("Server listening on {}", addr);
    
    // We need to keep watcher alive
    let _watcher = watcher;
    
    axum::serve(listener, app).await?;
    
    Ok(())
}

fn load_config() -> anyhow::Result<AppConfig> {
    let config_path = std::env::current_dir()?.join("freecodecamp.conf.json");
    if config_path.exists() {
        let content = std::fs::read_to_string(config_path)?;
        let config: AppConfig = serde_json::from_str(&content)?;
        Ok(config)
    } else {
        anyhow::bail!("Config file not found")
    }
}
