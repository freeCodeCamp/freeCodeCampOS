# Globals

In the new test environment, several utilities are available directly or via the module scope of the test worker.

### `chai`

The `chai` library is used for assertions. The following are available:

- `assert`: The `assert` module: <https://www.chaijs.com/api/assert/>
- `expect`: The `expect` module: <https://www.chaijs.com/api/bdd/>
- `AssertionError`: The `AssertionError` class.

### `ROOT`

The root of the workspace. This is available as a global variable.

### `path` utilities

The `node:path` and `node:fs/promises` modules are available as:

- `join`: From `node:path`.
- `readFile`: From `node:fs/promises`.
- `writeFile`: From `node:fs/promises`.

### Built-in Helpers

The following helpers are available directly in the test context:

- `controlWrapper`: Retries a function until it succeeds.
- `getBashHistory`: Gets the `.logs/.bash_history.log` contents.
- `getCommandOutput`: Returns the output of a command.
- `getCWD`: Gets the `.logs/.cwd.log` contents.
- `getLastCommand`: Gets the \\(n^{th}\\) latest line from the bash history.
- `getLastCWD`: Gets the \\(n^{th}\\) latest line from the CWD history.
- `getTemp`: Gets the `.logs/.temp.log` contents.
- `getTerminalOutput`: Gets the `.logs/.terminal_out.log` contents.
- `importSansCache`: Imports a module while bypassing the Node.js cache.

## Collisions

As the tests are run in the context of the test worker, variable naming collisions may occur. To avoid this, it is recommended to prefix object names with `__` (dunder).
