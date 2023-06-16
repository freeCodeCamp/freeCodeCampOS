// This file parses answer files for lesson content
import { join } from 'path';
import {
  getLessonFromFile,
  getLessonDescription,
  getLessonHintsAndTests,
  getProjectTitle,
  getLessonSeed,
  isForceFlag
} from './parser.js';
import {
  updateDescription,
  updateProjectHeading,
  updateTests,
  updateProject,
  updateError
} from './client-socks.js';
import { ROOT, getState, getProjectConfig, freeCodeCampConfig } from './env.js';
import { logover } from './logger.js';
import { seedLesson } from './seed.js';

/**
 * Runs the lesson from the `projectDashedName` config.
 * @param {WebSocket} ws WebSocket connection to the client
 * @param {string} projectDashedName
 */
export async function runLesson(ws, projectDashedName) {
  const project = await getProjectConfig(projectDashedName);
  const { isIntegrated, dashedName, seedEveryLesson, currentLesson } = project;
  const { locale, lastSeed } = await getState();
  const projectFile = join(
    ROOT,
    freeCodeCampConfig.curriculum.locales[locale],
    dashedName + '.md'
  );
  try {
    const lesson = await getLessonFromFile(projectFile, currentLesson);

    const description = getLessonDescription(lesson);

    updateProject(ws, project);

    if (!isIntegrated) {
      const hintsAndTestsArr = getLessonHintsAndTests(lesson);
      updateTests(
        ws,
        hintsAndTestsArr.reduce((acc, curr, i) => {
          return [
            ...acc,
            { passed: false, testText: curr[0], testId: i, isLoading: false }
          ];
        }, [])
      );
    }

    const { projectTopic, currentProject } = await getProjectTitle(projectFile);
    updateProjectHeading(ws, {
      projectTopic,
      currentProject,
      lessonNumber: currentLesson
    });
    updateDescription(ws, description);

    // If the current lesson has not already been seeded, seed it
    // Otherwise, Campers can click the "Reset Project" button to re-seed a lesson
    if (
      lastSeed?.projectDashedName !== dashedName ||
      (lastSeed?.projectDashedName === dashedName &&
        lastSeed?.lessonNumber !== currentLesson)
    ) {
      const seed = getLessonSeed(lesson);
      if (seed) {
        const isForce = isForceFlag(seed);
        // force flag overrides seed flag
        if ((seedEveryLesson && !isForce) || (!seedEveryLesson && isForce)) {
          await seedLesson(ws, dashedName);
        }
      }
    }
  } catch (err) {
    updateError(ws, err);
    logover.error(err);
  }
}
