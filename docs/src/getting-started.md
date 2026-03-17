# Getting Started

Welcome to freeCodeCampOS — a platform for creating and hosting interactive coding curricula.

This guide is for **course creators**: people who want to build a course using freeCodeCampOS.

```admonish note
If you want to contribute to freeCodeCampOS itself, see the [Contributing](./contributing.md) guide instead.
```

## Prerequisites

- **Node.js 20+** — [Install Node.js](https://nodejs.org/)

That's it. The `freecodecamp-server` binary is downloaded automatically when you run the server.

## Create a New Course

Use the CLI to scaffold a new course:

```bash
npx create-freecodecamp-os-app create
```

Follow the interactive prompts. This creates a directory with:

```
my-course/
├── freecodecamp.conf.json   # Course configuration
├── config/
│   ├── projects.json        # Project metadata
│   └── state.json           # Learner state (auto-managed)
└── curriculum/
    └── locales/
        └── english/
            └── my-course.md # Curriculum content
```

## Run the Server

From your course root directory:

```bash
npx freecodecamp-server
```

Open your browser to `http://localhost:8080`.

## Next Steps

- [Configuration](./configuration.md) — configure your course, projects, and client branding
- [Project Syntax](./project-syntax.md) — write lessons, tests, and seeds in the curriculum markdown format
- [CLI](./cli.md) — add projects, rename projects, and validate your course configuration
- [Testing Guide](./testing/lifecycle.md) — understand the test lifecycle
