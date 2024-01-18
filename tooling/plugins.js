import { pluginEvents } from '@freecodecamp/freecodecamp-os/.freeCodeCamp/plugin/index.js';

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
