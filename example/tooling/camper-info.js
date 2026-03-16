/**
 * @file Provides command-line output of useful debugging information
 * @example
 *
 * ```bash
 * node tooling/camper-info.js --history --directory
 * ```
 */

import { exec } from 'child_process';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { promisify } from 'util';

const execute = promisify(exec);
const ROOT = process.cwd();
const FLAGS = process.argv;

async function readJson(filePath) {
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

async function main() {
  try {
    const conf = await readJson(join(ROOT, 'freecodecamp.conf.json'));
    const state = await readJson(join(ROOT, conf.config['state.json']));
    const projects = await readJson(join(ROOT, conf.config['projects.json']));

    const { currentProject, currentLessons } = state;
    const currentLesson = currentProject ? currentLessons[currentProject] : null;
    const project = projects.find(p => p.id === currentProject);

    const { stdout: gitLog } = await execute('git log -1', { cwd: ROOT });

    console.info('Project:        ', project?.title ?? currentProject ?? '(none)');
    console.info('Lesson Number:  ', currentLesson ?? '(none)');
    console.info('Version:        ', conf.version);
    console.info('Commit:         ', gitLog.trim());

    const handleFlag = {
      '--history': printCommandHistory,
      '--directory': printDirectoryTree
    };

    for (const arg of FLAGS) {
      await handleFlag[arg]?.();
    }

    async function printDirectoryTree() {
      const files = await readdir(ROOT, { withFileTypes: true });
      for (const file of files) {
        if (file.isDirectory() && file.name === project?.dashed_name) {
          await recurseDirectory(file.name, 0);
        }
      }
    }

    async function printCommandHistory() {
      const historyCwd = await readFile(
        join(ROOT, '.logs/.bash_history.log'),
        'utf-8'
      );
      console.info('Command History:\n', historyCwd);
    }
  } catch (e) {
    console.error(e);
  }
}

main();

const IGNORE = ['node_modules', 'target'];

async function recurseDirectory(path, depth) {
  console.info(`|${' '.repeat(depth * 2)}|-- ${path}`);
  const files = await readdir(path, { withFileTypes: true });
  for (const file of files) {
    if (!IGNORE.includes(file.name)) {
      if (file.isDirectory()) {
        await recurseDirectory(join(path, file.name), depth + 1);
      } else {
        console.info(`|${' '.repeat((depth + 1) * 2)}|-- ${file.name}`);
      }
    }
  }
}
