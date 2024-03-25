use std::path::PathBuf;

use indicatif::ProgressBar;
use serde_json::{json, Value};

use crate::{
    conf::{
        Client, Conf, Config, Curriculum, HotReload, Landing, Locales, Project, State, Tooling,
    },
    environment::Environment,
    features::Features,
    fixtures::{BASHRC, SOURCERER},
};

pub struct Course {
    canonicalized_path: PathBuf,
    #[allow(unused)]
    directory_name: String,
    environment: Vec<Environment>,
    features: Vec<Features>,
    is_git_repository: bool,
    is_translated: bool,
    num_projects: u8,
}

impl Course {
    pub fn create_course(&self, progress_bar: &ProgressBar) {
        progress_bar.inc(1);
        self.git_init();
        progress_bar.inc(1);
        self.npm_init();
        progress_bar.inc(1);

        self.touch_bash();
        progress_bar.inc(1);
        self.touch_conf();
        progress_bar.inc(1);
        self.touch_curriculum();
        progress_bar.inc(1);
        // self.touch_devcontainer();
        self.touch_docker();
        progress_bar.inc(1);
        self.touch_gitpod();
        progress_bar.inc(1);
        self.touch_helpers();
        progress_bar.inc(1);
        self.touch_injectables();
        progress_bar.inc(1);
        self.touch_plugins();
        progress_bar.inc(1);
        self.touch_projects();
        progress_bar.inc(1);
        self.touch_state();
        progress_bar.inc(1);
        self.touch_vscode();
        progress_bar.inc(1);
    }

    fn command(&self, command: &str, args: Vec<&str>) -> std::io::Result<std::process::Output> {
        std::process::Command::new(command)
            .args(args)
            .current_dir(&self.canonicalized_path)
            .output()
    }

    /// Runs `git init` in the `directory_name`
    fn git_init(&self) {
        if self.is_git_repository {
            if let Err(e) = self.command("git", vec!["init"]) {
                println!("Failed to run `git init`: {e}");
            }
        }
    }

    pub fn new(
        directory_name: String,
        environment: Vec<Environment>,
        features: Vec<Features>,
        is_git_repository: bool,
        is_translated: bool,
        num_projects: u8,
    ) -> Self {
        Self {
            canonicalized_path: std::fs::canonicalize(&directory_name).expect("Failed to get path"),
            directory_name,
            environment,
            features,
            is_git_repository,
            is_translated,
            num_projects,
        }
    }

    fn npm_init(&self) {
        let package = json!({
          "name": self.directory_name,
          "version": "1.0.0",
          "private": true,
          "description": "",
          "scripts": {
            "start": "node ./node_modules/@freecodecamp/freecodecamp-os/.freeCodeCamp/tooling/server.js"
          },
          "keywords": [],
          "author": "",
          "license": "MIT",
          "dependencies": {
            "@freecodecamp/freecodecamp-os": "^3.1.0"
          },
          "type": "module"
        });
        if let Err(e) = std::fs::write(
            self.canonicalized_path.join("package.json"),
            serde_json::to_string_pretty(&package).expect("Failed to serialise package"),
        ) {
            eprintln!("Failed to create package.json file: {e}");
        }
    }

    fn touch_bash(&self) {
        if self.features.contains(&Features::Terminal) {
            // Create `bash` directory
            if std::fs::DirBuilder::new()
                .create(self.canonicalized_path.join("bash"))
                .is_ok()
            {
                // Create `bash/.bashrc` file with contents
                if let Err(e) = std::fs::write(self.canonicalized_path.join("bash/.bashrc"), BASHRC)
                {
                    eprintln!("Failed to create bash/.bashrc file: {e}");
                }
                // Create `bash/sourcerer.sh` file with contents
                if let Err(e) =
                    std::fs::write(self.canonicalized_path.join("bash/sourcerer.sh"), SOURCERER)
                {
                    eprintln!("Failed to create bash/sourcerer.sh file: {e}");
                }
            } else {
                eprintln!("Failed to create bash directory");
            }
        }
    }

