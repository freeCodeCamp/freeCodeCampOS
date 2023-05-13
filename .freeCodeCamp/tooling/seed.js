// This file handles seeding the lesson contents with the seed in markdown.
import { join } from 'path';
import {
  getLessonFromFile,
  getLessonSeed,
  seedToIterator
} from './parser.js';
import { ROOT, getState, freeCodeCampConfig } from './env.js';
import { writeFile } from 'fs/promises';
import { promisify } from 'util';
import { exec } from 'child_process';
import { logover } from './logger.js';
import { updateError } from './client-socks.js';
const execute = promisify(exec);

export async function seedLesson(ws, project) {
  // TODO: Use ws to display loader whilst seeding
  const { currentLesson: lessonNumber, dashedName: projectPath } = project;
  const { locale } = await getState();
  const projectFile = join(
    ROOT,
    freeCodeCampConfig.curriculum.locales[locale],
    projectPath + '.md'
  );

  try {
    const lesson = await getLessonFromFile(projectFile, lessonNumber);
    const seed = getLessonSeed(lesson);

    await runLessonSeed(seed, projectPath, lessonNumber);
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
 * Runs the given array of files with seed
 */
export async function runSeed(fileSeed, filePath, projectPath) {
  const path = join(ROOT, projectPath, filePath);
  await writeFile(path, fileSeed);
}

export async function runLessonSeed(seed, projectPath, lessonNumber) {
  const seedGenerator = seedToIterator(seed);
  try {
    for (const cmdOrFile of seedGenerator) {
      if (typeof cmdOrFile === 'string') {
        const { stdout, stderr } = await runCommand(cmdOrFile, projectPath);
        if (stdout || stderr) {
          logover.debug(stdout, stderr);
        }
      } else {
        const { filePath, fileSeed } = cmdOrFile;
        await runSeed(fileSeed, filePath, projectPath);
      }
    }
  } catch (e) {
    logover.error('Failed to run seed for lesson: ', lessonNumber);
    throw new Error(e);
  }
}
