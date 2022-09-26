# freeCodeCampOS - Learn X by Building Y

## 1

### --description--

Add something to a file:

```javascript
const codeToAdd = 'Hello';
```

### --tests--

You should declare a variable named `a`.

```js
const test = `console.assert(typeof a);`;
const filePath = 'learn-x-by-building-y/index.js';
const cb = (stdout, stderr) => {
  assert.isEmpty(stderr);
  assert.exists(stdout);
};
await __helpers.javascriptTest(filePath, test, cb);
```

You should give `a` a value of `1`.

```js
const test = `console.assert(a === 1, \`expected \${a} to equal 1\`);`;
const filePath = 'learn-x-by-building-y/index.js';
const cb = (stdout, stderr) => {
  assert.isEmpty(stderr);
  assert.exists(stdout);
};
await __helpers.javascriptTest(filePath, test, cb);
```

### --seed--

#### --"index.js"--

```js
const a = 0;
```

#### --cmd--

```bash
echo "I should run first"
```

#### --cmd--

```bash
mkdir test
```

#### --cmd--

```bash
touch test/index.ts
```

#### --"test/index.ts"--

```ts
const test: string = 'test';
```

### --seed--

#### --cmd--

```bash
git restore .
```

## 2

### --description--

Description with code block:

```rust
fn main() {
    println!("Hello, world!");
}
```

### --tests--

You should ...

```js
await new Promise(resolve => setTimeout(resolve, 2000));
assert.equal(true, true);
```

### --seed-- <!-- Seed should be run in order written -->

#### --"index.js"--

```javascript
const codeToAdd = 'Hello';
```

## 3

### --description--

Description.

### --tests--

You should ...

```js
await new Promise(resolve => setTimeout(resolve, 2000));
assert.equal(true, true);
```

## 4

### --description--

Description.

### --tests--

You should ...

```js
await new Promise(resolve => setTimeout(resolve, 2000));
assert.equal(true, true);
```

## 5

### --description--

Description.

### --tests--

You should ...

```js
await new Promise(resolve => setTimeout(resolve, 2000));
assert.equal(true, true);
```

## 6

### --description--

Description.

### --tests--

You should fail...

```js
await new Promise(resolve => setTimeout(resolve, 2500));
assert.fail('You will always fail this');
```

## --fcc-end--
