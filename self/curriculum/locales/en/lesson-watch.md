# Lesson Watch

```json
{
  "id": 4,
  "dashedName": "lesson-watch",
  "isIntegrated": false,
  "isPublic": true,
  "runTestsOnWatch": true,
  "seedEveryLesson": false,
  "isResetEnabled": false,
  "blockingTests": false,
  "breakOnFailure": false
}
```

Watch and ignore specific files for each lesson.

## 0

<!-- Auto-reset after lesson -->

```json
{
  "watch": ["lesson-watch/watched.js"]
}
```

### --description--

Making changes to `watched.js` should run the tests, but changing `unwatched.js` should do nothing.

### --tests--

Placeholder test.

```js
// TODO: Test `watcher.watched()` for what should be watched
assert.fail();
```

## 1

```json
{
  "ignore": ["lesson-watch/unwatched.js"]
}
```

### --description--

Making any change should run the tests, but changing `unwatched.js` should do nothing.

### --tests--

Placeholder test text.

```js
assert.fail();
```

## 2

### --description--

The default option to watch and ignore are reset.

### --tests--

This always fails.

```js
assert.fail();
```

## --fcc-end--
