import { join } from 'path';
import { readdir, access, constants, readFile } from 'fs/promises';
import { freeCodeCampConfig, ROOT } from './env.js';
import { logover } from './logger.js';
import {
  getLessonDescription,
  getLessonFromFile,
  getLessonHintsAndTests,
  getProjectTitle
} from './parser.js';

const CURRICULUM_PATH = freeCodeCampConfig.curriculum.locales.english;
const SEED_PATH = freeCodeCampConfig.curriculum.seeds.english;
const CONFIG_PATH = freeCodeCampConfig.config['projects.json'];

/**
 * # Validate Curriculum
 *
 * ## Required
 * 1. Each .md has an H1 heading
 * 2. Each .md is associated with a root directory
 * 3. Each .md has congruent lesson numbers
 * 4. Each .md ends in `--fcc-end--`
 * 5. Each .md is assiciated in the `config/projects.json` file
 *
 * ## Warnings
 * 1. Each .md has a description heading
 * 2. Each .md has a tests heading
 * 3. Each description is not empty
 * 4. Each tests is not empty
 */
export async function validateCurriculum() {
  const curriculumFiles = await readdir(CURRICULUM_PATH);
  const projects = curriculumFiles.filter(file => file.endsWith('.md') && !file.endsWith('-seed.md'));
  const projectsConfig = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));

  for (const project of projects) {
    const projectDirPath = project.replace('.md', '');
    try {
      await access(projectDirPath, constants.F_OK);
    } catch (e) {
      throw new Error(
        `Project "${project}" does not have an associated root directory`
      );
    }

    const mdPath = join(ROOT, CURRICULUM_PATH, project);
    try {
      const projectTitle = await getProjectTitle(mdPath);
      if (!projectTitle.projectTopic || !projectTitle.currentProject) {
        throw new Error(
          `Project "${project}" has a malformed title: '${projectTitle}'`
        );
      }
    } catch (e) {
      throw new Error(
        `Project "${project}" has a malformed title: '${e.message}'`
      );
    }

    const mdFile = await readFile(mdPath, 'utf8');
    if (!mdFile.trimEnd().endsWith('--fcc-end--')) {
      throw new Error(`Project "${project}" does not end with --fcc-end--`);
    }

    const lessonNumbers = [...mdFile.matchAll(/\n## (\d+)/g)]
      .filter(Boolean)
      .map(([, num]) => Number(num));
    if (!lessonNumbers.length) {
      throw new Error(`Project "${project}" does not have any lessons`);
    }

    let expectedLessonNumber = 1;

    for (const lessonNumber of lessonNumbers) {
      if (lessonNumber !== expectedLessonNumber) {
        throw new Error(
          `Project "${project}" has a lesson number mismatch. Expected "${expectedLessonNumber}" but got "${lessonNumber}"`
        );
      }
      expectedLessonNumber++;
      const lesson = await getLessonFromFile(mdPath, Number(lessonNumber));
      const description = getLessonDescription(lesson);
      const hintsAndTests = getLessonHintsAndTests(lesson);
      if (!description || !description.trim()) {
        logover.warn(
          `Project "${project}" has no description for lesson "${lessonNumber}"`
        );
      }
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
    }

    const projectConfig = projectsConfig.find(
      ({ dashedName }) => dashedName === projectDirPath
    );
    if (!projectConfig) {
      throw new Error(
        `Project "${project}" is not associated in the ${CONFIG_PATH} file. No matching dashed name for "${projectDirPath}"`
      );
    }
  }

  const seedFiles = await readdir(SEED_PATH);
  const seeds = seedFiles.filter(file => file.endsWith('-seed.md'));

  for (const seed of seeds) {
    const project = seed.replace('-seed.md', '.md');
    const projectDirPath = project.replace('.md', '');
    try {
      await access(projectDirPath, constants.F_OK);
    } catch (e) {
      throw new Error(
        `Seed "${seed}" does not have an associated root directory`
      );
    }

    const mdPath = join(ROOT, SEED_PATH, seed);
    try {
      const projectTitle = await getProjectTitle(mdPath);
      if (!projectTitle.projectTopic || !projectTitle.currentProject) {
        throw new Error(
          `Seed "${seed}" has a malformed title: '${projectTitle}'`
        );
      }
    } catch (e) {
      throw new Error(
        `Seed "${seed}" has a malformed title: '${e.message}'`
      );
    }

    const mdFile = await readFile(mdPath, 'utf8');
    if (!mdFile.trimEnd().endsWith('--fcc-end--')) {
      throw new Error(`Seed "${seed}" does not end with --fcc-end--`);
    }

    const lessonNumbers = [...mdFile.matchAll(/\n## (\d+)/g)]
      .filter(Boolean)
      .map(([, num]) => Number(num));
    if (!lessonNumbers.length) {
      throw new Error(`Seed "${seed}" does not have any lessons`);
    }

    let minimumLessonNumber = 1;

    const projectMdPath = join(ROOT, CURRICULUM_PATH, project);
    for (const lessonNumber of lessonNumbers) {
      if (lessonNumber < minimumLessonNumber) {
        throw new Error(
          `Seed "${seed}" has a lesson number mismatch. Expected "${minimumLessonNumber}" but got "${lessonNumber}"`
        );
      }
      const lesson = await getLessonFromFile(projectMdPath, Number(lessonNumber));
      const seedContents = getLessonSeed(lesson);
      if (seedContents !== null) {
        try {
          getFilesWithSeed(seedContents);
        } catch (err) {
          logover.debug(err);
          throw new Error(
            `Seed "${seed}" has malformed seed for lesson ${lessonNumber}`
          )
        }
      }

      minimumLessonNumber = lessonNumber + 1;
    }

    const projectConfig = projectsConfig.find(({ dashedName }) => dashedName === projectDirPath);
    if (!projectConfig) {
      throw new Error(
        `Seed ${seed} is not associated with project in the ${CONFIG_PATH} file. No matching dashed name for "${projectDirPath}"`
      );
    }

  }
  logover.info('All curriculum files are valid');
}
