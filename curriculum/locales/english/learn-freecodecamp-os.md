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

## 1

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

## 2

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

## 3

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
# git restore curriculum/locales/english/learn-freecodecamp-os.md
```

## 4

### --description--

Now, on to creating your own course.

Open a new terminal, and cd into the `learn-freecodecamp-os/` directory.

### --tests--

You should be in the `learn-freecodecamp-os/` directory.

```js
const cwd = await __helpers.getCWD();
assert.include(cwd, 'learn-freecodecamp-os');
```

## 5

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

## 6

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

## 7

### --description--

Create a `config/` directory to hold your project and state config.

### --tests--

You should have a `config/` directory.

```js
const { access, constants } = await import('fs/promises');
try {
  await access(join(project.dashedName, 'config'));
} catch (e) {
  assert.fail(e);
}
```

## 8

### --description--

Create a `config/projects.json` file. Initialize it with `[]`.

### --tests--

You should have a `config/projects.json` file.

```js
const { access, constants } = await import('fs/promises');
try {
  await access(join(project.dashedName, 'config/projects.json'));
} catch (e) {
  assert.fail(e);
}
```

The `projects.json` file should contain `[]`.

```js
const { readFile } = await import('fs/promises');
const file = await readFile(
  join(project.dashedName, 'config/projects.json'),
  'utf-8'
);
assert.equal(file?.trim(), '[]');
```

## 9

### --description--

The mandatory properties for a project in the `projects.json` file are:

- `id`: a unique identifier for the project
- `dashedName`: a string of `-` separated words

Add the following to the `projects.json` file:

```json
{
  "id": 0,
  "dashedName": "learn-freecodecamp-os"
}
```

### --tests--

Your `projects.json` file should contain an array with one object.

```js
assert.isArray(__projects);
assert.lengthOf(__projects, 1);
assert.isObject(__projects[0]);
```

The object should have the `id` and `dashedName` properties.

```js
assert.hasAllKeys(__projects[0], ['id', 'dashedName']);
```

The `id` property should be `0`.

```js
assert.equal(__projects[0].id, 0);
```

### --defore-all--

```js
const { readFile } = await import('fs/promises');
const file = await readFile(
  join(project.dashedName, 'config/projects.json'),
  'utf-8'
);
const __projects = JSON.parse(file);
global.__projects = __projects;
```

### --after-all--

```js
delete global.__projects;
```

## 10

### --description--

Create a `curriculum/locales/english/` directory to hold your course content.

<details>
  <summary>Note</summary>
  The reason for the directory format convention is to allow for multiple languages in the future.

For now, `english` is a required `locale`, and is used as the default.

</details>

### --tests--

You should have a `curriculum/` directory.

```js
const { access, constants } = await import('fs/promises');
try {
  await access(join(project.dashedName, 'curriculum'));
} catch (e) {
  assert.fail(e);
}
```

You should have a `curriculum/locales/` directory.

```js
const { access, constants } = await import('fs/promises');
try {
  await access(join(project.dashedName, 'curriculum/locales'));
} catch (e) {
  assert.fail(e);
}
```

You should have a `curriculum/locales/english/` directory.

```js
const { access, constants } = await import('fs/promises');
try {
  await access(join(project.dashedName, 'curriculum/locales/english'));
} catch (e) {
  assert.fail(e);
}
```

## 11

### --description--

Create a `curriculum/locales/english/learn-freecodecamp-os.md` file.

### --tests--

You should have a `curriculum/locales/english/learn-freecodecamp-os.md` file.

```js
const { access, constants } = await import('fs/promises');
try {
  await access(
    join(
      project.dashedName,
      'curriculum/locales/english/learn-freecodecamp-os.md'
    )
  );
} catch (e) {
  assert.fail(e);
}
```

## 12

### --description--

Add a title to the `learn-freecodecamp-os.md` file.

```markdown
# freeCodeCampOS Title
```

### --tests--

The `learn-freecodecamp-os.md` file should contain a title.

```js
const { readFile } = await import('fs/promises');
const file = await readFile(
  join(
    project.dashedName,
    'curriculum/locales/english/learn-freecodecamp-os.md'
  ),
  'utf-8'
);
assert(file.startsWith(), '# freeCodeCampOS Title');
```

## 13

### --description--

Add the first lesson to the `learn-freecodecamp-os.md` file, with a description heading.

```markdown
\\ ## 0

\\ ### --description--
```

### --tests--

The `learn-freecodecamp-os.md` file should contain a lesson.

```js
const { readFile } = await import('fs/promises');
const file = await readFile(
  join(
    project.dashedName,
    'curriculum/locales/english/learn-freecodecamp-os.md'
  ),
  'utf-8'
);
assert(file.includes('## 0'));
```

The lesson should have a description heading.

```js
const { readFile } = await import('fs/promises');
const file = await readFile(
  join(
    project.dashedName,
    'curriculum/locales/english/learn-freecodecamp-os.md'
  ),
  'utf-8'
);
assert(file.includes('### --description--'));
```

## 14

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
