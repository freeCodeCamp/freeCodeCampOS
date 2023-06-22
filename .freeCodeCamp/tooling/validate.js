import { join } from 'path';
import { readdir, access, constants, readFile } from 'fs/promises';
import { freeCodeCampConfig, ROOT } from './env.js';
import { logover } from './logger.js';
import {
  getLessonDescription,
  getLessonFromFile,
  getLessonHintsAndTests,
  getLessonSeed,
  getProjectTitle
} from './parser.js';

const CURRICULUM_PATH = join(
  ROOT,
  freeCodeCampConfig.curriculum.locales.english
);
const CONFIG_PATH = join(ROOT, freeCodeCampConfig.config['projects.json']);

/**
 * # Validate Curriculum
 *
 * The validation throws when it encounters something that could break the functionality of the server,
 * and logs a warning for anti-patterns that do not cause panics.
 *
 * - Project - refers to the markdown file in the curriculum directory with lesson content
 * - Seed - refers to the markdown file with **only** seed content
 * - Boilerplate - refers to a project's corresponding boilerplate directory at root
 * - Config - refers to the `projects.json` file entry for a project
 *
 * ## Errors
 *
 * ### Projects
 *
 * - Each project has an H1 heading
 * - Each project is associated with a boilerplate
 * - Each project has congruent lesson numbers
 *   - First lesson is 1
 * - Each project ends in `--fcc-end--`
 *
 * ### Configs
 *
 * - All configs have `dashedName` and `id` fields
 * - All configs have a matching project by the `dashedName` field
 * - Any `currentLesson` field is >= 1
 * - Any `currentLesson` field is <= the number of lessons in the project
 * - Any `isIntegrated` field is a boolean
 * - Any `isPublic` field is a boolean
 * - Any `runTestsOnWatch` field is a boolean
 * - Any `isResetEnabled` field is a boolean
 * - Any `seedEveryLesson` field is a boolean
 * - Any `blockingTests` field is a boolean
 * - Any `breakOnFailure` filed is a boolean
 *
 * ### Seeds
 *
 * - All seed lesson numbers are greater than 0
 *
 * ## Warnings
 *
 * ### Projects
 *
 * - Each project lesson has a `--description--` heading
 *   - Each description is not empty
 * - Each project lesson has a `--tests--` heading
 *   - Each project lesson tests section is not empty
 *
 * ### Configs
 *
 * - Each config has a `description` field
 * - Each config has a `title` field
 * - If `breakOnFailure` is true, `blockingTests` is also true
 *
 * ### Seeds
 *
 * - Seed already exists in lesson
 * - No seed lesson number is greater than the number of lessons in the project
 * - Lesson numbers are ordered
 */
