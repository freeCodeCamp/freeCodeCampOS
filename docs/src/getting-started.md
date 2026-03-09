# Getting Started

## Creating a New Course

The easiest way to create a new course is using the freeCodeCampOS CLI.

### Install the CLI

```bash
cargo install create-freecodecamp-os-app
```

### Create a Course

Run the following command and follow the interactive prompts:

```bash
create-freecodecamp-os-app create
```

This will scaffold a new course with the necessary directory structure and configuration files.

## Configuring Your Course

The main configuration file is `freecodecamp.conf.json` in the project root.

### Required Configuration

```json
{
  "version": "4.0.0",
  "config": {
    "projects": "./config/projects.json",
    "state": "./config/state.json"
  },
  "curriculum": {
    "locales": {
      "english": "./curriculum/locales/english"
    }
  }
}
```

```admonish info
There are many more configuration options available. See the [configuration](./configuration.md) page for more details.
```

## Project Structure

A typical freeCodeCampOS project looks like this:

```txt
<COURSE_DIR>/
├── freecodecamp.conf.json   # Main configuration
├── config/
│   ├── projects.json        # Project metadata
│   └── state.json           # User progress state
├── curriculum/
│   └── locales/
│       └── english/
│           └── my-project.md # Curriculum content
└── my-project/              # Project boilerplate/working directory
```

## Running the Course

Once your course is scaffolded, you can run it using the freeCodeCampOS server binary.

```bash
freecodecamp-server
```

By default, the server will be available at `http://localhost:8080`.
