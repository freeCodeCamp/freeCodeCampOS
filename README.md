# freeCodeCampOS

Open source platform for creating and hosting interactive coding curricula.

See the [documentation](https://opensource.freecodecamp.org/freeCodeCampOS/) for full details.

## Architecture

freeCodeCampOS v4 is a Rust workspace with an embedded React frontend:

```
config/     # Shared types and configuration
parser/     # Curriculum markdown parser (Comrak/GFM)
runner/     # Multi-language test execution engine
server/     # Axum HTTP + WebSocket server
client/     # React 19 + TypeScript frontend (Vite)
cli/        # create-freecodecamp-os-app CLI
example/    # Example curriculum project
docs/       # mdBook documentation
```

## Quick Start

**Prerequisites:** Rust 1.93.1+, Bun 1.3.10+, Node.js 20+

```bash
# Build everything
bun run build

# Run the server (from a course directory containing freecodecamp.conf.json)
./target/release/freecodecamp-server
```

For development:

```bash
# Terminal 1: Rust backend
cargo run --bin server

# Terminal 2: React client (hot reload)
bun run dev:client
```

## Creating a Course

Use the CLI to scaffold a new course:

```bash
cargo run --bin create-freecodecamp-os-app -- create
```

Then run the server from the course directory:

```bash
cd my-course/
../target/release/server
```

End users install freeCodeCampOS via npm (`@freecodecamp/freecodecamp-os`), which provides the pre-built binary.

## Upgrading from v3

See [MIGRATION.md](./MIGRATION.md) for the full migration guide.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) and the [Contributing docs](./docs/src/contributing.md).

## License

BSD-3-Clause — see [LICENSE](./LICENSE).
