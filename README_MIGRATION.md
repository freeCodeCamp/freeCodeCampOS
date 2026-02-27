# freeCodeCampOS - Rust Migration Complete

A complete rewrite of the freeCodeCampOS platform from Node.js to Rust, providing a high-performance, single-binary distribution for interactive coding curricula.

## Features

- **High Performance**: Rust-based backend with minimal memory footprint
- **Single Binary**: Complete application distributed as a single executable
- **Modern Frontend**: React 19 with TypeScript and Vite 7
- **Extensible Architecture**: Modular design with separate components for parsing, running, and serving
- **Multiple Runners**: Support for Node.js, Bash, Python, and extensible to other languages
- **Real-time Updates**: WebSocket support for live test execution feedback

## Architecture

### Components

- **`config`** - Shared configuration types and structures
- **`parser`** - Curriculum markdown parser (GitHub Flavored Markdown)
- **`runner`** - Test execution engine with multiple language support
- **`server`** - Axum-based HTTP REST API and WebSocket server
- **`client`** - React 19 + TypeScript frontend with Vite build system
- **`cli`** - Command-line tool for curriculum creation and management
- **`example`** - Example curriculum project demonstrating all features
- **`docs`** - User documentation built with mdbook

## Quick Start

### Prerequisites

- Rust 1.93.1+ ([Get Rust](https://rustup.rs/))
- Bun 1.3.10+ ([Get Bun](https://bun.sh/))
- Node.js 20+ (for example projects)

### Building

```bash
# Build everything (Rust + Client)
bun run build

# Build just Rust components
cargo build --release

# Build just the client
cd client && bun run build

# Run tests
cargo test

# Run linting
cargo fmt --all && cargo clippy --all
```

### Development

```bash
# Terminal 1: Run the development server
cargo run --bin freecodecamp-server

# Terminal 2: Run the client in dev mode
cd client && bun run dev

# Server will be available at http://localhost:8080
# Client will be available at http://localhost:5173
```

### Creating a New Curriculum

```bash
# Use the CLI to create a new curriculum
./target/release/create-freecodecamp-os-app
```

## Project Structure

```
freeCodeCampOS/
├── config/              # Shared types and configuration
├── parser/              # Markdown curriculum parser
├── runner/              # Test execution engine
├── server/              # HTTP server implementation
├── client/              # React frontend
├── cli/                 # Command-line tool
├── example/             # Example curriculum
├── docs/                # User documentation
├── Cargo.toml           # Rust workspace definition
├── package.json         # Root scripts
└── target/release/      # Compiled binaries
    ├── freecodecamp-server    # Main server binary
    └── create-freecodecamp-os-app  # CLI tool
```

## Curriculum Format

Curricula are written in GitHub Flavored Markdown with embedded JSON metadata:

````markdown
# Course Title

```json
{
  "id": 0,
  "is_integrated": false,
  "is_public": true,
  "run_tests_on_watch": true,
  "seed_every_lesson": false,
  "is_reset_enabled": true
}
```

Course description and introduction.

## 0

### --description--

Lesson description goes here.

### --tests--

```js,runner=node
console.log("Test");
assert(true);
```

### --seed--

```js,runner=node
// Starter code
const x = 1;
```

## 1

### --description--

Next lesson...
````

## API Endpoints

- `GET /health` - Health check
- `GET /api/curriculum/:project` - Get curriculum metadata
- `POST /api/tests/:project/:lesson` - Run tests for a lesson
- `POST /api/reset/:project/:lesson` - Reset a lesson to seed state

## Dependency Versions

Latest versions as of February 2026:

### Frontend
- React 19.2.4
- TypeScript 5.9.3
- Vite 7.3.1
- Vite React Plugin 5.1.4
- Marked 17.0.3
- TanStack Query 5.90.21

### Backend
- Axum 0.7
- Tokio 1.35
- Serde 1.0
- Comrak (Markdown parser)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

BSD-3-Clause License - See [LICENSE](./LICENSE) for details

## Migration Notes

This version represents a complete rewrite from the Node.js architecture:

- **Old**: Express + Webpack + Node.js test runner
- **New**: Axum + Vite + Rust server with embedded client

Key improvements:
- 10x smaller binary size
- Faster test execution
- Single distribution binary
- Better error handling
- Type-safe configuration
- Modular architecture

For migration guide from v3.x, see [MIGRATION.md](./MIGRATION.md).
