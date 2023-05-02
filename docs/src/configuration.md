# Configuration

## `freecodecamp.conf.json`

### Definitions

The most up-to-date definitions can be found here: https://github.com/freeCodeCamp/courses-vscode-extension/blob/main/src/typings.ts

### Required Configuration

```json
{
  "path": ".",
  "version": "0.0.1",
  "scripts": {
    "develop-course": "",
    "run-course": ""
  },
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

### Optional Configuration (Features)

#### `prepare`

This is a string command run in the terminal before the course is opened.

````admonish example
```json
{
  "prepare": "npm i"
}
```
````

#### `workspace`

This configures files, terminals, and previews to open when the course is opened.

- `files.path`: path relative to the root of the course - `string`
- `terminals.directory`: path relative to the root of the course - `string`
- `terminal.message`: message to echo in the terminal - `string`
- `terminal.name`: name of the terminal - `string`
- `terminal.show`: if `false`, runs the terminal in the background - `boolean`
- `previews.open`: whether or not to open the preview - `boolean`
- `previews.url`: url to open in the preview - `string`
- `previews.showLoader`: whether or not to show the loader. This is useful if setup takes a long time - `boolean`
- `previews.timeout`: how long to show the loader before trying the `url` - `number` (ms)

````admonish example
```json
{
  "workspace": {
    "files": [
      {"path": "README.md"},
    ],
    "terminals": [
      {
        "directory": "client",
        "message": "Starting client...",
        "name": "Terminal 1",
        "show": true
      },
    ],
    "previews": [
      {
        "open": true,
        "url": "http://localhost:8080",
        "showLoader": true,
        "timeout": 4000
      }
    ]
  }
}
```
````

#### `bash`

```admonish todo
WIP
```

#### `client`

```admonish todo
WIP
```

#### `config`

```admonish todo
WIP
```

#### `curriculum`

```admonish todo
WIP
```

#### `hotReload`

```admonish todo
WIP
```

#### `tooling`

```admonish todo
WIP
```

## `projects.json`

### Definitions

- `id`: A unique, incremental integer - `number`
- `title`: The human-readable title of the project - `string`
- `dashedName`: The name of the project corresponding to the `curriculum/locales/<PROJECT_DASHED_NAME>.md` file - `string`
- `description`: The description of the project shown on the landing page - `string`
- `isIntegrated`: Whether or not to treat the project as a single-lesson project - `boolean`
- `isPublic`: Whether or not to enable the project for public viewing. **Note:** the project will still be visible on the landing page, but will be disabled - `boolean`
- `currentLesson`: The current lesson of the project - `number`
- `runTestsOnWatch`: Whether or not to run tests on file change - `boolean`
- `isResetEnabled`: Whether or not to enable the reset button - `boolean`
- `numLessons`: The number of lessons in the project - `number`[^1]

[^1]: This is automagically calculated when the app is launched.

### Required Configuration

```json
[
  {
    "id": 0, // Unique ID
    "title": "<PROJECT_TITLE>",
    "dashedName": "<PROJECT_DASHED_NAME>",
    "description": "<PROJECT_DESCRIPTION>"
  }
]
```

### Optional Configuration

````admonish example
```json
[
  {
    "id": 0,
    "title": "Learn X by Building Y",
    "dashedName": "learn-x-by-building-y",
    "description": "In this project, you'll learn X by building Y",
    "isIntegrated": false,
    "isPublic": true,
    "currentLesson": 1,
    "runTestsOnWatch": true,
    "isResetEnabled": true,
    "numLessons": 10
  }
]
```
````