    fn touch_conf(&self) {
        let static_files = if self.features.contains(&Features::ScriptInjection) {
            Some(json!( {
                    "/script/injectable.js": "./client/injectable.js".to_string(),
            }))
        } else {
            None
        };

        let english = if self.is_translated {
            "./curriculum/locales/english".to_string()
        } else {
            "./curriculum/".to_string()
        };

        let helpers = if self.features.contains(&Features::Helpers) {
            Some("./tooling/helpers.js".to_string())
        } else {
            None
        };
        let plugins = if self.features.contains(&Features::PluginSystem) {
            Some("./tooling/plugins.js".to_string())
        } else {
            None
        };

        let conf = Conf {
            version: "0.0.1".try_into().unwrap(),
            port: Some(8080),
            client: Some(Client {
                assets: None,
                landing: Some(json!({
                    "english": Landing {
                        title: "Course title".to_string(),
                        description: "Course description".to_string(),
                        faq_link: None,
                        faq_text: None,
                    }
                })),
                static_files,
            }),
            config: Config {
                projects: "config/projects.json".to_string(),
                state: "config/state.json".to_string(),
            },
            curriculum: Curriculum {
                locales: Locales { english },
                assertions: None,
            },
            hot_reload: Some(HotReload {
                ignore: vec![
                    ".logs/.script_out.log".to_string(),
                    "config/".to_string(),
                    "/node_modules/".to_string(),
                    ".git".to_string(),
                    "/target/".to_string(),
                    ".vscode".to_string(),
                    "freecodecamp.conf.json".to_string(),
                ],
            }),
            tooling: Some(Tooling { helpers, plugins }),
        };

        if let Err(e) = std::fs::write(
            self.canonicalized_path.join("freecodecamp.conf.json"),
            serde_json::to_string_pretty(&conf).expect("Failed to serialise conf"),
        ) {
            eprintln!("Failed to create freecodecamp.conf.json file: {e}");
        }
    }

    fn touch_curriculum(&self) {
        let mut base_path = String::from("curriculum");
        if self.is_translated {
            base_path.push_str("/locales/english");
        }

        if let Err(e) = std::fs::create_dir_all(self.canonicalized_path.join(&base_path)) {
            eprintln!("Failed to create curriculum directory: {e}");
        } else {
            let boilerplate = r"# Project {i}
            
Project description.

## 0

### --description--

Placeholder.

### --tests--

Example test.

```js
assert.fail();
```

## --fcc-end--
";
            for i in 0..self.num_projects {
                if let Err(e) = std::fs::write(
                    self.canonicalized_path
                        .join(format!("{base_path}/project-{i}.md")),
                    boilerplate.replace("{i}", &i.to_string()),
                ) {
                    eprintln!("Failed to create '{base_path}/project-{i}.md' file: {e}");
                }
                if let Err(e) =
                    std::fs::create_dir_all(self.canonicalized_path.join(format!("project-{i}")))
                {
                    eprintln!("Failed to create 'project-{i}' directory: {e}");
                } else if let Err(e) = std::fs::write(
                    self.canonicalized_path
                        .join(format!("project-{i}/.gitkeep")),
                    String::new(),
                ) {
                    eprintln!("Failed to create 'project-{i}/.gitkeep' file: {e}");
                }
            }
        }
    }

    #[allow(unused)]
    fn touch_devcontainer(&self) {
        if self.environment.contains(&Environment::Codespaces)
            || self.environment.contains(&Environment::VSCode)
        {
            let devcontainer = json!({
              "customizations": {
                "vscode": {
                  "extensions": [
                    "dbaeumer.vscode-eslint",
                    "freeCodeCamp.freecodecamp-courses@3.0.0",
                    "freeCodeCamp.freecodecamp-dark-vscode-theme"
                  ]
                }
              },
              "forwardPorts": [8080],
              "workspaceFolder": "/workspace/freeCodeCampOS",
              "dockerFile": "../Dockerfile",
              "context": "..",
              "updateRemoteUserUID": false,
              "remoteUser": "gitpod",
              "containerUser": "gitpod"
            });
            if let Err(e) = std::fs::create_dir_all(self.canonicalized_path.join(".devcontainer")) {
                eprintln!("Failed to create .devcontainer directory: {e}");
            } else if let Err(e) = std::fs::write(
                self.canonicalized_path
                    .join(".devcontainer/devcontainer.json"),
                serde_json::to_string_pretty(&devcontainer)
                    .expect("Failed to serialise devcontainer"),
            ) {
                eprintln!("Failed to create .devcontainer/devcontainer.json file: {e}");
            }
        }
    }

