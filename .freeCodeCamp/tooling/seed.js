// This file handles seeding the lesson contents with the seed in markdown.
import { join } from 'path';
import { getLessonFromFile, getLessonSeed, seedToIterator } from './parser.js';
import {
  ROOT,
  getState,
  freeCodeCampConfig,
  getProjectConfig,
  setState
} from './env.js';
import { writeFile } from 'fs/promises';
import { promisify } from 'util';
import { exec } from 'child_process';
import { logover } from './logger.js';
import { updateError } from './client-socks.js';
import { watcher } from './hot-reload.js';
const execute = promisify(exec);

/**
 * Seeds the current lesson
 * @param {WebSocket} ws
 * @param {string} projectDashedName
 */
export async function seedLesson(ws, projectDashedName) {
  // TODO: Use ws to display loader whilst seeding
  const project = await getProjectConfig(projectDashedName);
  const { currentLesson, dashedName } = project;
  const { locale } = await getState();
  const projectFile = join(
    ROOT,
    freeCodeCampConfig.curriculum.locales[locale],
    dashedName + '.md'
  );

  try {
    const lesson = await getLessonFromFile(projectFile, currentLesson);
    const seed = getLessonSeed(lesson);

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
  const seedGenerator = seedToIterator(seed);
  try {
    for (const cmdOrFile of seedGenerator) {
      if (typeof cmdOrFile === 'string') {
        const { stdout, stderr } = await runCommand(cmdOrFile);
        if (stdout || stderr) {
          logover.debug(stdout, stderr);
        }
      } else {
        const { filePath, fileSeed } = cmdOrFile;
        // Stop watching file being seeded to prevent triggering tests on hot reload
        watcher.unwatch(filePath);
        await runSeed(fileSeed, filePath);
        watcher.add(filePath);
      }
    }
  } catch (e) {
    logover.error('Failed to run seed for lesson: ', currentLesson);
    throw new Error(e);
  }
}
