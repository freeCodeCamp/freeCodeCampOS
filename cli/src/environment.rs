use std::fmt::{self, Display, Formatter};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Environment {
    Codespaces,
    Gitpod,
    VSCode,
}

impl Environment {
    pub const VARIANTS: &'static [Environment] = &[Self::Codespaces, Self::Gitpod, Self::VSCode];
}

impl Display for Environment {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        match self {
            Environment::Codespaces => write!(f, "Codespaces"),
            Environment::Gitpod => write!(f, "Gitpod"),
            Environment::VSCode => write!(f, "VSCode"),
        }
    }
}
