// This file parses answer files for lesson content
import { join } from "path";
import {
  updateTestsState,
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
import { LessonMeta, State, TestState } from "../../types";

/**
 * Runs the lesson from the `projectDashedName` config.
 */
export async function runLesson(ws: WebSocket, projectId: number) {
  const project = await pluginEvents.getProject(projectId);
  const { isIntegrated, seedEveryLesson } = project;
  const { lastSeed, lastWatchChange, projects } = await getState();
  try {
    const currentLesson = projects[project.id].currentLesson;
    const { seed, tests, meta } = await pluginEvents.getLesson(
      projectId,
      currentLesson
    );

    // TODO: Consider performance optimizations
    // - Do not run at all if whole project does not contain any `meta`.
    if (meta) {
      await handleWatcher(meta, { lastWatchChange, currentLesson });
    }

    if (currentLesson === 0) {
      await pluginEvents.onProjectStart(project);
    }
    await pluginEvents.onLessonLoad(project);

    if (!isIntegrated) {
      updateTestsState(
        ws,
        tests.reduce((acc, curr, i) => {
          return [
            ...acc,
            { passed: false, testText: curr[0], testId: i, isLoading: false },
          ];
        }, [] as TestState[])
      );
    }
    resetBottomPanel(ws);

    // If the current lesson has not already been seeded, seed it
    // Otherwise, Campers can click the "Reset Project" button to re-seed a lesson
    if (
      lastSeed?.projectId !== projectId ||
      (lastSeed?.projectId === projectId &&
        lastSeed?.lessonNumber !== currentLesson)
    ) {
      if (seed) {
        // force flag overrides seed flag
        if (
          (seedEveryLesson && !meta?.force) ||
          (!seedEveryLesson && meta?.force)
        ) {
          await seedLesson(ws, projectId);
        }
      }
    }
  } catch (err) {
    updateError(ws, err);
    logover.error(err);
  }
}

async function handleWatcher(
  meta: LessonMeta,
  {
    lastWatchChange,
    currentLesson,
  }: { lastWatchChange: State["lastWatchChange"]; currentLesson: number }
) {
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
