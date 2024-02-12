# Getting Started

## Creating a New Course

Create a new project directory and install `@freecodecamp/freecodecamp-os`:

```bash
mkdir <COURSE_DIR>
cd <COURSE_DIR>
npm init -y
npm install @freecodecamp/freecodecamp-os
```

```admonish info title=" "
Feel free to replace `npm` with another package manager of your choice.
```

## Configuring Your Course

Create a `freecodecamp.conf.json` file in the project root:

```bash
touch freecodecamp.conf.json
```

Add the following required configuration:

```json
{
  "version": "0.0.1",
  "config": {
    "projects.json": "<PROJECTS_JSON>",
    "state.json": "<STATE_JSON>"
  },
  "curriculum": {
    "locales": {
      "<LOCALE>": "<LOCALE_DIR>"
    }
  }
}
```

````admonish example collapsible=true
```json
{
  "version": "0.0.1",
  "config": {
    "projects.json": "./config/projects.json",
    "state.json": "./config/state.json"
  },
  "curriculum": {
    "locales": {
      "english": "./curriculum/locales/english"
    }
  }
}
```
````

```admonish info
There are many more configuration options available. See the [configuration](./configuration.md) page for more details.
```

Create the `projects.json` file:

```json
[
  {
    "id": 0,
    "dashedName": "<PROJECT_DASHED_NAME>"
  }
]
```

```admonish info
There are many more configuration options available. See the [configuration](./configuration.md) page for more details.
```

Create the `state.json` file:

```json
{}
```

Initialise this file with the initial state of the course. If you want the course to start on a project (instead of the landing page), replace `null` with the `dashedName` of the project.

Create the curricula files:

```bash
mkdir <LOCALE_DIR>
touch <LOCALE_DIR>/<PROJECT_DASHED_NAME>.md
```

````admonish example
```bash
mkdir curriculum/locales/english
touch curriculum/locales/english/learn-x-by-building-y.md
```
````

Add the Markdown content to the curricula files. See the [project syntax](./project-syntax.md) page for more details.

Create the project boilerplate/working directory in the root:

```bash
mkdir <PROJECT_DASHED_NAME>
```

````admonish example
```bash
mkdir learn-x-by-building-y
```
````

````admonish attention title="Required Files"
```txt
<COURSE_DIR>/
├── freecodecamp.conf.json
├── <PROJECTS_JSON>
├── <STATE_JSON>
└── <LOCALE_DIR>/
    └── <PROJECT_DASHED_NAME>.md
```
If using the `terminal` feature:
```txt
├── <CONFIG_BASH>/
│   ├── <CONFIG_BASH_BASHRC>
│   └── <CONFIG_BASH_SOURCERER>
├── .logs/
│   ├── .bash_history.log
│   ├── .cwd.log
│   ├── .history_cwd.log
│   ├── .next_command.log
│   ├── .temp.log
│   └── .terminal_out.log
```
If using the `tooling` feature:
```txt
├── <CONFIG_TOOLING_HELPERS>
```
````

Create a `.vscode/settings.json` file to configure the freeCodeCamp - Courses extension:

```json
{
  // Open the course when the workspace is opened
  "freecodecamp-courses.autoStart": true,
  // Automatically adjust the terminal logs if used
  "freecodecamp-courses.prepare": "sed -i \"s#WD=.*#WD=$(pwd)#g\" ./bash/.bashrc",
  // Command run in terminal on `freeCodeCamp: Develop Course`
  "freecodecamp-courses.scripts.develop-course": "NODE_ENV=development npm run start",
  // Command run in terminal on `freeCodeCamp: Run Course`
  "freecodecamp-courses.scripts.run-course": "NODE_ENV=production npm run start",
  // Preview to open when course starts
  "freecodecamp-courses.workspace.previews": [
    {
      "open": true,
      "url": "http://localhost:8080",
      "showLoader": true,
      "timeout": 4000
    }
  ],
  // The below settings are needed for using the terminal feature
  "terminal.integrated.defaultProfile.linux": "bash",
  "terminal.integrated.profiles.linux": {
    "bash": {
      "path": "bash",
      "icon": "terminal-bash",
      "args": ["--init-file", "./bash/sourcerer.sh"]
    }
  }
}
```

A few more settings are available, and can be seen and configured from the VSCode Settings UI.
