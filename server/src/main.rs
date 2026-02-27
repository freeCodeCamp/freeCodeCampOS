//! HTTP server for freeCodeCampOS

use axum::{
    routing::{get, post},
    Router,
};
use tower_http::services::ServeDir;
use config::AppConfig;
use std::sync::Arc;
use tower_http::cors::CorsLayer;
use notify::{RecursiveMode, Watcher};

use rust_embed::RustEmbed;
use axum::response::{IntoResponse};
use axum::http::{header, StatusCode, Uri};

mod handlers;
mod state;
mod ws;
mod projects;

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

    tracing::info!(?config);

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
    let mut app = Router::new()
        .route("/api/curriculum/{project}", get(handlers::get_curriculum))
        .route("/api/tests/{project}/{lesson}", post(handlers::run_tests))
        .route("/api/reset/{project}/{lesson}", post(handlers::reset_lesson))
        .route("/health", get(handlers::health_check))
        .route("/ws", get(ws::ws_handler));

    // Add static paths from config
    for (route, path) in &config.client.static_paths {
        tracing::info!("Serving static path: {} -> {}", route, path);
        app = app.nest_service(route, ServeDir::new(path));
    }

    let app = app.fallback(static_handler)
        .with_state(app_state)
        .layer(CorsLayer::permissive());

    
    // We need to keep watcher alive
    let _watcher = watcher;
    
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", config.port))
        .await
        .unwrap();
    tracing::info!(
        "Server listening on 0.0.0.0:{} (accessible from any interface)",
        listener.local_addr().unwrap().port()
    );
    tracing::info!("Application: http://127.0.0.1:{}", config.port);

    // Setup graceful shutdown
    let server = axum::serve(listener, app);
    
    // Create shutdown signal handler
    let shutdown_signal = async {
        let ctrl_c = async {
            tokio::signal::ctrl_c()
                .await
                .expect("failed to install Ctrl+C handler");
        };

        #[cfg(unix)]
        let terminate = async {
            tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
                .expect("failed to install SIGTERM handler")
                .recv()
                .await;
        };

        #[cfg(not(unix))]
        let terminate = std::future::pending::<()>();

        tokio::select! {
            _ = ctrl_c => {
                tracing::info!("Received SIGINT (Ctrl+C), starting graceful shutdown...");
            },
            _ = terminate => {
                tracing::info!("Received SIGTERM, starting graceful shutdown...");
            },
        }
    };

    // Run server with graceful shutdown
    if let Err(err) = server.with_graceful_shutdown(shutdown_signal).await {
        tracing::error!("Server error: {}", err);
    }

    tracing::info!("Server shutdown complete.");

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
