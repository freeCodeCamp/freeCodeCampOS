# Migration Plan for freeCodeCampOS

This document outlines the steps an automated agent should perform to migrate the repository from Node.js to Rust and organize components according to the specification in `MIGRATION.md`. The agent must be able to incrementally build, test, and validate each part of the migration.

---

## 1. Preparation

1. **Read existing structure**
   - Inspect current `cli/`, `.freeCodeCamp/client`, `self/`, and other relevant directories to understand existing JS/Node tooling.
   - Note configuration files such as `freecodecamp.conf.json`, `projects.json`.

2. **Create workspace layout**
   - Plan out crate boundaries: `cli`, `config`, `parser`, `runner`, `server`, `example`.
   - Ensure top-level Rust workspace (`Cargo.toml`) references each component as member.

3. **Set up build tooling**
   - Add necessary Rust dependencies: `clap` for CLI, `serde`, `axum`, `tokio`, `notify`, `react`/`vite` for client with `bun` package manager.
   - Initialize `bun` project in `client/`.

---

## 2. CLI Component

1. **Migrate existing `cli/` crate**
   - Update crate to use `clap` and adapt logic for new configuration structures.
   - Implement commands for curriculum creation and interaction.

2. **Ensure compatibility with shared `config` types**
   - Import `config` crate for shared structs.

3. **Write tests** replicating prior Node behavior.

---

## 3. Config Library

1. **Define shared types** based on `freecodecamp.conf.json` and `projects.json` patterns.
2. **Add serde derives** for serialization.
3. **Export common data structures** for use by CLI, parser, runner, server.

---

## 4. Parser Library

1. **Select GFM Markdown parser** (`pulldown-cmark`, `comrak`, `mdbook` plugins).
2. **Implement API similar to `.freeCodeCamp/tooling/parser.js`**
   - Parse course markdown into a structure with meta, lessons, tests, hooks.
3. **Add utilities** to read/write project files and return `Project` structs with tests.

---

## 5. Runner Library

1. **Implement `Runner` trait** with executors for Node and Bash initially.
2. **Use provided example structure**; replicate logic of temporary files and CLI invocation.
3. **Write tests for Node and Bash runners** ensuring correct behavior.

---

## 6. Server Component

1. **Create axum-based HTTP REST API** matching functionality of `.freeCodeCamp/tooling/server.js`.
2. **Integrate WebSocket support** via `ws` feature for real-time updates.
3. **Embed compiled `client` build** into binary using `include_bytes!` or `rust-embed` for easy distribution.
4. **Expose endpoints** for serving curriculum, running tests, resetting projects.

---

## 7. Client Component

1. **Move existing `.freeCodeCamp/client/` to top-level `client/`**
2. **Convert build to use Vite/Rollup with Bun package manager**
3. **Update imports to refer to new API endpoints** from server.
4. **Ensure bundling outputs static assets for server embedding.**

---

## 8. Example Project

1. **Port `self/` directory to `example/`** updating configs and markdown to match new structure.
2. **Ensure curriculum markdown uses new meta format** rather than `projects.json`.
3. **Add tests demonstrating parser, runner, and server working together.**

---

## 9. Documentation

1. **Update existing docs in `docs/`** to reflect migration and new component layout.
2. **Add new sections** for how to build, run, and contribute to each Rust component.
3. **Provide examples** for developing new curricula and using CLI, server, runner.

---

## 10. Major Changes & Verification

1. **Remove `projects.json` references** and confirm parser uses markdown meta.
2. **Verify runner supports multiple languages**; add tests with Node and Python examples if possible.
3. **Assess plugin feature; consider deprecation or removal**.

---

## 11. Continuous Integration

1. **Set up CI pipeline** to build all crates, run tests, compile client and embed.
2. **Automate linting and formatting checks** (rustfmt, clippy, eslint for client)

---

## 12. Final Review & Release

1. **Ensure single binary distribution** with `server` + embedded client.
2. **Update README and other top-level docs** with new usage instructions.
3. **Tag migration milestone** and prepare release notes.

---

> This plan should guide the agent through a structured migration from Node.js to Rust with clearly defined milestones. Adjust as necessary based on repository state and discovery during implementation.
