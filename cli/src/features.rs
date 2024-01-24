use std::fmt::{self, Display, Formatter};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Features {
    Helpers,
    PluginSystem,
    ScriptInjection,
    Terminal,
}

impl Features {
    pub const VARIANTS: &'static [Features] = &[
        Self::Helpers,
        Self::PluginSystem,
        Self::ScriptInjection,
        Self::Terminal,
    ];
}

impl Display for Features {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        match self {
            Features::Helpers => write!(f, "Helpers"),
            Features::PluginSystem => write!(f, "Plugin System"),
            Features::ScriptInjection => write!(f, "Script Injection"),
            Features::Terminal => write!(f, "Terminal"),
        }
    }
}
