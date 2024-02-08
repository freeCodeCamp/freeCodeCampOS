# Heading

Project description

## 0

### --description--

## `Within Description`

Hi.

````markdown
# Fake Heading

Fake project description.

```js
const a = 1;
```

## 0

### --description--

Fake description.
````

Over multiple lines.

### --tests--

Some test text.

```js
const a = 1;
```

## 1

### --description--

Lesson 1 description.

### --tests--

Lesson 1 tests.

```js
assert.strictEqual(a, 1);
```

### --before-all--

```js
const a = 1;
```

### --after-all--

```js
const a = 2;
```

### --before-each--

```js
const a = 3;
```

### --after-each--

```js
const a = 4;
```

### --seed--

#### --force--

#### --cmd--

```bash
npm install
```

#### --"some/path/to/file.rs"--

```rust
fn main() {
    println!("Hello, world!");
}
```

### --hints--

#### 0

Hint 0. Some code:

```rust
const A: i32 = 1;
```

#### 1

Hint 1. Inline `code`.

## --fcc-end--
