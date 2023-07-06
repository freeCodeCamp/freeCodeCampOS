# freeCodeCampOS - Learn freeCodeCampOS

## 0

### --description--

Welcome to freeCodeCampOS! 👋

This example project will walk you through some of the features of freeCodeCampOS, and how to use them for your own course.

Start by opening the `curriculum/locales/english/learn-freecodecamp-os.md` file in your editor. Then, click the `Run Tests` button to go to the next lesson.

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

The `learn-freecodecamp-os.md` file is a markdown file that contains the content for your course. You will learn more about this later. For now, learn how to use the UI.

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

Then, change the sentence `Welcome to freeCodeCampOS!` in the `learn-freecodecamp-os.md` file to anything you want to see one test pass.

Finally, check the `Console` tab for further instructions.

### --tests--

You should edit the `Welcome to freeCodeCampOS!` sentence in the `curriculum/locales/english/learn-freecodecamp-os.md` file to anything you want.

```js
const { readFile } = await import('fs/promises');
const file = await readFile(
  'curriculum/locales/english/learn-freecodecamp-os.md',
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

The `curriculum/locales/english/learn-freecodecamp-os.md` file should contain the sentence `Welcome to freeCodeCampOS!`.

```js
const { readFile } = await import('fs/promises');
const file = await readFile(
  'curriculum/locales/english/learn-freecodecamp-os.md',
  'utf-8'
);
assert.include(file, 'Welcome to freeCodeCampOS!');
```

### --seed--

#### --cmd--

```bash
git restore curriculum/locales/english/learn-freecodecamp-os.md
```

## 5

### --description--

Now, on to creating your own course.

Open a new terminal, and cd into the `learn-freecodecamp-os/` directory.

### --tests--

You should be in the `learn-freecodecamp-os/` directory.

```js
const cwd = await __helpers.getCWD();
assert.include(cwd, 'learn-freecodecamp-os');
```

## 6

### --description--

Declare the `learn-freecodecamp-os/` directory as an npm project:

```bash
npm init -y
```

### --tests--

You should have a `package.json` file in `learn-freecodecamp-os/`.

```js
const { access, constants } = await import('fs/promises');
try {
  await access(join(project.dashedName, 'package.json'));
} catch (e) {
  assert.fail(e);
}
```

## 7

### --description--

Install `@freecodecamp/freecodecamp-os`.

### --tests--

You should have `@freecodecamp/freecodecamp-os` installed.

```js
const { access, constants } = await import('fs/promises');
try {
  await access(
    join(project.dashedName, 'node_modules/@freecodecamp/freecodecamp-os')
  );
} catch (e) {
  assert.fail(e);
}
```

Version `>=2` should be installed.

```js
try {
  const { stdout, stderr } = await __helpers.getCommandOutput(
    'npm list',
    project.dashedName
  );
  assert.include(stdout, '@freecodecamp/freecodecamp-os@2');
} catch (e) {
  assert.fail(e);
}
```

### --hints--

#### 0

Run `npm install @freecodecamp/freecodecamp-os` in the terminal

## 100

### --description--

**Summary**

You have learnt how to:

- install freecodecamp-os
- add required files
- use the Markdown syntax to:
  - add a title
  - add a lesson
  - add a description
  - add tests
  - add seed
  - add hints
- use the `tooling` feature
- use the reset feature
- use the `terminal` feature
- use the various project flags:
  - `isPublic`
  - `isIntegrated`
  - `blockingTests`
  - `breakOnFailure`
  - `runTestsOnWatch`
  - `seedEveryLesson`
  - `isResetEnabled`
- ignore directories for the hot-reload feature

### --tests--

When you are done, type `done` in the terminal.

```js
const lastCommand = await __helpers.getLastCommand();
assert.include(lastCommand, 'done');
```

## --fcc-end--
