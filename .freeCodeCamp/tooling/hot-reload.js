// This file handles the watching of the /curriculum folder for changes
// and executing the command to run the tests for the next (current) lesson
import { getState, getProjectConfig, ROOT, freeCodeCampConfig } from './env.js';
import { runLesson } from './lesson.js';
import { runTests } from './tests/main.js';
import { watch } from 'chokidar';
import { logover } from './logger.js';
import path from 'path';
import { readdir } from 'fs/promises';

const defaultPathsToIgnore = [
  '.logs/.temp.log',
  'config/',
  '/node_modules/',
  '.git/',
  '/target/',
  '/test-ledger/'
];

export const pathsToIgnore =
  freeCodeCampConfig.hotReload?.ignore || defaultPathsToIgnore;

export const watcher = watch(ROOT, {
  ignoreInitial: true,
  ignored: path => pathsToIgnore.some(p => path.includes(p))
});

export function hotReload(ws, pathsToIgnore = defaultPathsToIgnore) {
  logover.info(`Watching for file changes on ${ROOT}`);
  let isWait = false;
  let testsRunning = false;
  let isClearConsole = false;

  // hotReload is called on connection, which can happen mulitple times due to client reload/disconnect.
  // This ensures the following does not happen:
  // > MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 all listeners added to [FSWatcher].
  watcher.removeAllListeners('all');

  watcher.on('all', async (event, name) => {
    if (name && !pathsToIgnore.find(p => name.includes(p))) {
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

/**
 * Stops the global `watcher` from watching the entire workspace.
 */
export function unwatchAll() {
  const watched = watcher.getWatched();
  for (const [dir, files] of Object.entries(watched)) {
    for (const file of files) {
      watcher.unwatch(path.join(dir, file));
    }
  }
}

// Need to handle
// From ROOT, must add all directories before file/s
// path.dirname... all the way to ROOT
// path.isAbsolute to find out if what was passed into `meta` is absolute or relative
// path.parse to get the dir and base
// path.relative(ROOT, path) to get the relative path from ROOT
// path.resolve directly on `meta`?
/**
 * **Example:**
 * - Assuming ROOT is `/home/freeCodeCampOS/self`
 * - Takes `lesson-watcher/src/watched.js`
 * - Calls `watcher.add` on each of these in order:
 *   - `/home/freeCodeCampOS/self`
 *   - `/home/freeCodeCampOS/self/lesson-watcher`
 *   - `/home/freeCodeCampOS/self/lesson-watcher/src`
 *   - `/home/freeCodeCampOS/self/lesson-watcher/src/watched.js`
 * @param {string} pathRelativeToRoot
 */
export function watchPathRelativeToRoot(pathRelativeToRoot) {
  const paths = getAllPathsWithRoot(pathRelativeToRoot);
  for (const path of paths) {
    watcher.add(path);
  }
}

function getAllPathsWithRoot(pathRelativeToRoot) {
  const paths = [];
  let currentPath = pathRelativeToRoot;
  while (currentPath !== ROOT) {
    paths.push(currentPath);
    currentPath = path.dirname(currentPath);
  }
  paths.push(ROOT);
  // The order does not _seem_ to matter, but the theory says it should
  return paths.reverse();
}

/**
 * Adds all folders and files to the `watcher` instance.
 *
 * Does nothing with the `pathsToIgnore`, because they are already ignored by the `watcher`.
 */
export async function watchAll() {
  await watchPath(ROOT);
}

async function watchPath(rootPath) {
  const paths = await readdir(rootPath, { withFileTypes: true });
  for (const p of paths) {
    const fullPath = path.join(rootPath, p.name);
    // if (pathsToIgnore.find(i => fullPath.includes(i))) {
    //   console.log('Ignoring: ', fullPath);
    //   continue;
    // }
    watcher.add(fullPath);
    if (p.isDirectory()) {
      await watchPath(fullPath);
    }
  }
}
