/**
 * Project config from `config/projects.json`
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} title
 * @property {string} dashedName
 * @property {string} description
 * @property {boolean} isIntegrated
 * @property {boolean} isPublic
 * @property {number} currentLesson
 * @property {boolean} runTestsOnWatch
 * @property {boolean} isResetEnabled
 * @property {number} numberOfLessons
 * @property {boolean} seedEveryLesson
 * @property {boolean} blockingTests
 * @property {boolean} breakOnFailure
 */

/**
 * @typedef {Object} TestsState
 * @property {boolean} passed
 * @property {string} testText
 * @property {number} testId
 * @property {boolean} isLoading
 */

export const pluginEvents = {
  /**
   * @param {Project} project
   * @param {TestsState[]} testsState
   */
  onTestsStart: async (project, testsState) => {},

  /**
   * @param {Project} project
   * @param {TestsState[]} testsState
   */
  onTestsEnd: async (project, testsState) => {},

  /**
   * @param {Project} project
   */
  onProjectStart: async project => {},

  /**
   * @param {Project} project
   */
  onProjectFinished: async project => {},

  /**
   * @param {Project} project
   */
  onLessonPassed: async project => {},

  /**
   * @param {Project} project
   */
  onLessonFailed: async project => {}
};
