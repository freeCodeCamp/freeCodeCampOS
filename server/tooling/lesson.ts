// This file parses answer files for lesson content
import { join } from "path";
import {
  updateDescription,
  updateProjectHeading,
  updateTests,
  updateProject,
  updateError,
  resetBottomPanel,
} from "./client-socks";
import { ROOT, getState, getProjectConfig, setState } from "./env";
import { logover } from "./logger";
import { seedLesson } from "./seed";
import { pluginEvents } from "../plugin/index";
import {
  unwatchAll,
  watchAll,
  watchPathRelativeToRoot,
  watcher,
} from "./hot-reload";

/**
 * Runs the lesson from the `projectDashedName` config.
 * @param {WebSocket} ws WebSocket connection to the client
 * @param {string} projectDashedName
 */
export async function runLesson(ws, projectDashedName) {
  const project = await getProjectConfig(projectDashedName);
  const { isIntegrated, dashedName, seedEveryLesson, currentLesson } = project;
  const { lastSeed, lastWatchChange } = await getState();
  try {
    const { description, seed, isForce, tests, meta } =
      await pluginEvents.getLesson(projectDashedName, currentLesson);

    // TODO: Consider performance optimizations
    // - Do not run at all if whole project does not contain any `meta`.
    await handleWatcher(meta, { lastWatchChange, currentLesson });

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
            { passed: false, testText: curr[0], testId: i, isLoading: false },
          ];
        }, [])
      );
    }
    resetBottomPanel(ws);

    const { title } = await getProjectConfig(projectDashedName);
    updateProjectHeading(ws, {
      title,
      lessonNumber: currentLesson,
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

async function handleWatcher(meta, { lastWatchChange, currentLesson }) {
  // Calling `watcher` methods takes a performance hit. So, check is behind a check that the lesson has changed.
  if (lastWatchChange !== currentLesson) {
    if (meta?.watch) {
      unwatchAll();
      for (const path of meta.watch) {
        const toWatch = join(ROOT, path);
        watchPathRelativeToRoot(toWatch);
      }
    } else if (meta?.ignore) {
      await watchAll();
      watcher.unwatch(meta.ignore);
    } else {
      // Reset watcher back to default/freecodecamp.conf.json
      await watchAll();
    }
  }
  await setState({ lastWatchChange: currentLesson });
}
