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
 * @property {{watch?: string[]; ignore?: string[]} | undefined} meta
 * @property {string} description
 * @property {Array<{ text: string; runner: string; code: string; }>} tests
 * @property {string[]} hints
 * @property {[{filePath: string; fileSeed: string} | string]} seed
 * @property {boolean?} isForce
 * @property {{ runner: string; code: string; } | null} beforeAll
 * @property {{ runner: string; code: string; } | null} afterAll
 * @property {{ runner: string; code: string; } | null} beforeEach
 * @property {{ runner: string; code: string; } | null} afterEach
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
   * @param {Project} project
   */
  onLessonLoad: async project => {},

  /**
   * @param {string} projectDashedName
   * @returns {Promise<{title: string; description: string; numberOfLessons: number; tags: string[]}>}
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
    const title = parseMarkdown(projectMeta.title)
      .replace(/<p>|<\/p>/g, '')
      .trim();
    const description = parseMarkdown(projectMeta.description).trim();
    const tags = projectMeta.tags;
    const numberOfLessons = projectMeta.numberOfLessons;
    return { title, description, numberOfLessons, tags };
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
    const { afterAll, afterEach, beforeAll, beforeEach, isForce, meta } =
      lesson;
    const description = parseMarkdown(lesson.description).trim();
    const tests = lesson.tests.map(t => {
      return { ...t, text: parseMarkdown(t.text).trim() };
    });
    const hints = lesson.hints.map(h => parseMarkdown(h).trim());
    return {
      meta,
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
