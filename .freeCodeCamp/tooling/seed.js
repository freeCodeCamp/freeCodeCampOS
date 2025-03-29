// This file handles seeding the lesson contents with the seed in markdown.
import { join } from 'path';
import { ROOT, getProjectConfig, setState } from './env.js';
import { writeFile } from 'fs/promises';
import { promisify } from 'util';
import { exec } from 'child_process';
import { logover } from './logger.js';
import { updateLoader, updateError } from './client-socks.js';
import { pluginEvents } from '../plugin/index.js';
import { resetPathLists, unwatchPath } from './watcher/watcher.js';
const execute = promisify(exec);

/**
 * Seeds the current lesson
 * @param {WebSocket} ws
 * @param {string} projectDashedName
 */
export async function seedLesson(ws, projectDashedName) {
  updateLoader(ws, {
    isLoading: true,
    progress: { total: 2, count: 1 }
  });
  const project = await getProjectConfig(projectDashedName);
  const { currentLesson } = project;

  try {
    const { seed } = await pluginEvents.getLesson(
      projectDashedName,
      currentLesson
    );

    await runLessonSeed(seed, currentLesson);
    await setState({
      lastSeed: {
        projectDashedName,
        lessonNumber: currentLesson
      }
    });
  } catch (e) {
    updateError(ws, e);
    logover.error(e);
  }
  updateLoader(ws, { isLoading: false, progress: { total: 1, count: 1 } });
}

/**
 * Runs the given array of commands in order
 * @param {string[]} commands - Array of commands to run
 */
export async function runCommands(commands) {
  // Execute the following commands in the shell
  for (const command of commands) {
    const { stdout, stderr } = await execute(command);
    if (stdout) {
      logover.debug(stdout);
    }
    if (stderr) {
      logover.error(stderr);
      return Promise.reject(stderr);
    }
  }
  return Promise.resolve();
}

/**
 * Runs the given command
 * @param {string} command - Commands to run
 */
export async function runCommand(command, path = '.') {
  const cmdOut = await execute(command, {
    cwd: join(ROOT, path),
    shell: '/bin/bash'
  });
  return cmdOut;
}

/**
 * Seeds the given path relative to root with the given seed
 */
export async function runSeed(fileSeed, filePath) {
  const path = join(ROOT, filePath);
  await writeFile(path, fileSeed);
}

/**
 * Runs the given seed for the given project and lesson number
 * @param {string} seed
 * @param {number} currentLesson
 */
export async function runLessonSeed(seed, currentLesson) {
  try {
    for (const cmdOrFile of seed) {
      if (typeof cmdOrFile === 'string') {
        const { stdout, stderr } = await runCommand(cmdOrFile);
        if (stdout || stderr) {
          logover.debug(stdout, stderr);
        }
      } else {
        const { filePath, fileSeed } = cmdOrFile;
        // Stop watching file being seeded to prevent triggering tests on hot reload
        unwatchPath(filePath);
        await runSeed(fileSeed, filePath);
        resetPathLists();
      }
    }
  } catch (e) {
    logover.error('Failed to run seed for lesson: ', currentLesson);
    throw new Error(e);
  }
}
