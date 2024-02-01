# Configuration

## `freecodecamp.conf.json`

### Required Configuration

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

````admonish example collapsible=true title="Minimum Usable Example"
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
- `landing.description`: description of the course shown on the landing page - `string`
- `landing.<locale>.faq-link`: link to the FAQ page - `string`
- `landing.<locale>.faq-text`: text to display for the FAQ link - `string`
- `static`: static resources to serve - `string | string[] | Record<string, string> | Record<string, string>[]`

````admonish example
```json
{
  "client": {
    "assets": {
      "header": "./client/assets/header.png",
      "favicon": "./client/assets/favicon.ico"
    },
    "static": ["./curriculum/", { "/images": "./curriculum/images" }]
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
- `assertions`: an onject of locale names and their corresponding paths to a JSON file containing custom assertions - `string`

````admonish example
```json
{
  "curriculum": {
    "locales": {
      "english": "./curriculum/locales/english"
    },
    "assertions: {
      "afrikaans": "./curriculum/assertions/afrikaans.json"
    }
  }
}
```
````

```admonish attention
Currently, `english` is a required locale, and is used as the default.
```

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

### Definitions

- `id`: A unique, incremental integer - `number`
- `dashedName`: The name of the project corresponding to the `curriculum/locales/<PROJECT_DASHED_NAME>.md` file - `string`
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
    "dashedName": "<PROJECT_DASHED_NAME>"
  }
]
```

### Optional Configuration

````admonish example
```json
[
  {
    "id": 0,
    "dashedName": "learn-x-by-building-y",
    "isIntegrated": false,
    "isPublic": false,
    "currentLesson": 1,
    "runTestsOnWatch": false,
    "isResetEnabled": false,
    "numberOfLessons": 10,
    "seedEveryLesson": false,
    "blockingTests": false,
    "breakOnFailure": false
  }
]
```
````

## `.gitignore`

### Retaining Files When a Step is Reset

```admonish warning
Resetting a step removes all untracked files from the project directory. To prevent this for specific files, add them to a boilerplate `.gitignore` file, or the one in root.
```
