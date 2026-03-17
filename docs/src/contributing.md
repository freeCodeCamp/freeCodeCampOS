# Contributing

## System Requirements

- **Rust 1.93.1+** — [Install Rust](https://rustup.rs/)
- **Bun 1.3.10+** — [Install Bun](https://bun.sh/)
- **Node.js 20+**

## Local Development

1. Clone the repository and open `freeCodeCampOS/example` as a new workspace in VSCode.

2. Install dependencies and build the project:

   ```bash
   bun install
   bun run build
   ```

3. Run the development server:

   ```bash
   cargo run --bin freecodecamp-server
   ```

4. In a separate terminal, run the client in development mode:

   ```bash
   cd client && bun run dev
   ```

   The client will be available at `http://localhost:5173`.

### Common Tasks

```bash
# Run all tests
cargo test --all

# Check formatting
cargo fmt --all -- --check

# Fix formatting
cargo fmt --all

# Run linter
cargo clippy --all -- -D warnings

# Build optimized binaries
cargo build --release --all

# Build client assets
cd client && bun run build
```

### Environment Variables

```bash
RUST_LOG=info               # Log level (debug, info, warn, error)
PORT=8080                   # Server port (default: 8080)
CONFIG_PATH=./conf.json     # Path to configuration file
```

## Repository Layout

```
cli/          # create-freecodecamp-os-app CLI tool
client/       # React frontend
config/       # Shared types and configuration
docs/         # Documentation (this site)
example/      # Example curriculum used for development
parser/       # Curriculum markdown parser
runner/       # Test execution engine
server/       # Axum HTTP server
```

## Gitpod

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/freeCodeCamp/freecodecampOS)

## Opening a Pull Request

1. Fork the repository
2. Push your changes to your fork
3. Open a pull request with the recommended style

### Commit Message

```markdown
<type>(<scope>): <description>
```

```admonish example
feat(docs): add contributing.md
```

### Pull Request Title

```markdown
<type>(<scope>): <description>
```

```admonish example
feat(docs): add contributing.md
```

### Pull Request Body

Answer the following questions:

- What does this pull request do?
- How should this be manually tested?
- Any background context you want to provide?
- What are the relevant issues?
- Screenshots (if appropriate)

### Types

- `fix`
- `feat`
- `refactor`
- `chore`

### Scopes

Any top-level directory or config file. Changing a package should have a scope of `dep` or `deps`.

## Documentation

This documentation is built using [mdBook](https://rust-lang.github.io/mdBook/). Read their documentation to install the latest version.

Also, the documentation uses `mdbook-admonish`:

```bash
cargo install mdbook-admonish
```

### Serve the Documentation

```bash
cd docs
mdbook serve
```

This will spin up a local server at `http://localhost:3000` with hot-reloading.

### Build the Documentation

```bash
cd docs
mdbook build
```

## CLI (`create-freecodecamp-os-app`)

The CLI is written in Rust and is located in the `cli` directory.

### Development

```bash
cd cli
cargo run
```

---

## Flight Manual

### Release

Releases are done manually through the GitHub Actions.

#### Making a Release

In the `Actions` tab, select the `Publish to npm` workflow. Then, select `Run workflow`.
