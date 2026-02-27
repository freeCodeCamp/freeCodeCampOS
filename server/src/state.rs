use config::AppConfig;
use tokio::sync::broadcast;

#[derive(Clone, Debug)]
pub struct AppState {
    pub config: AppConfig,
    pub tx: broadcast::Sender<String>,
}

impl AppState {
    pub fn new(config: AppConfig) -> Self {
        let (tx, _) = broadcast::channel(100);
        Self { config, tx }
    }
}
