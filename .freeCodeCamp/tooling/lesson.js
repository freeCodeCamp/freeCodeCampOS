import {
  updateDescription,
  updateProjectHeading,
  updateTests,
  updateProject,
  updateError,
  resetBottomPanel
} from './client-socks.js';
import { getState, getProjectConfig } from './env.js';
import { logover } from './logger.js';
import { seedLesson } from './seed.js';
import { pluginEvents } from '../plugin/index.js';
import { watchPath, unwatchPath, resetPathLists } from './watcher/watcher.js';

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
    const { description, seed, isForce, tests, meta } =
      await pluginEvents.getLesson(projectDashedName, currentLesson);

    // TODO: Consider performance optimizations
    // - Do not run at all if whole project does not contain any `meta`.
    await handleWatcher(meta);

    if (currentLesson === 0) {
      await pluginEvents.onProjectStart(project);
    }
    await pluginEvents.onLessonLoad(project);

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

async function handleWatcher(meta) {
  if (meta?.watch) {
    for (const path of meta.watch) {
      watchPath(path);
    }
  } else if (meta?.ignore) {
    for (const path of meta.ignore) {
      unwatchPath(path);
    }
  } else {
    // Reset watcher back to default/freecodecamp.conf.json
    resetPathLists();
  }
}
