# Getting Started with freeCodeCampOS 4.0

Welcome to freeCodeCampOS 4.0 - a complete Rust rewrite of the platform for creating and hosting interactive coding curricula.

## System Requirements

- **Rust 1.93.1+** - [Install Rust](https://rustup.rs/)
- **Bun 1.3.10+** - [Install Bun](https://bun.sh/)
- **Node.js 20+** (for running example projects)

## Installation

### Option 1: From Source

```bash
# Clone the repository
git clone https://github.com/freeCodeCamp/freeCodeCampOS.git
cd freeCodeCampOS

# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Build everything
./build.sh

# Run the server
./target/release/freecodecamp-server
```

### Option 2: Using Docker

```bash
docker build -f Dockerfile.migration -t freecodecamp-os:latest .
docker run -p 8080:8080 freecodecamp-os:latest
```

## Quick Start

### 1. Start the Development Server

```bash
# Terminal 1: Start the Rust backend
cargo run --bin freecodecamp-server

# Server will listen on http://localhost:8080
```

### 2. Start the Client

```bash
# Terminal 2: Start the React development server
cd client && bun run dev

# Client will be available at http://localhost:5173
```

### 3. Access the Application

Open your browser and navigate to `http://localhost:5173` to see the freeCodeCampOS interface.

## Creating Your First Curriculum

### Method 1: Using the CLI

```bash
# Create a new curriculum project
./target/release/create-freecodecamp-os-app

# Follow the interactive prompts to configure your course
```

### Method 2: Manual Setup

Create a directory structure:

```
my-course/
├── freecodecamp.conf.json
└── curriculum/
    └── locales/
        └── english/
            └── my-course.md
```

Example `freecodecamp.conf.json`:

```json
{
  "version": "4.0.0",
  "port": 8080,
  "client": {
    "assets": {
      "header": "./client/assets/logo.svg",
      "favicon": "./client/assets/favicon.svg"
    },
    "landing": {
      "english": {
        "title": "My Course",
        "description": "Learn amazing things",
        "faq-link": "https://example.com",
        "faq-text": "Frequently Asked Questions"
      }
    }
  },
  "curriculum": {
    "locales": {
      "english": "./curriculum/locales/english"
    }
  }
}
```

Example curriculum file (`my-course.md`):

```markdown
# Learn Amazing Things

```json
{
  "id": 0,
  "isIntegrated": false,
  "is_public": true,
  "runTestsOnWatch": true,
  "seedEveryLesson": false,
  "isResetEnabled": true
}
```

Welcome to this course!

## 0

### --description--

The first lesson introduces basic concepts.

### --tests--

```js,runner=node
console.log("Testing");
assert(1 + 1 === 2);
```

### --seed--

```js,runner=node
// Starter code
function add(a, b) {
  return a + b;
}
```

## 1

### --description--

The second lesson builds on the first.

### --tests--

```js,runner=node
assert(typeof add === 'function');
```
```

## Project Layout

freeCodeCampOS is organized into several components:

```
config/       # Shared types and configuration
parser/       # Curriculum markdown parser
runner/       # Test execution engine
server/       # HTTP API and server
client/       # React frontend
cli/          # Command-line tool
example/      # Example curriculum
docs/         # User documentation
```

## Common Tasks

### Run Tests

```bash
cargo test --all
```

### Lint and Format Code

```bash
# Check formatting
cargo fmt --all -- --check

# Fix formatting
cargo fmt --all

# Run linter
cargo clippy --all -- -D warnings
```

### Build for Production

```bash
# Build optimized binaries
cargo build --release --all

# Build client assets
cd client && bun run build
```

### View Documentation

```bash
# Build and serve mdbook documentation
cd docs && mdbook serve
```

## Architecture Overview

### Backend (Rust)

- **`config`** - Type definitions for app configuration
- **`parser`** - Parses curriculum markdown files into structured data
- **`runner`** - Executes tests using various language runtimes
- **`server`** - Axum web server with REST API and WebSocket support

### Frontend (React + TypeScript)

- Modern React 19 + TypeScript
- Vite 7 for fast builds
- TanStack Query for data fetching
- Marked 17 for markdown rendering
- Prism.js for syntax highlighting

## Environment Variables

When running the server, you can configure via environment variables:

```bash
RUST_LOG=info          # Set log level (debug, info, warn, error)
PORT=8080              # Server port (default: 8080)
CONFIG_PATH=./conf.json # Path to configuration file
```

## Next Steps

- Read the [Project Syntax](./project-syntax.md) guide to learn how to write curriculum files
- Explore the [example/](../example/) directory for a complete example course
- Check out the [Testing Guide](./testing/test.md) to learn about test structure
- Review [Contributing](./contributing.md) guidelines to contribute to the project

## Getting Help

- Report issues on [GitHub Issues](https://github.com/freeCodeCamp/freeCodeCampOS/issues)
- Join our [Discord Community](https://discord.gg/freeCodeCamp)
- Read the [FAQ](./freecodecamp-courses.md)

## Migrating from v3.x

If you're upgrading from freeCodeCampOS v3.x:

1. Review [MIGRATION.md](../MIGRATION.md) for architectural changes
2. Update your curriculum files to use new metadata format
3. Rebuild with the new CLI tool
4. Test your courses thoroughly

See [MIGRATION.md](../MIGRATION.md) for detailed migration instructions.
