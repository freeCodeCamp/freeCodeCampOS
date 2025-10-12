# Globals

None of the globals are within the `__helpers` module.

### `chai`

#### `assert`

The `assert` module: <https://www.chaijs.com/api/assert/>

#### `expect`

The `expect` module: <https://www.chaijs.com/api/bdd/>

#### `config as chaiConfig`

The `config` module: <https://www.chaijs.com/guide/styles/#configuration>

#### `AssertionError`

This is the `AssertionError` class from the `assert` module.

### `logover`

The logger used by `freecodecamp-os`: <https://www.npmjs.com/package/logover>

This is mostly useful for debugging, as any logs will be output in the freeCodeCamp terminal.

### `ROOT`

The root of the workspace.

### `watcher`

```admonish note
This is only available in the `beforeAll` and `afterAll` context - on the main thread.
```

The [Chokidar](https://www.npmjs.com/package/chokidar) `FSWatcher` instance.

This is useful if you want to stop watching a directory during a test:

````admonish example
```javascript
const DIRECTORY_PATH_RELATIVE_TO_ROOT = "example";
watcher.unwatch(DIRECTORY_PATH_RELATIVE_TO_ROOT);
// Do something
watcher.add(DIRECTORY_PATH_RELATIVE_TO_ROOT);
```
````

## Collisions

As the tests are run in the `eval`ed context of the `freecodecamp-os/.freeCodeCamp/tooling/tests/test-worker.js` module, there is the possibility that variable naming collisions will occur. To avoid this, it is recommended to prefix object names with `__` (dunder).