export async function validateCurriculum() {
  const curriculumFiles = await readdir(CURRICULUM_PATH);
  const projects = curriculumFiles.filter(
    file => file.endsWith('.md') && !file.endsWith('-seed.md')
  );
  const seeds = curriculumFiles.filter(file => file.endsWith('-seed.md'));
  const projectsConfig = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));

  for (const project of projects) {
    const projectDirPath = project.replace('.md', '');
    try {
      await access(projectDirPath, constants.F_OK);
    } catch (e) {
      throw new Error(
        `Project "${project}" does not have an associated root directory (boilerplate)`
      );
    }
  }

  for (const config of projectsConfig) {
    if (config.id !== 0 && !config.id) {
      throw new Error(`Config "${config}" does not have an id`);
    }
    if (!config.dashedName) {
      throw new Error(`Config "${config}" does not have a dashedName`);
    }
    if (config.currentLesson && config.currentLesson < 1) {
      throw new Error(`Config "${config}" has a currentLesson less than 1`);
    }
    if (config.currentLesson && config.currentLesson > config.numberOfLessons) {
      throw new Error(
        `Config "${config}" has a currentLesson greater than the number of lessons`
      );
    }
    if (
      config.isIntegrated !== undefined &&
      typeof config.isIntegrated !== 'boolean'
    ) {
      throw new Error(`Config "${config}" has a non-boolean isIntegrated`);
    }
    if (config.isPublic !== undefined && typeof config.isPublic !== 'boolean') {
      throw new Error(`Config "${config}" has a non-boolean isPublic`);
    }
    if (
      config.runTestsOnWatch !== undefined &&
      typeof config.runTestsOnWatch !== 'boolean'
    ) {
      throw new Error(`Config "${config}" has a non-boolean runTestsOnWatch`);
    }
    if (
      config.isResetEnabled !== undefined &&
      typeof config.isResetEnabled !== 'boolean'
    ) {
      throw new Error(`Config "${config}" has a non-boolean isResetEnabled`);
    }
    if (
      config.seedEveryLesson !== undefined &&
      typeof config.seedEveryLesson !== 'boolean'
    ) {
      throw new Error(`Config "${config}" has a non-boolean seedEveryLesson`);
    }
    if (
      config.blockingTests !== undefined &&
      typeof config.blockingTests !== 'boolean'
    ) {
      throw new Error(`Config "${config}" has a non-boolean blockingTests`);
    }
    if (
      config.breakOnFailure !== undefined &&
      typeof config.breakOnFailure !== 'boolean'
    ) {
      throw new Error(`Config "${config}" has a non-boolean breakOnFailure`);
    }
    if (config.breakOnFailure && !config.blockingTests) {
      logover.warn(
        `Config "${config}" has breakOnFailure=true but blockingTests=false. The breakOnFailure feature has no effect without blockingTests=true`
      );
    }
    if (!config.description) {
      logover.warn(`Config "${config}" does not have a description`);
    }
    if (!config.title) {
      logover.warn(`Config "${config}" does not have a title`);
    }

    const project = projects.find(
      file => file.replace('.md', '') === config.dashedName
    );
    if (!project) {
      throw new Error(`Config "${config}" does not have a matching project`);
    }
    const projectPath = join(CURRICULUM_PATH, project);
    const projectFile = await readFile(projectPath, 'utf8');
    if (!projectFile.trimEnd().endsWith('--fcc-end--')) {
      throw new Error(`Project "${project}" does not end with --fcc-end--`);
    }
    const projectLessons = [...projectFile.matchAll(/\n## (\d+)/g)]
      .filter(Boolean)
      .map(([, num]) => Number(num));
    if (!projectLessons.length) {
      throw new Error(`Project "${project}" does not have any lessons`);
    }

    const seed = seeds.find(
      file => file.replace('-seed.md', '') === config.dashedName
    );
    if (seed) {
      const seedPath = join(CURRICULUM_PATH, seed);
      const seedFile = await readFile(seedPath, 'utf8');
      if (!seedFile.trimEnd().endsWith('--fcc-end--')) {
        throw new Error(`Seed "${seed}" does not end with --fcc-end--`);
      }
      const seedLessons = [...seedFile.matchAll(/\n## (\d+)/g)]
        .filter(Boolean)
        .map(([, num]) => Number(num));

      if (!seedLessons.length) {
        throw new Error(`Seed "${seed}" does not have any lessons`);
      }
      for (const lessonNumber of seedLessons) {
        if (lessonNumber <= 0) {
          throw new Error(
            `Seed "${seed}" should not have a lesson number less than 1`
          );
        }
        if (lessonNumber > config.numberOfLessons) {
          throw new Error(
            `Seed "${seed}" has a lesson number greater than the number of lessons`
          );
        }
      }
      if (seedLessons !== seedLessons.sort()) {
        logover.warn(
          `Seed "${seed}" has lesson numbers that are not in order: ${seedLessons}`
        );
      }
    }

    let expectedLessonNumber = 1;
    for (const lessonNumber of projectLessons) {
      if (lessonNumber !== expectedLessonNumber) {
        throw new Error(
          `Project "${project}" has a lesson number mismatch. Expected "${expectedLessonNumber}" but got "${lessonNumber}"`
        );
      }
      const lesson = await getLessonFromFile(projectPath, Number(lessonNumber));
      const description = getLessonDescription(lesson);
      if (!description?.trim()) {
        logover.warn(
          `Project "${project}" has no description for lesson "${lessonNumber}"`
        );
      }

      const seedContents = getLessonSeed(lesson);
      if (seed) {
        const seedPath = join(CURRICULUM_PATH, seed);
        const seedFile = await readFile(seedPath, 'utf8');
        const seedLessons = [...seedFile.matchAll(/\n## (\d+)/g)]
          .filter(Boolean)
          .map(([, num]) => Number(num));
        if (seedContents !== null && seedLessons?.includes(lessonNumber)) {
          logover.warn(
            `Seed "${seed}" already exists in project markdown for lesson "${lessonNumber}"`
          );
        }
      }

      const hintsAndTests = getLessonHintsAndTests(lesson);
      if (!hintsAndTests.length) {
        logover.warn(
          `Project "${project}" has no tests for lesson "${lessonNumber}"`
        );
      }
      for (const [hint, test] of hintsAndTests) {
        if (!hint || !hint.trim()) {
          logover.warn(
            `Project "${project}" has no test text for lesson "${lessonNumber}"`
          );
        }
        if (!test || !test.trim()) {
          logover.warn(
            `Project "${project}" has no test code for lesson "${lessonNumber}"`
          );
        }
      }

      expectedLessonNumber++;
    }

    const projectTitle = await getProjectTitle(projectPath);
    if (!projectTitle.projectTopic || !projectTitle.currentProject) {
      throw new Error(
        `Project "${project}" has a malformed title: '${projectTitle}'`
      );
    }
  }

  logover.info('All curriculum files are valid');
}
