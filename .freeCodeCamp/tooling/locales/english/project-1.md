# Rust - CLI Calculator

## 1

### --description--

To start a new Rust project, you can use the Rust build system and package manager - Cargo.

Run the following command to create a new project named `calculator`:

```bash
cargo new calculator
```

### --tests--

You can use the `cargo new calculator` command to create the project.

```js
const files = await __helpers.getDirectory(".");
// console.log("Test 1: ", files);
assert.include(files ?? "", "calculator");
```

This test always passes, as an example.

```js
assert(true);
assert.equal(1, "1");
assert.strictEqual(1, 1);
assert.include("foobar", "bar");
```

This test takes 2 seconds to complete.

```js
await new Promise((resolve) => setTimeout(resolve, 2000));
assert(true);
```

### --seed--

#### --cmd--

```bash
echo "Tom should be able to see this, if he looks quick enough"
```

## 2

### --description--

You have just created a new Rust project within the `calculator/` directory.

Change directory into `calculator/`.

### --test--

You should use `cd calculator` to change into the directory.

```js
const cwd = await __helpers.getCWD();
// console.log("Test 2: ", cwd);
assert.include(cwd, "calculator");
```

### --seed--

#### --cmd--

```bash
cargo new calculator
```

## 3

### --description--

Use Cargo to run your code:

```bash
cargo run
```

### --tests--

You should be within the `calculator/` directory.

```js
const cwd = await __helpers.getCWD();
// console.log("Test 3: ", cwd);
assert.include(cwd, "calculator");
```

You should run your code using the `cargo run` command.

```js
const terminalOutput = await __helpers.getTerminalOutput();
// console.log("Test 4: ", terminalOutput);
assert.match(terminalOutput, /Hello, world!/);
```

## 4

### --description--

Within the `src/main.rs` file, use the `let` keyword to add a variable named `firstName` and assign it a value of your first name within double quotes.

_Run your code, if you want_

### --tests--

You should declare a variable `firstName`.

```js
const code = await __helpers.getFile("calculator/src/main.rs");
console.log("Test 5: ", code);
assert.match(code, /let\s+firstName\s*=\s*\"\w+\"\s*/);
```

You should follow the compiler's advice to add a semi-colon at the end.

```js
const code = await __helpers.getFile("calculator/src/main.rs");
console.log("Test 5.2: ", code);
assert.match(code, /let\s+firstName\s*=\s*\"\w+\"\s*;/);
```

## 5

### --description--

Run your code to see what the compiler has to say.

### --tests--

You should run `cargo run`.

```js
const lastCommand = await __helpers.getLastCommand();
console.log("Test 6: ", lastCommand);
assert.include(lastCommand, "cargo run");
```

### --seed--

#### --"calculator/src/main.rs"--

```rust
fn main() {
  let firstName = "Tommm";
  println!("Hello, world!");
}
```

## 6

### --description--

Follow the compiler's advice to convert the variable name into _snake_case_.

### --tests--

You should have a variable `first_name`.

```js
const code = await __helpers.getFile("calculator/src/main.rs");
console.log("Test 7: ", code);
assert.match(code, /let\s+first_name\s*=\s*\"\w+\"\s*/);
```

### --seed--

#### --"calculator/src/main.rs"--

```rust
fn main() {
  let firstName = "Tommm";
  println!("Hello, world!");
}
```

## 7

### --description--

Well done! You are likely one of the first people to use _ShaunOS_.

### --tests--

Something to always fail. Did you know emojis are supported? 🤔

```js
assert(true);
```

This test takes a while so you can see the loader :smiley:

```js
const p = await new Promise((resolve) => setTimeout(resolve, 2000));
assert(p === true);
```

### --seed--

#### --"calculator/src/main.rs"--

```rust
fn main() {
  let first_name = "Tommm";
  println!("Hello, world!");
}
```

## 8

### --description--

Is this necessary?

### --tests--

Hi, I'm a test.

```js
assert(false);
```
