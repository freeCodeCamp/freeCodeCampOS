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

## Collisions

As the tests are run in the `eval`ed context of the `freecodecamp-os/.freeCodeCamp/tooling/test.js` module, there is the possibility that variable naming collisions will occur. To avoid this, it is recommended to prefix object names with `__` (dunder).
