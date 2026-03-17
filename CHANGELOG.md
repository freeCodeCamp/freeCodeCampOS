# Changelog

## [4.0.0] - 2026-03-09

### Major Rewrite (Rust Migration)

The platform has been completely rewritten from Node.js to Rust for improved performance, type safety, and a single-binary distribution.

#### Added

- **New Rust-based components**:
  - `server`: Axum-based HTTP/WebSocket server.
  - `parser`: Markdown AST parser using Comrak.
  - `runner`: Multi-language test runner (Node.js, Bash).
  - `cli`: Unified CLI for curriculum management.
  - `config`: Shared configuration system.
- **CLI Commands**:
  - `create`: Scaffold a new course or project.
  - `rename-project`: Rename an existing project.
  - `validate`: Validate curriculum and configuration.
- **Configuration Features**:
  - `hot_reload`: Support for live reloading with an `ignore` list.
  - `static_paths`: Support for custom static routes in the client.
  - `tooling`: Configuration for custom `helpers` and `plugins`.

#### Changed

- **Configuration Format**:
  - Transitioned from `camelCase` to `snake_case` in `freecodecamp.conf.json`.
  - `projects.json` is no longer required as metadata is now extracted from curriculum files.
  - `client.static` renamed to `client.static_paths`.
- **Project Structure**:
  - Modularized into a Rust workspace.
  - Client moved to its own directory and now uses Vite 7 with React 19.

#### Deprecated

- Node.js-based server and tooling (replaced by Rust binaries).
- `projects.json` (use project metadata in markdown instead).
