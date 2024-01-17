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
