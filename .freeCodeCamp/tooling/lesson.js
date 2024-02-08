// This file parses answer files for lesson content
import { join } from 'path';
import {
  updateDescription,
  updateProjectHeading,
  updateTests,
  updateProject,
  updateError,
  resetBottomPanel
} from './client-socks.js';
import { ROOT, getState, getProjectConfig, freeCodeCampConfig } from './env.js';
import { logover } from './logger.js';
import { seedLesson } from './seed.js';
import { pluginEvents } from '../plugin/index.js';

/**
 * Runs the lesson from the `projectDashedName` config.
 * @param {WebSocket} ws WebSocket connection to the client
 * @param {string} projectDashedName
 */
export async function runLesson(ws, projectDashedName) {
  const project = await getProjectConfig(projectDashedName);
  const { isIntegrated, dashedName, seedEveryLesson, currentLesson } = project;
  const { lastSeed } = await getState();
  try {
    const { description, seed, isForce, tests } = await pluginEvents.getLesson(
      projectDashedName,
      currentLesson
    );

    if (currentLesson === 0) {
      await pluginEvents.onProjectStart(project);
    }

    updateProject(ws, project);

    if (!isIntegrated) {
      updateTests(
        ws,
        tests.reduce((acc, curr, i) => {
          return [
            ...acc,
            { passed: false, testText: curr[0], testId: i, isLoading: false }
          ];
        }, [])
      );
    }
    resetBottomPanel(ws);

    const { title } = await pluginEvents.getProjectMeta(projectDashedName);
    updateProjectHeading(ws, {
      title,
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
      if (seed) {
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
