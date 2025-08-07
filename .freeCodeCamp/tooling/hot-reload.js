import { getState, getProjectConfig, ROOT } from './env.js';
import { runLesson } from './lesson.js';
import { runTests } from './tests/main.js';
// `watch` from `node:fs` was investigated, but it fired too many events multiple times
// as of node^21
import { watch } from 'chokidar';
import { logover } from './logger.js';

import { shouldWatch } from './watcher/watcher.js';
import { join } from 'path';

export const watcher = watch(ROOT, {
  ignoreInitial: true,
  ignored: join(ROOT, 'node_modules/@freecodecamp/freecodecamp-os')
});

export function hotReload(ws) {
  logover.info(`Watching for file changes on ${ROOT}`);
  let isWait = false;
  let testsRunning = false;
  let isClearConsole = false;

  // hotReload is called on connection, which can happen mulitple times due to client reload/disconnect.
  // This ensures the following does not happen:
  // > MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 all listeners added to [FSWatcher].
  watcher.removeAllListeners('all');

  watcher.on('all', async (event, name) => {
    // If path in `PATHS_TO_WATCH`, then watch - ignore `PATHS_TO_IGNORE`
    // Else if path in `PATHS_TO_IGNORE`, then ignore
    // Else, watch
    if (name && shouldWatch(name)) {
      if (isWait) return;
      const { currentProject } = await getState();
      if (!currentProject) {
        return;
      }

      const { testPollingRate, runTestsOnWatch } = await getProjectConfig(
        currentProject
      );
      isWait = setTimeout(() => {
        isWait = false;
      }, testPollingRate);

      if (isClearConsole) {
        console.clear();
      }

      await runLesson(ws, currentProject);
      if (runTestsOnWatch && !testsRunning) {
        logover.debug(`Watcher: ${event} - ${name}`);
        testsRunning = true;
        await runTests(ws, currentProject);
        testsRunning = false;
      }
    }
  });
}
