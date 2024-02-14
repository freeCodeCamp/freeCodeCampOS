# Plugin System

The plugin system is a way to _hook_ into events during the runtime of the application.

Plugins are defined within the JS file specified by the [`tooling.plugins`](./configuration.md#tooling) configuration option.

## Hooks

### `onTestsStart`

Called when the tests start running, before any `--before-` hooks.

### `onTestsEnd`

Called when the tests finish running, after all `--after-` hooks.

### `onProjectStart`

Called when the project first loads, before any tests are run, and only happens once per project.

### `onProjectFinished`

Called when the project is finished, after all tests are run **and** passed, and only happens once per project.

### `onLessonPassed`

Called when a lesson passes, after all tests are run **and** passed, and only happens once per lesson.

### `onLessonFailed`

Called when a lesson fails, after all tests are run **and** any fail.

## Parser

It is possible to define a custom parser for the curriculum files. This is useful when the curriculum files are not in the default format described in the [project syntax](./project-syntax.md) section.

The first parameter of the parser functions is the project dashed name. This is the same as the `dashedName` field in the `projects.json` file.

It is up to the parser to read, parse, and return the data in the format expected by the application.

### `getProjectMeta`

```ts
(projectDashedName: string) =>
  Promise<{
    title: string;
    description: string;
    numberOfLessons: number;
    tags: string[];
  }>;
```

The `title`, `tags`, and `description` fields are expected to be either plain strings, or HTML strings which are then rendered in the client.

### `getLesson`

```admonish attention
This function can be called multiple times per lesson. Therefore, it is expected to be <dfn title="An operation that can be applied multiple times without changing the result after the initial application.">idempotent</dfn>.
```

```typescript
(projectDashedName: string, lessonNumber: number) =>
  Promise<{
    description: string;
    tests: [[string, string]];
    hints: string[];
    seed: [{ filePath: string; fileSeed: string } | string];
    isForce?: boolean;
    beforeAll?: string;
    afterAll?: string;
    beforeEach?: string;
    afterEach?: string;
  }>;
```

The `description` field is expected to be either a plain string, or an HTML string which is then rendered in the client.

The `tests[][0]` field is the test text, and the `tests[][1]` field is the test code. The test text is expected to be either a plain string, or an HTML string.

The `hints` field is expected to be an array of plain strings, or an array of HTML strings.

The `seed[].filePath` field is the relative path to the file from the workspace root. The `seed[].fileSeed` field is the file content to be written to the file.

The `seed[]` field can also be a plain string, which is then treated as a `bash` command to be run in the workspace root.

An example of this can be seen in the default parser used: <https://github.com/freeCodeCamp/freeCodeCampOS/blob/main/.freeCodeCamp/plugin/index.js>

## Example

````admonish example title=" "
```js
import { pluginEvents } from "@freecodecamp/freecodecamp-os/.freeCodeCamp/plugin/index.js";

pluginEvents.onTestsStart = async (project, testsState) => {
  console.log('onTestsStart');
};

pluginEvents.onTestsEnd = async (project, testsState) => {
  console.log('onTestsEnd');
};

pluginEvents.onProjectStart = async project => {
  console.log('onProjectStart');
};

pluginEvents.onProjectFinished = async project => {
  console.log('onProjectFinished');
};

pluginEvents.onLessonFailed = async project => {
  console.log('onLessonFailed');
};

pluginEvents.onLessonPassed = async project => {
  console.log('onLessonPassed');
};
```
````
