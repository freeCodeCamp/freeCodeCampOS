import { pluginEvents } from '@freecodecamp/freecodecamp-os/.freeCodeCamp/plugin/index.js';

pluginEvents.onTestsStart = async (project, testsState) => {};

pluginEvents.onTestsEnd = async (project, testsState) => {};

pluginEvents.onProjectStart = async project => {};

pluginEvents.onProjectFinished = async project => {};

pluginEvents.onLessonFailed = async project => {};

pluginEvents.onLessonPassed = async project => {};
