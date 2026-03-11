# Build X Using Y

```json
{
  "tags": ["Integrated Project", "Coming soon!"]
}
```

In this course, you will build x using y.

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

Testing if a worker error causes the server to crash.

```js
// 3
try {
  fetch('http://localhost:3123');
} catch (e) {
  console.log('------test------');
  console.log(e);
  console.log('------test------');
  assert.equal(e.message, 'Failed to fetch');
}
```

### --before-each--

```js
await new Promise(resolve => setTimeout(resolve, 1000));
const __projectLoc = 'example global variable for tests';
```

### --after-each--

```js
await new Promise(resolve => setTimeout(resolve, 1000));
logover.info('after each');
```

### --before-all--

```js
await new Promise(resolve => setTimeout(resolve, 1000));
logover.info('before all');
```

### --after-all--

```js
await new Promise(resolve => setTimeout(resolve, 1000));
logover.info('after all');
```

### --hints--

#### 0

Inline hint with `some` code `blocks`.

#### 1

Multi-line hint with:

```js
const code_block = true;
```

### --seed--

#### --force--

#### --"build-x-using-y/readme.md"--

```markdown
# Build X Using Y

In this course

## 0

Hello
```

#### --cmd--

```bash
npm install
```

## --fcc-end--
