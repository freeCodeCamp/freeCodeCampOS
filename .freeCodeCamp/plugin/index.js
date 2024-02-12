import { readFile } from 'fs/promises';
import { freeCodeCampConfig, getState, ROOT } from '../tooling/env.js';
import { CoffeeDown, parseMarkdown } from '../tooling/parser.js';
import { join } from 'path';
import { logover } from '../tooling/logger.js';

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

/**
 * @typedef {Object} Lesson
 * @property {string} description
 * @property {[[string, string]]} tests
 * @property {string[]} hints
 * @property {[{filePath: string; fileSeed: string} | string]} seed
 * @property {boolean?} isForce
 * @property {string?} beforeAll
 * @property {string?} afterAll
 * @property {string?} beforeEach
 * @property {string?} afterEach
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
  onLessonFailed: async project => {},

  /**
   * @param {string} projectDashedName
   * @returns {Promise<{title: string; description: string; numberOfLessons: number}>}
   */
  getProjectMeta: async projectDashedName => {
    const { locale } = await getState();
    const projectFilePath = join(
      ROOT,
      freeCodeCampConfig.curriculum.locales[locale],
      projectDashedName + '.md'
    );
    const projectFile = await readFile(projectFilePath, 'utf8');
    const coffeeDown = new CoffeeDown(projectFile);
    const projectMeta = coffeeDown.getProjectMeta();
    // Remove `<p>` tags if present
    const title = parseMarkdown(projectMeta.title).replace(/<p>|<\/p>/g, '');
    const description = parseMarkdown(projectMeta.description);
    const numberOfLessons = projectMeta.numberOfLessons;
    return { title, description, numberOfLessons };
  },

  /**
   * @param {string} projectDashedName
   * @param {number} lessonNumber
   * @returns {Promise<Lesson>} lesson
   */
  getLesson: async (projectDashedName, lessonNumber) => {
    const { locale } = await getState();
    const projectFilePath = join(
      ROOT,
      freeCodeCampConfig.curriculum.locales[locale],
      projectDashedName + '.md'
    );
    const projectFile = await readFile(projectFilePath, 'utf8');
    const coffeeDown = new CoffeeDown(projectFile);
    const lesson = coffeeDown.getLesson(lessonNumber);
    let seed = lesson.seed;
    if (!seed.length) {
      // Check for external seed file
      const seedFilePath = projectFilePath.replace(/.md$/, '-seed.md');
      try {
        const seedContent = await readFile(seedFilePath, 'utf-8');
        const coffeeDown = new CoffeeDown(seedContent);
        seed = coffeeDown.getLesson(lessonNumber).seed;
      } catch (e) {
        if (e?.code !== 'ENOENT') {
          logover.debug(e);
          throw new Error(
            `Error reading external seed for lesson ${lessonNumber}`
          );
        }
      }
    }
    const { afterAll, afterEach, beforeAll, beforeEach, isForce } = lesson;
    const description = parseMarkdown(lesson.description);
    const tests = lesson.tests.map(([testText, test]) => [
      parseMarkdown(testText),
      test
    ]);
    const hints = lesson.hints.map(parseMarkdown);
    return {
      description,
      tests,
      hints,
      seed,
      beforeAll,
      afterAll,
      beforeEach,
      afterEach,
      isForce
    };
  }
};
