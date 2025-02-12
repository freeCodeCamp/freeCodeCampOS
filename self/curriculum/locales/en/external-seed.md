# External Seed

```json
{
  "id": 2,
  "dashedName": "external-seed",
  "isIntegrated": false,
  "isPublic": true,
  "runTestsOnWatch": false,
  "seedEveryLesson": true,
  "isResetEnabled": true,
  "blockingTests": false,
  "breakOnFailure": false
}
```

A project to test the default parser `external seed` feature.

## 0

### --description--

The seed for this lesson deletes any `index.js` and `log` files within the `external-seed/` directory.

### --tests--

This test should pass, if the seed worked

```js
const { readdir } = await import('fs/promises');
const dir = await readdir(join(ROOT, project.dashedName));
assert.equal(
  dir.length,
  1,
  `"${project.dashedName}" is expected to only have the .gitkeep file.`
);
```

## 1

### --description--

There should be a `index.js` file that was created and run when the lesson loaded.

### --tests--

The `index.js` file should be seeded for you.

```js
const { access, constants } = await import('fs/promises');
await access(join(ROOT, project.dashedName, 'index.js'), constants.F_OK);
```

The `index.js` file should be run.

```js
const { access, constants } = await import('fs/promises');
await access(join(ROOT, project.dashedName, 'log'), constants.F_OK);
```

## --fcc-end--
