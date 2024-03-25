# CLI

## Installation

### Releases

Locate your platform in the [releases](https://github.com/freeCodeCamp/freeCodeCampOS/releases) section and download the latest version.

### `cargo`

```admonish note title=""
Requires Rust to be installed: https://www.rust-lang.org/tools/install
```

```bash
cargo install create-freecodecamp-os-app
```

## Usage

To create a new course with some boilerplate:

```bash
create-freecodecamp-os-app
```

To add a project to an existing course:

```bash
create-freecodecamp-os-app add-project
```

The major version of the CLI is tied to the version of `freecodecamp-os`. Some options may not be available if the version of the CLI is not compatible with the version of `freecodecamp-os` that is installed.