    fn touch_docker(&self) {
        let dockerfile = r"FROM gitpod/workspace-full

WORKDIR /workspace/freeCodeCampOS

COPY --chown=gitpod:gitpod . .
";
        if let Err(e) = std::fs::write(self.canonicalized_path.join("Dockerfile"), dockerfile) {
            eprintln!("Failed to create Dockerfile file: {e}");
        }
    }

    fn touch_gitpod(&self) {
        if self.environment.contains(&Environment::Gitpod) {
            let gitpod = r"image:
  file: Dockerfile

# Commands to start on workspace startup
tasks:
  - init: npm ci

ports:
  - port: 8080
    onOpen: open-preview

vscode:
  extensions:
    - https://github.com/freeCodeCamp/courses-vscode-extension/releases/download/v3.0.0/freecodecamp-courses-3.0.0.vsix
    - https://github.com/freeCodeCamp/freecodecamp-dark-vscode-theme/releases/download/v1.0.0/freecodecamp-dark-vscode-theme-1.0.0.vsix
";
            if let Err(e) = std::fs::write(self.canonicalized_path.join(".gitpod.yml"), gitpod) {
                eprintln!("Failed to create .gitpod.yml file: {e}");
            }
        }
    }

    fn touch_helpers(&self) {
        if self.features.contains(&Features::Helpers) {
            let helpers = r"import { ROOT } from '@freecodecamp/freecodecamp-os/.freeCodeCamp/tooling/env.js';
import { join } from 'path';
";
            if let Err(e) = std::fs::create_dir_all(self.canonicalized_path.join("tooling")) {
                eprintln!("Failed to create tooling directory: {e}");
            } else if let Err(e) =
                std::fs::write(self.canonicalized_path.join("tooling/helpers.js"), helpers)
            {
                eprintln!("Failed to create tooling/helpers.js file: {e}");
            }
        }
    }

