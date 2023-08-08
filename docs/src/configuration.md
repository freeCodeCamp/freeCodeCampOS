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

- `.bashrc`: path relative to the root of the course - `string`
- `sourcerer.sh`: path relative to the root of the course - `string`

````admonish example
```json
{
  "bash": {
    ".bashrc": "./bash/.bashrc",
    "sourcerer.sh": "./bash/sourcerer.sh"
  }
}
```
````

#### `client`

- `assets.header`: path relative to the root of the course - `string`
- `assets.favicon`: path relative to the root of the course - `string`
- `landing.description`: description of the course shown on the landing page - `string`
- `landing.faq-link`: link to the FAQ page - `string`
- `landing.faq-text`: text to display for the FAQ link - `string`
- `static`: static resources to serve - `string | string[] | Record<string, string> | Record<string, string>[]`

````admonish example
```json
{
  "client": {
    "assets": {
      "header": "./client/assets/header.png",
      "favicon": "./client/assets/favicon.ico"
    }
  },
  "static": ["./curriculum/", { "/images": "./curriculum/images" }]
}
```
````

#### `config`

- `projects.json`: path relative to the root of the course - `string`
- `state.json`: path relative to the root of the course - `string`

````admonish example
```json
{
  "config": {
    "projects.json": "./config/projects.json",
    "state.json": "./config/state.json"
  }
}
```
````

#### `curriculum`

- `locales`: an object of locale names and their corresponding paths relative to the root of the course - `Record<string, string>`

````admonish example
```json
{
  "curriculum": {
    "locales": {
      "english": "./curriculum/locales/english"
    }
  }
}
```
````

#### `hotReload`

- `ignore`: a list of paths to ignore when hot reloading - `string[]`

````admonish example
```json
{
  "hotReload": {
    "ignore": [".logs/.temp.log", "config/", "/node_modules/", ".git"]
  }
}
```
````

#### `tooling`

- `helpers`: path relative to the root of the course - `string`

````admonish example
```json
{
  "tooling": {
    "helpers": "./tooling/helpers.js"
  }
}
```
````

## `projects.json`

### Definitions

- `id`: A unique, incremental integer - `number`
- `title`: The human-readable title of the project - `string`
- `dashedName`: The name of the project corresponding to the `curriculum/locales/<PROJECT_DASHED_NAME>.md` file - `string`
- `description`: The description of the project shown on the landing page - `string`
- `isIntegrated`: Whether or not to treat the project as a single-lesson project - `boolean` (default: `false`)
- `isPublic`: Whether or not to enable the project for public viewing. **Note:** the project will still be visible on the landing page, but will be disabled - `boolean` (default: `false`)
- `currentLesson`: The current lesson of the project - `number` (default: `1`)
- `runTestsOnWatch`: Whether or not to run tests on file change - `boolean` (default: `false`)
- `isResetEnabled`: Whether or not to enable the reset button - `boolean` (default: `false`)
- `numberOfLessons`: The number of lessons in the project - `number`[^1]
- `seedEveryLesson`: Whether or not to run the seed on lesson load - `boolean` (default: `false`)
- `blockingTests`: Run tests synchronously - `boolean` (default: `false`)
  - `breakOnFailure`: Stop running tests on the first failure - `boolean` (default: `false`)

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
    "runTestsOnWatch": false,
    "isResetEnabled": true,
    "numberOfLessons": 10,
    "seedEveryLesson": false,
    "blockingTests": false,
    "breakOnFailure": false
  }
]
```
````

## `.gitignore`

### Retaining files when step is reset

```admonish warning
Resetting a step removes all untracked files from the project directory. To prevent this for specific files, add them to a boilerplate `.gitignore` file, or the one in root.
```
