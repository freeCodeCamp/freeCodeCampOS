# Configuration

## `freecodecamp.conf.json`

### Required Configuration

```json
{
  "version": "4.0.0",
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

````admonish example collapsible=true title="Minimum Usable Example"
```json
{
  "version": "4.0.0",
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

### Optional Configuration (Features)

#### `port`

By default, the server and client communicate over port `8080`. To change this, add a `port` key to the configuration file:

````admonish example
```json
{
  "port": 8080
}
```
````

#### `client`

- `assets.header`: path relative to the root of the course - `string`
- `assets.favicon`: path relative to the root of the course - `string`
- `landing.<locale>.description`: description of the course shown on the landing page - `string`
- `landing.<locale>.title`: title of the course shown on the landing page - `string`
- `landing.<locale>.faq_link`: link to the FAQ page - `string`
- `landing.<locale>.faq_text`: text to display for the FAQ link - `string`
- `static_paths`: static resources to serve - `Record<string, string>`

````admonish example
```json
{
  "client": {
    "assets": {
      "header": "./client/assets/header.png",
      "favicon": "./client/assets/favicon.ico"
    },
    "static_paths": {
      "/images": "./curriculum/images",
      "/script/injectable.js": "./client/injectable.js"
    }
  }
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
- `assertions`: an object of locale names and their corresponding paths to a JSON file containing custom assertions - `Record<string, string>`

````admonish example
```json
{
  "curriculum": {
    "locales": {
      "english": "./curriculum/locales/english"
    },
    "assertions": {
      "afrikaans": "./curriculum/assertions/afrikaans.json"
    }
  }
}
```
````

```admonish attention
Currently, `english` is a required locale, and is used as the default.
```

#### `hot_reload`

- `ignore`: a list of paths to ignore when hot reloading - `string[]`

````admonish example
```json
{
  "hot_reload": {
    "ignore": [".logs/.temp.log", "config/", "/node_modules/", ".git"]
  }
}
```
````

#### `tooling`

- `helpers`: path relative to the root of the course - `string`
- `plugins`: path relative to the root of the course - `string`

````admonish example
```json
{
  "tooling": {
    "helpers": "./tooling/helpers.js",
    "plugins": "./tooling/plugins.js"
  }
}
```
````

## `projects.json`

The `projects.json` file is where you define the project(s) metadata.

### Definitions

- `id`: A unique UUID - `string`
- `title`: The title of the project - `string`
- `dashed_name`: The name of the project corresponding to the `curriculum/locales/<PROJECT_DASHED_NAME>.md` file - `string`
- `order`: The order in which the project should be displayed - `number`
- `is_integrated`: Whether or not to treat the project as a single-lesson project - `boolean` (default: `false`)
- `is_public`: Whether or not to enable the project for public viewing. **Note:** the project will still be visible on the landing page, but will be disabled - `boolean` (default: `false`)
- `run_tests_on_watch`: Whether or not to run tests on file change - `boolean` (default: `false`)
- `is_reset_enabled`: Whether or not to enable the reset button - `boolean` (default: `false`)
- `number_of_lessons`: The number of lessons in the project - `number`[^1]
- `seed_every_lesson`: Whether or not to run the seed on lesson load - `boolean` (default: `false`)
- `blocking_tests`: Run tests synchronously - `boolean` (default: `false`)
- `break_on_failure`: Stop running tests on the first failure - `boolean` (default: `false`)

[^1]: This is automagically calculated when the app is launched.

### Required Configuration

```json
[
  {
    "id": "e5f6a1b2-c3d4-4e5f-1a2b-3c4d5e6f7a8b",
    "title": "Course Title",
    "dashed_name": "<PROJECT_DASHED_NAME>",
    "order": 0
  }
]
```

### Optional Configuration

````admonish example
```json
[
  {
    "id": "e5f6a1b2-c3d4-4e5f-1a2b-3c4d5e6f7a8b",
    "title": "Learn X by Building Y",
    "dashed_name": "learn-x-by-building-y",
    "order": 0,
    "is_integrated": false,
    "is_public": false,
    "current_lesson": 0,
    "run_tests_on_watch": false,
    "is_reset_enabled": false,
    "number_of_lessons": 10,
    "seed_every_lesson": false,
    "blocking_tests": false,
    "break_on_failure": false
  }
]
```
````

## `.gitignore`

### Retaining Files When a Step is Reset

```admonish warning
Resetting a step removes all untracked files from the project directory. To prevent this for specific files, add them to a boilerplate `.gitignore` file, or the one in root.
```
