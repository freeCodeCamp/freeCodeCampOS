/**
 * @file Provides command-line output of useful debugging information
 * @example
 *
 * ```bash
 * node tooling/camper-info.js --history --directory
 * ```
 */

import {
  getProjectConfig,
  getConfig,
  getState
} from '../.freeCodeCamp/tooling/env.js';
import __helpers from '../.freeCodeCamp/tooling/test-utils.js';
import { Logger } from 'logover';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const logover = new Logger({ level: 'debug', timestamp: null });

const FLAGS = process.argv;

const handleFlag = {
  '--history': printCommandHistory,
  '--directory': printDirectoryTree
};

async function main() {
  try {
    const projectConfig = await getProjectConfig();
    const config = await getConfig();
    const state = await getState();

    const { currentProject } = state;
    const { currentLesson } = projectConfig;
    const { version } = config;

    const devContainerFile = await readFile(
      '.devcontainer/devcontainer.json',
      'utf-8'
    );
    const devConfig = JSON.parse(devContainerFile);
    const coursesVersion = devConfig.extensions?.find(e =>
      e.match('freecodecamp-courses')
    );

    const { stdout } = await __helpers.getCommandOutput('git log -1');

    logover.info('Project: ', currentProject);
    logover.info('Lesson Number: ', currentLesson);
    logover.info('Curriculum Version: ', version);
    logover.info('freeCodeCamp - Courses: ', coursesVersion);
    logover.info('Commit: ', stdout);

    for (const arg of FLAGS) {
      await handleFlag[arg]?.();
    }
  } catch (e) {
    logover.error(e);
  }
}

main();

const IGNORE = ['node_modules', 'target'];
async function recurseDirectory(path, depth) {
  logover.info(`|${' '.repeat(depth * 2)}|-- ${path}`);
  depth++;
  const files = await readdir(path, { withFileTypes: true });
  for (const file of files) {
    if (!IGNORE.includes(file.name)) {
      if (file.isDirectory()) {
        await recurseDirectory(join(path, file.name), depth);
      } else {
        logover.info(`|${' '.repeat(depth * 2)}|-- ${file.name}`);
      }
    }
  }
}

async function printDirectoryTree() {
  const files = await readdir('.', { withFileTypes: true });
  let depth = 0;
  for (const file of files) {
    if (file.isDirectory() && file.name === '.freeCodeCamp') {
      await recurseDirectory(file.name, depth);
    }
  }
}

async function printCommandHistory() {
  const historyCwd = await readFile('.logs/.history_cwd.log', 'utf-8');
  logover.info('Command History:\n', historyCwd);
}