    fn touch_injectables(&self) {
        if self.features.contains(&Features::ScriptInjection) {
            let injectable = r"function checkForToken() {
  const serverTokenCode = `
    try {
      const {readFile} = await import('fs/promises');
      const tokenFile = await readFile(join(ROOT, 'config/token.txt'));
      const token = tokenFile.toString();
      console.log(token);
      __result = token;
    } catch (e) {
      console.error(e);
      __result = null;
    }`;
  socket.send(
    JSON.stringify({
      event: '__run-client-code',
      data: serverTokenCode
    })
  );
}

async function askForToken() {
  const modal = document.createElement('dialog');
  const p = document.createElement('p');
  p.innerText = 'Enter your token';
  p.style.color = 'black';
  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'token-input';
  input.style.color = 'black';
  const button = document.createElement('button');
  button.innerText = 'Submit';
  button.style.color = 'black';
  button.onclick = async () => {
    const token = input.value;
    const serverTokenCode = `
      try {
        const {writeFile} = await import('fs/promises');
        await writeFile(join(ROOT, 'config/token.txt'), '${token}');
        __result = true;
      } catch (e) {
        console.error(e);
        __result = false;
      }`;
    socket.send(
      JSON.stringify({
        event: '__run-client-code',
        data: serverTokenCode
      })
    );
    modal.close();
  };

  modal.appendChild(p);
  modal.appendChild(input);
  modal.appendChild(button);
  document.body.appendChild(modal);
  modal.showModal();
}

const socket = new WebSocket(
  `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${
    window.location.host
  }`
);

window.onload = function () {
  socket.onmessage = function (event) {
    const parsedData = JSON.parse(event.data);
    if (
      parsedData.event === 'RESPONSE' &&
      parsedData.data.event === '__run-client-code'
    ) {
      if (parsedData.data.error) {
        console.log(parsedData.data.error);
        return;
      }
      const { __result } = parsedData.data;
      if (!__result) {
        askForToken();
        return;
      }
      window.__token = __result;
    }
  };
  let interval;
  interval = setInterval(() => {
    if (socket.readyState === 1) {
      clearInterval(interval);
      checkForToken();
    }
  }, 1000);
};
";
            if let Err(e) = std::fs::create_dir_all(self.canonicalized_path.join("client")) {
                eprintln!("Failed to create client directory: {e}");
            } else if let Err(e) = std::fs::write(
                self.canonicalized_path.join("client/injectable.js"),
                injectable,
            ) {
                eprintln!("Failed to create client/injectable.js file: {e}");
            }
        }
    }

    fn touch_plugins(&self) {
        if self.features.contains(&Features::PluginSystem) {
            let plugins = r"import { pluginEvents } from '@freecodecamp/freecodecamp-os/.freeCodeCamp/plugin/index.js';

pluginEvents.onTestsStart = async (project, testsState) => {};

pluginEvents.onTestsEnd = async (project, testsState) => {};

pluginEvents.onProjectStart = async project => {};

pluginEvents.onProjectFinished = async project => {};

pluginEvents.onLessonFailed = async project => {};

pluginEvents.onLessonPassed = async project => {};
";
            if let Err(e) = std::fs::create_dir_all(self.canonicalized_path.join("tooling")) {
                eprintln!("Failed to create tooling directory: {e}");
            } else if let Err(e) =
                std::fs::write(self.canonicalized_path.join("tooling/plugins.js"), plugins)
            {
                eprintln!("Failed to create tooling/plugins.js file: {e}");
            }
        }
    }

    fn touch_projects(&self) {
        if let Err(e) = std::fs::create_dir_all(self.canonicalized_path.join("config")) {
            eprintln!("Failed to create config directory: {e}");
        } else {
            let mut projects = Vec::new();
            for i in 0..self.num_projects {
                let project = Project {
                    id: u16::from(i),
                    dashed_name: format!("project-{i}"),
                    is_integrated: false,
                    is_public: true,
                    current_lesson: 0,
                    run_tests_on_watch: true,
                    seed_every_lesson: false,
                    is_reset_enabled: false,
                    number_of_lessons: 1,
                    blocking_tests: false,
                    break_on_failure: false,
                };
                projects.push(project);
            }
            if let Err(e) = std::fs::write(
                self.canonicalized_path.join("config/projects.json"),
                serde_json::to_string_pretty(&projects).expect("Failed to serialise projects"),
            ) {
                eprintln!("Failed to create config/projects.json file: {e}");
            }
        }
    }

    fn touch_state(&self) {
        let state = State {
            current_project: Value::Null,
            locale: "english".to_string(),
            last_seed: None,
        };
        if let Err(e) = std::fs::create_dir_all(self.canonicalized_path.join("config")) {
            eprintln!("Failed to create config directory: {e}");
        } else if let Err(e) = std::fs::write(
            self.canonicalized_path.join("config/state.json"),
            serde_json::to_string_pretty(&state).expect("Failed to serialise state"),
        ) {
            eprintln!("Failed to create config/state.json file: {e}");
        }
    }

    fn touch_vscode(&self) {
        let settings = json!({
            "files.exclude": {
                ".devcontainer": false,
                ".gitignore": false,
                ".gitpod.yml": false,
                ".logs": false,
                ".vscode": false,
                "node_modules": false,
                "package.json": false,
                "package-lock.json": false
            },
            "terminal.integrated.defaultProfile.linux": "bash",
            "terminal.integrated.profiles.linux": {
                "bash": {
                    "path": "bash",
                    "icon": "terminal-bash",
                    "args": [
                        "--init-file",
                        "./bash/sourcerer.sh"
                    ]
                }
            },
            "freecodecamp-courses.autoStart": true,
            "freecodecamp-courses.prepare": "sed -i \"s#WD=.*#WD=$(pwd)#g\" ./bash/.bashrc",
            "freecodecamp-courses.scripts.develop-course": "NODE_ENV=development npm run start",
            "freecodecamp-courses.scripts.run-course": "NODE_ENV=production npm run start",
            "freecodecamp-courses.workspace.previews": [
                {
                    "open": true,
                    "url": "http://localhost:8080",
                    "showLoader": true,
                    "timeout": 4000
                }
            ]
        });
        if let Err(e) = std::fs::create_dir_all(self.canonicalized_path.join(".vscode")) {
            eprintln!("Failed to create .vscode directory: {e}");
        } else if let Err(e) = std::fs::write(
            self.canonicalized_path.join(".vscode/settings.json"),
            serde_json::to_string_pretty(&settings).expect("Failed to serialise settings"),
        ) {
            eprintln!("Failed to create .vscode/settings.json file: {e}");
        }
    }
}
