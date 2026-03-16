# Migration Guide: v3 → v4

freeCodeCampOS v4 is a complete rewrite of the platform from Node.js to Rust. This document covers breaking changes, missing features, and a step-by-step guide for upgrading existing courses.

## Overview of Changes

| Area | v3 | v4 |
|------|----|----|
| Server | Node.js + Express | Rust + Axum |
| Build tool | Webpack | Vite 7 |
| Frontend | React 18 | React 19 |
| Distribution | npm package | Single binary |
| Config style | `camelCase` | `snake_case` |
| Project IDs | Integer | UUID |

---

## `freecodecamp.conf.json` Changes

### Renamed keys

| v3 | v4 |
|----|-----|
| `hotReload` | `hot_reload` |
| `client.static` | `client.static_paths` |
| `landing.<locale>.faq-link` | `landing.<locale>.faq_link` |
| `landing.<locale>.faq-text` | `landing.<locale>.faq_text` |

### Before (v3)

```json
{
  "version": "0.1.0",
  "port": 8080,
  "client": {
    "static": {
      "/images": "./curriculum/images",
      "/script/injectable.js": "./client/injectable.js"
    },
    "landing": {
      "english": {
        "title": "My Course",
        "description": "...",
        "faq-link": "https://example.com",
        "faq-text": "FAQ"
      }
    }
  },
  "hotReload": {
    "ignore": [".logs/.temp.log", "config/"]
  },
  "tooling": {
    "helpers": "./tooling/helpers.js",
    "plugins": "./tooling/plugins.js"
  }
}
```

### After (v4)

```json
{
  "version": "4.0.0",
  "port": 8080,
  "client": {
    "static_paths": {
      "/images": "./curriculum/images",
      "/script/injectable.js": "./client/injectable.js"
    },
    "landing": {
      "english": {
        "title": "My Course",
        "description": "...",
        "faq_link": "https://example.com",
        "faq_text": "FAQ"
      }
    }
  },
  "hot_reload": {
    "ignore": [".logs/.temp.log", "config/"]
  },
  "tooling": {
    "helpers": "./tooling/helpers.js",
    "plugins": "./tooling/plugins.js"
  }
}
```

---

## `projects.json` Changes

All field names changed from `camelCase` to `snake_case`. Project `id` changed from an integer to a UUID string. A `title` and `order` field are now required.

### Renamed/changed fields

| v3 | v4 |
|----|----|
| `id` (integer) | `id` (UUID string, e.g. `"a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"`) |
| `dashedName` | `dashed_name` |
| `isIntegrated` | `is_integrated` |
| `isPublic` | `is_public` |
| `runTestsOnWatch` | `run_tests_on_watch` |
| `seedEveryLesson` | `seed_every_lesson` |
| `isResetEnabled` | `is_reset_enabled` |
| `numberOfLessons` | `number_of_lessons` (now auto-calculated on startup) |
| `blockingTests` | `blocking_tests` |
| `breakOnFailure` | `break_on_failure` |
| `currentLesson` (tracked here) | removed — now tracked in `state.json` |
| _(not present)_ | `title` (required) |
| _(not present)_ | `order` (required, for display ordering) |
| _(not present)_ | `tags` (optional, string array) |

### Before (v3)

```json
[
  {
    "id": 0,
    "dashedName": "learn-x-by-building-y",
    "isIntegrated": false,
    "isPublic": true,
    "currentLesson": 0,
    "runTestsOnWatch": true,
    "seedEveryLesson": false,
    "isResetEnabled": true,
    "numberOfLessons": 10,
    "blockingTests": false,
    "breakOnFailure": false
  }
]
```

### After (v4)

```json
[
  {
    "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "title": "Learn X by Building Y",
    "dashed_name": "learn-x-by-building-y",
    "order": 0,
    "is_integrated": false,
    "is_public": true,
    "run_tests_on_watch": true,
    "seed_every_lesson": false,
    "is_reset_enabled": true,
    "blocking_tests": false,
    "break_on_failure": false
  }
]
```

---

## Curriculum Markdown Changes

### Test code blocks require `runner=<runner>`

In v3, all test code blocks were assumed to run with Node.js. In v4, the runner must be specified explicitly using the code block language tag.

**v3:**

````markdown
```js
assert(true);
```
````

**v4:**

````markdown
```js,runner=node
assert(true);
```
````

Available runners: `node`, `bash`.

---

## Installation Changes

freeCodeCampOS is still distributed as an npm package:

```bash
npm install @freecodecamp/freecodecamp-os
```

In v4, the package downloads a pre-built Rust binary (`freecodecamp-server`) instead of running a Node.js server. The server is started from the root of the course directory:

```bash
npx freecodecamp-server
```

The CLI tool is installed separately:

```bash
npm install -g create-freecodecamp-os-app
create-freecodecamp-os-app create
```

---

## Test Helper Changes

The v3 test environment included `__helpers` utilities from the `utils.js` module (e.g. `setVSCSettings`, `hideFile`, `showFile`, `cleanWorkingDirectory`). These are **not available** in v4.

The v4 test environment provides a smaller, focused set of built-in globals. See the [Globals](./docs/src/testing/globals.md) documentation for what is available.

---

## Missing Features in v4

The following features from v3 are **not yet implemented** in v4:

### Plugin system

The plugin event hooks (`onTestsStart`, `onTestsEnd`, `onProjectStart`, `onProjectFinished`, `onLessonPassed`, `onLessonFailed`, `onLessonLoad`) and the custom parser API (`getProjectMeta`, `getLesson`) are not implemented. The `tooling.plugins` config key is accepted but has no effect.

See [plugin-system.md](./docs/src/plugin-system.md) for the planned API.

### Python runner

The `python` runner is documented but not yet implemented. Only `node` and `bash` runners are available.

### Git-based curriculum building

The v3 `gitterizer` tool, which built git history from curriculum markdown, has been removed and has no equivalent in v4.

### VSCode helper utilities

The v3 `__helpers` object with VSCode-integration utilities (e.g. `hideFile`, `showFile`, `setVSCSettings`) has been removed and is not available in v4.

---

## Step-by-Step Migration

1. **Update `freecodecamp.conf.json`**
   - Rename `hotReload` → `hot_reload`
   - Rename `client.static` → `client.static_paths`
   - Rename `faq-link` → `faq_link` and `faq-text` → `faq_text` in landing configs
   - Update `version` to `"4.0.0"`

2. **Update `projects.json`**
   - Generate a UUID for each project (e.g. using `uuidgen` or an online generator) to replace the integer `id`
   - Rename all fields from `camelCase` to `snake_case` (see table above)
   - Add a `title` and `order` field to each project
   - Remove `currentLesson` (it is now managed in `state.json`)

3. **Update test code blocks**
   - The `js` language tag is automatically mapped to the `node` runner, so existing `js` test blocks continue to work. Explicitly specifying `,runner=node` is supported and recommended for clarity.

4. **Update the npm dependency version**
   - Upgrade `@freecodecamp/freecodecamp-os` to v4 in `package.json`
   - Remove any `postinstall` or `prepare` script that built the v3 client (the client is now embedded in the binary)

5. **Run the server**
   ```bash
   npx freecodecamp-server
   ```
