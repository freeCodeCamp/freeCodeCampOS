# freeCodeCampOS - Learn X by Building Y

## 1

### --description--

Welcome to freeCodeCampOS! 👋

This example project will walk you through some of the features of freeCodeCampOS, and how to use them for your own course.

Start by opening the `curriculum/locales/english/learn-x-by-building-y.md` file in your editor. Then, click the `Run Tests` button to go to the next lesson.

<details>
  <summary>Tidbit</summary>

Did you know the "OS" in freeCodeCampOS stands for "Open Source"?

</details>

### --tests--

This is a test that will always pass.

```js
assert(true);
```

## 2

### --description--

The `learn-x-by-building-y.md` file is a markdown file that contains the content for your course. You will learn more about this later. For now, learn how to use the UI.

Click the `Run Tests` button again. Then, click the `Console` tab in the bottom panel, expand the test `details`, and follow the instructions.

### --tests--

This is a test that will always fail.

```js
assert.fail(
  'This is a custom test assertion message. Click the > button to go to the next lesson'
);
```

## 3

### --description--

Click the `Run Tests` button to see two failed tests.

Then, change the sentence `Welcome to freeCodeCampOS!` in the `learn-x-by-building-y.md` file to anything you want to see one test pass.

Finally, check the `Console` tab for further instructions.

### --tests--

You should edit the `Welcome to freeCodeCampOS!` sentence in the `curriculum/locales/english/learn-x-by-building-y.md` file to anything you want.

```js
const { readFile } = await import('fs/promises');
const file = await readFile(
  'curriculum/locales/english/learn-x-by-building-y.md',
  'utf-8'
);
assert.notInclude(file, 'Welcome to freeCodeCampOS!');
```

I always fail 🙃

```js
assert.fail('Click the > button to go to the next lesson');
```

## 4

### --description--

You changed something you should not have 😱, and you do not know how to continue.

Fret not! Press the `Reset Project` button to run the <dfn title="starting state for a lesson">seed</dfn>

### --tests--

The `curriculum/locales/english/learn-x-by-building-y.md` file should contain the sentence `Welcome to freeCodeCampOS!`.

```js
const { readFile } = await import('fs/promises');
const file = await readFile(
  'curriculum/locales/english/learn-x-by-building-y.md',
  'utf-8'
);
assert.include(file, 'Welcome to freeCodeCampOS!');
```

### --seed--

#### --cmd--

```bash
git restore curriculum/locales/english/learn-x-by-building-y.md
```

## 5

### --description--

## --fcc-end--
