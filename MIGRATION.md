# Rust Migration Spec

## Goal

Migrate this repository from Nodejs to Rust. Split and organise components into multiple APIs. Distribute application as a single-binary.

## Components

Below are the main components and tooling expected as the result of the migration.

- `cli`
  - rust, clap
  - CLI for creating an interacting with freecodecamp-os curricula
- `client`
  - react, typescript, vitejs (rolldown), @tanstack/react-query, marked, prismjs
  - frontend for main UI to view curriculum and interact with server
- `config`
  - rust, serde
  - library of common types across components
- `docs`
  - rust, mdbook
  - user documentation for application
- `example`
  - a usage example of freecodecamp-os
- `parser`
  - rust, serde, (well-maintained GFM markdown parser)
  - library to parse curriculum markdown files
- `runner`
  - rust, node
  - library of runners to execute given code (e.g. nodejs, rust, bash, python)
- `server`
  - rust, axum, serde, tokio, notify
  - rest http api and server to be the main entrypoint of the application

## Design

### `cli`

What already exists in `cli/` should be used as a base. Update existing crates, and types to match migration.

### `client`

Should mostly re-use what is in `.freeCodeCamp/client/`, but be moved to root of repo, and be bundled with Vitejs (rolldown). Packages should be managed with `bun` not `npm`.

### `config`

Consider which structures make the most sense to be shared as a library. The best place to start is the `freecodecamp.conf.json` configuration file.

### `docs`

What exists in `docs` should be a base-line. Update as needed to match migration changes.

### `example`

Take what exists in `self/`, but update configs and projects markdown with new structure.

### `parser`

Create a similar API to what is in `.freeCodeCamp/tooling/parser.js`. Use a well-maintained markdown parser that supports GitHub Flavoured Markdown.

Example of new project markdown file:

````markdown
# Learn freeCodeCampOS

In this course, you will learn how to use the `@freecodecamp/freecodecamp-os` package to develop courses.

## 0

### --description--

Welcome to freeCodeCampOS! 👋

This example project will walk you through some of the features of freeCodeCampOS, and how to use them for your own course.

Start by opening the `curriculum/locales/english/learn-freecodecamp-os.md` file in your editor. Then, click the `Run Tests` button to go to the next lesson.

<details>
  <summary>Tidbit</summary>

Did you know the "OS" in freeCodeCampOS stands for "Open Source"?

![image](./images/image.png)

</details>

### --tests--

This is a test that will always pass.

```js,runner=node
console.log("Test");
assert(true);
```

## 1

### --description--

The `learn-freecodecamp-os.md` file is a markdown file that contains the content for your course. You will learn more about this later. For now, learn how to use the UI.

Click the `Run Tests` button again. Then, click the `Console` tab in the bottom panel, expand the test `details`, and follow the instructions.

### --tests--

This is a test that will always fail.

```js,runner=node
await new Promise((resolve) => setTimeout(resolve, 5000));
assert.fail(
  "This is a custom test assertion message. Click the > button to go to the next lesson"
);
```

## 2

### --description--

Click the `Run Tests` button to see two failed tests.

Then, change the sentence `Welcome to freeCodeCampOS!` in the `learn-freecodecamp-os.md` file to anything you want to see one test pass.

Finally, check the `Console` tab for further instructions.

### --tests--

You should edit the `Welcome to freeCodeCampOS!` sentence in the `curriculum/locales/english/learn-freecodecamp-os.md` file to anything you want.

```js,runner=node
const { readFile } = await import("fs/promises");
const file = await readFile(
  "curriculum/locales/english/learn-freecodecamp-os.md",
  "utf-8"
);
await new Promise((resolve) => setTimeout(resolve, 5000));
assert.notInclude(file.slice(0, 100), "Welcome to freeCodeCampOS!");
```

I always fail 🙃

```js,runner=node
await new Promise((resolve) => setTimeout(resolve, 3000));
console.log("Look! Worker stdout is printed in debug mode: ", __a);
assert(__a == 1);
assert.fail("Click the > button to go to the next lesson");
```

Something py.

```python,runner=python
print(__a)
```

### --before-each--

```js,runner=node
const __a = 1;
```

```python,runner=python
__a = 1
```

## 3

### --description--

You changed something you should not have 😱, and you do not know how to continue.

Fret not! Press the `Reset Project` button to run the <dfn title="starting state for a lesson">seed</dfn>

### --tests--

The `curriculum/locales/english/learn-freecodecamp-os.md` file should contain the sentence `Welcome to freeCodeCampOS!`.

```js,runner=node
const { readFile } = await import("fs/promises");
const file = await readFile(
  join(ROOT, "curriculum/locales/english/learn-freecodecamp-os.md"),
  "utf-8"
);
assert.include(file.slice(0, 100), "Welcome to freeCodeCampOS!");
```

### --seed--

#### --cmd--

```bash,runner=bash
git restore curriculum/locales/english/learn-freecodecamp-os.md
```

## 4

### --description--

Now, on to creating your own course.

Open a new terminal, and cd into the `learn-freecodecamp-os/` directory.

### --tests--

You should be in the `learn-freecodecamp-os/` directory.

```js,runner=node
const cwd = await __helpers.getCWD();
assert.include(cwd, "learn-freecodecamp-os");
```

## 5

### --description--

Declare the `learn-freecodecamp-os/` directory as an npm project:

```bash,runner=bash
npm init -y
```

### --tests--

You should have a `package.json` file in `learn-freecodecamp-os/`.

```js,runner=node
const { access, constants } = await import("fs/promises");
try {
  await access(join(project.dashedName, "package.json"));
} catch (e) {
  assert.fail(e);
}
```
````

### `runner`

Use `std::process::Command` for a Nodejs and Bash runner as MVP.

### `server`

Use the latest version of `axum` with `ws` feature to have a similar feature set to what is in `.freeCodeCamp/tooling/server.js`.

Ensure the client is embedded into the binary of the server build for easy distribution.

## Major Changes

- `projects.json` is the source of truth for project metadata
  - this file contains an array of project objects, each with its own metadata
  - this replaces the previous design of having metadata embedded in project markdown files
- runner now supports multiple languages
  - care should be taken with order of code execution

## Additional Notes

The plugin feature might need to be removed, as it could be too complex to integrate.
