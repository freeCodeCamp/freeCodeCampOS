# Lesson Watch

```json
{
  "id": "c3d4e5f6-a1b2-4c5d-0e1f-2a3b4c5d6e7f",
  "order": 2,
  "is_integrated": false,
  "is_public": true,
  "run_tests_on_watch": true,
  "seed_every_lesson": false,
  "is_reset_enabled": true
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
