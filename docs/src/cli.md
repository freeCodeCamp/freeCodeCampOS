# CLI

The `create-freecodecamp-os-app` CLI helps you scaffold and manage freeCodeCampOS courses.

## Installation

### `npx` (recommended)

No installation required — run directly with `npx`:

```bash
npx create-freecodecamp-os-app <command>
```

### `cargo`

```admonish note title=""
Requires Rust to be installed: https://www.rust-lang.org/tools/install
```

```bash
cargo install create-freecodecamp-os-app
```

### Releases

Locate your platform in the [releases](https://github.com/freeCodeCamp/freeCodeCampOS/releases) section and download the latest version.

## Usage

### Create a new course

```bash
npx create-freecodecamp-os-app create
```

### Add a project to an existing course

```bash
npx create-freecodecamp-os-app add-project
```

### Rename a project in an existing course

```bash
npx create-freecodecamp-os-app rename-project
```

### Validate the course configuration files

```bash
npx create-freecodecamp-os-app validate
```

```admonish note
The version of the CLI is tied to the version of `freecodecamp-os`. Some options may not be available if the CLI version is not compatible with the installed version of `freecodecamp-os`.
```
