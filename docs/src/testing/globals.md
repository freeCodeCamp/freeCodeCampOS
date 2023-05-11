# Globals

None of the globals are within the `__helpers` module.

### `chai.assert`

The `chai.assert` module: <https://www.chaijs.com/api/assert/>

### `fs`

The `fs` module for file system operations: <https://nodejs.org/api/fs.html>

### `join`

The `join` function from the `path` module: <https://nodejs.org/api/path.html#pathjoinpaths>

### `logover`

The logger used by `freecodecamp-os`: <https://www.npmjs.com/package/logover>

This is mostly useful for debugging, as any logs will be output in the freeCodeCamp terminal.

### `ROOT`

The root of the workspace.

### `import`

As expected, the `import` function allows any other available module to be dynamically imported.

## Collisions

As the tests are run in the `eval`ed context of the `freecodecamp-os/.freeCodeCamp/tooling/test.js` module, there is the possibility that variable naming collisions will occur. To avoid this, it is recommended to prefix object names with `__` (dunder).
