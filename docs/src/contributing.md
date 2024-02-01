# Contributing

## Local Development

1. Open `freeCodeCampOS/self` as a new workspace in VSCode
2. Run `npm i`
3. Run `freeCodeCamp: Develop Course` in the command palette

## Gitpod

1. Open the project in Gitpod:

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

This documention is built using [mdBook](https://rust-lang.github.io/mdBook/). Read their documentation to install the latest version.

Also, the documentation uses `mdbook-admonish`:

```bash
cargo install mdbook-admonish
```

### Serve the Documentation

```bash
cd docs
mdbook serve
```

This will spin up a local server at `http://localhost:3000`. Also, this has hot-reloading, so any changes you make will be reflected in the browser.

### Build the Documentation

```bash
cd docs
mdbook build
```

## CLI (`create-freecodecamp-os-app`)

The CLI is written in Rust, and is located in the `cli` directory.

### Development

```bash
$ cd cli
cli$ cargo run
```

---

## Flight Manual

### Release

Releases are done manually through the GitHub Actions.

#### Making a Release

In the `Actions` tab, select the `Publish to npm` workflow. Then, select `Run workflow`.
