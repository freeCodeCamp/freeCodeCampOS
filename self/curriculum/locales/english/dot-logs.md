# Dot Logs

The `.logs/` folder and features

## 0

```json
{
  "watch": [".logs/.script_in.log"]
}
```

### --description--

In a new terminal, start typing `dot logs`, and the tests should run.

### --tests--

Placeholder test.

```js
const scriptIn = await __helpers.getScriptInEquivalent();
assert.match(scriptIn, /dot logs/);
```

## 1

### --description--

Well done.

### --tests--

fail

```js
assert.fail();
```

## --fcc-end--
