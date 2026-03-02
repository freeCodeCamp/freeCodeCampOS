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

```json
{
  "id": 0,
  "is_integrated": false,
  "is_public": true,
  "run_tests_on_watch": true,
  "seed_every_lesson": false,
  "is_reset_enabled": true,
  "blocking_tests": null,
  "break_on_failure": null
}
```

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

Use `std::process::Command` for a Nodejs and Bash runner as MVP. Here is an example (rough) structure:

```
runner/
| scripts/
| | node/
| | | index.js
| | | test-worker.js
| src/
| | runners/
| | | mod.rs
| | | node.rs
| | error.rs
| | lib.rs
```

runner/src/runners/node.rs

```rust
use config::Project;
use std::{
    io::{Read, Write},
    process::Command,
};
use tempfile::NamedTempFile;
use tracing::error;

use crate::Runner;
use crate::{error::Error, manifest::Manifest, Hooks, Test}; // trait is re-exported from types

static NODE_ENTRY: &str = include_str!("../../scripts/node/index.js");
static NODE_WORKER: &str = include_str!("../../scripts/node/test-worker.js");

pub struct Node;

impl Runner for Node {
    fn execute(project: Project, tests: Vec<Test>, hooks: Hooks) -> Result<Vec<Test>, Error> {
        // Ensure test dir exists
        let exists = std::fs::exists("../.test")?;
        if !exists {
            std::fs::create_dir_all("../.test")?;
        }

        let mut entry = NamedTempFile::new_in("../.test").unwrap();
        entry.write_all(NODE_ENTRY.as_bytes()).unwrap();
        let mut test_worker = NamedTempFile::new_in("../.test").unwrap();
        test_worker.write_all(NODE_WORKER.as_bytes()).unwrap();

        let mut project_file = NamedTempFile::new_in("../.test").unwrap();
        project_file
            .write_all(serde_json::to_string(&project).unwrap().as_bytes())
            .unwrap();
        let mut hooks_file = NamedTempFile::new_in("../.test").unwrap();

        hooks_file
            .write_all(serde_json::to_string(&hooks).unwrap().as_bytes())
            .unwrap();

        // one test file per test
        let mut test_files = vec![];

        for test in tests {
            let mut test_file = NamedTempFile::new_in("../.test").unwrap();
            test_file
                .write_all(serde_json::to_string(&test).unwrap().as_bytes())
                .unwrap();
            test_files.push(test_file);
        }

        let mut manifest_file = NamedTempFile::new_in("../.test").unwrap();

        let manifest = Manifest {
            project_path: project_file.path().to_path_buf(),
            hooks_path: hooks_file.path().to_path_buf(),
            test_paths: test_files.iter().map(|t| t.path().to_path_buf()).collect(),
        };

        manifest_file
            .write_all(serde_json::to_string(&manifest).unwrap().as_bytes())
            .unwrap();

        let mut child = Command::new("node")
            .arg(entry.path())
            .env("MANIFEST_PATH", &manifest_file.path())
            .env("TEST_WORKER_PATH", &test_worker.path())
            .current_dir("../")
            .spawn()
            .unwrap();

        let status = child.wait().expect("failed to wait on child");

        if !status.success() {
            eprintln!("Node.js test runner exited with error: {:?}", status.code());
        }

        let tests = test_files
            .iter()
            .map(|f| {
                let mut buf = Vec::new();
                let mut file = f.reopen().unwrap();
                file.read_to_end(&mut buf).unwrap();
                match serde_json::from_slice(&buf) {
                    Ok(v) => v,
                    Err(e) => {
                        error!(error = ?e, "unable to parse test file");
                        panic!("{e:?}");
                    }
                }
            })
            .collect();

        println!("{:#?}", tests);

        Ok(tests)
    }
}
```

runner/scripts/node/index.js

```js
import { readFile, writeFile } from 'node:fs/promises';
import { Worker } from 'node:worker_threads';

const MANIFEST_PATH = process.env.MANIFEST_PATH;
const TEST_WORKER_PATH = process.env.TEST_WORKER_PATH;

async function runTest(test, project, hooks) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(TEST_WORKER_PATH, {
      name: `worker-${test.id}`,
      workerData: { before_each: hooks.before_each, project }
    });

    worker.on('message', async message => {
      const { passed, id, error } = message;
      test.state.kind = passed ? 'PASSED' : 'FAILED';
      test.state.content = error;

      await writeFile(test.path, JSON.stringify(test), 'utf-8');

      if (error && error.type !== 'AssertionError') {
        console.error(`Test #${id}:`, error);
      }

      try {
        await eval(`(async () => { ${hooks.after_each} })();`);
      } catch (e) {
        console.error('--after-each-- hook failed:', e);
      }
      resolve();
    });

    worker.on('error', reject);
    worker.on('exit', code => {
      if (code !== 0)
        reject(new Error(`Worker ${test.id} exited with code ${code}`));
    });

    worker.postMessage({ code: test.code, id: test.id });
  });
}

async function main() {
  const MANIFEST = JSON.parse(await readFile(MANIFEST_PATH, 'utf-8'));
  const PROJECT = JSON.parse(await readFile(MANIFEST.project_path, 'utf-8'));
  const HOOKS = JSON.parse(await readFile(MANIFEST.hooks_path, 'utf-8'));

  const { before_all, after_all } = HOOKS;

  if (before_all) {
    try {
      await eval(`(async () => {${before_all}})()`);
    } catch (e) {
      console.error('--before-all-- hook failed:', e);
    }
  }

  const tests = [];
  for (const testPath of MANIFEST.test_paths) {
    const test = JSON.parse(await readFile(testPath, 'utf-8'));
    test.state.kind = 'NEUTRAL';
    test.path = testPath;
    await writeFile(testPath, JSON.stringify(test), 'utf-8');
    tests.push(test);
  }

  if (PROJECT.blocking_tests) {
    for (const test of tests) {
      await runTest(test, PROJECT, HOOKS);
    }
  } else {
    await Promise.all(tests.map(test => runTest(test, PROJECT, HOOKS)));
  }

  if (after_all) {
    try {
      await eval(`(async () => {${after_all}})()`);
    } catch (e) {
      console.error('--after-all-- hook failed:', e);
    }
  }
}

main()
  .then(() => {
    console.log('Runner finished successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Runner failed:', err);
    process.exit(1);
  });
```

runner/scripts/node/test-worker.js

```js
import { parentPort, workerData } from 'node:worker_threads';
// These are used in the local scope of the `eval` in `runTests`
import { assert, AssertionError, expect, config as chaiConfig } from 'chai';

const { before_each = '', project } = workerData;

parentPort.on('message', async ({ code, id }) => {
  let passed = false;
  let error = null;
  try {
    const _eval_out = await eval(`(async () => {
      ${before_each}
      ${code}
})();`);
    passed = true;
  } catch (e) {
    error = {};
    Object.getOwnPropertyNames(e).forEach(key => {
      error[key] = e[key];
    });
    // Cannot pass `e` "as is", because classes cannot be passed between threads
    error.type = e instanceof AssertionError ? 'AssertionError' : 'Error';
  }
  parentPort.postMessage({ passed, id, error });
});
```

### `server`

Use the latest version of `axum` with `ws` feature to have a similar feature set to what is in `.freeCodeCamp/tooling/server.js`.

Ensure the client is embedded into the binary of the server build for easy distribution.

## Major Changes

- `projects.json` no longer exists
  - the config will be added to the project markdown meta (see parser example above)
- runner now supports multiple languages
  - care should be taken with order of code execution

## Additional Notes

The plugin feature might need to be removed, as it could be too complex to integrate.
