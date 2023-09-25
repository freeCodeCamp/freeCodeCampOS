# freeCodeCamp - Build X Using Y

## 0

### --description--

Some description here.

```rust
fn main() {
    println!("Hello, world!");
}
```

Here is an image:

<img src="../../images/fcc_primary_large.png" width="300px" />

### --tests--

First test using Chai.js `assert`.

```js
// 0
// Timeout for 3 seconds
await new Promise(resolve => setTimeout(resolve, 3000));
assert.equal(true, true);
```

Second test using global variables passed from `before` hook.

```js
// 1
await new Promise(resolve => setTimeout(resolve, 4000));
assert.equal(__projectLoc, 'example global variable for tests');
```

Dynamic helpers should be imported.

```js
// 2
await new Promise(resolve => setTimeout(resolve, 1000));
assert.equal(__helpers.testDynamicHelper(), 'Helper success!');
```

### --before-all--

```js
global.__projectLoc = 'example global variable for tests';
```

### --after-all--

```js
// Clean up
delete global.__projectLoc;
```

## --fcc-end--
