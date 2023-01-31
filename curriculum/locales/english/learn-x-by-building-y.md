# freeCodeCampOS - Learn X by Building Y

## 1

### --description--

Declare a variable `a` with value `1`, in `index.js`.

```javascript
const a = 1;
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
// I am an example boilerplate file
```

## 2

### --description--

Create a new directory named `test`, and create a file `test/index.ts`.

Then add the following:

```ts
const test: string = 'test';
```

### --tests--

You should ...

```js
await new Promise(resolve => setTimeout(resolve, 2000));
assert.equal(true, true);
```

### --seed--

#### --"index.js"--

```javascript
// I am an example boilerplate file
const a = 1;
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

### --seed--

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

This test will pass after 5 seconds.

```js
await new Promise(resolve => setTimeout(resolve, 5000));
assert.equal(1, 1);
```

## --fcc-end--
