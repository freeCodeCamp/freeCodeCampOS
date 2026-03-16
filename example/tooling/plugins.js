// Plugin event hooks for freeCodeCampOS.
// Note: The plugin system is not yet implemented in v4.0.0.
// These stubs will be called when the plugin API is available.

export const pluginEvents = {};

pluginEvents.onTestsStart = async (project, testsState) => {};

pluginEvents.onTestsEnd = async (project, testsState) => {};

pluginEvents.onProjectStart = async project => {};

pluginEvents.onProjectFinished = async project => {};

pluginEvents.onLessonFailed = async project => {};

pluginEvents.onLessonPassed = async project => {};
