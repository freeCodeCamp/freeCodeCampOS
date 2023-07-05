/**
 * @file Extract seed from curriculum file to separate -seed.md file. Extracted seeds are removed from original file.
 * @example
 *
 * ```bash
 * node tooling/extract-seed.js curriculum/locales/english/learn-x-by-building-y.md
 * ```
 */

import { copyFile, readFile, rm, writeFile } from 'fs/promises';
import { Logger } from 'logover';
import { freeCodeCampConfig } from '@freecodecamp/freecodecamp-os/.freeCodeCamp/tooling/env.js';
import {
  getLessonFromFile,
  getLessonSeed,
  getProjectTitle
} from '@freecodecamp/freecodecamp-os/.freeCodeCamp/tooling/parser.js';
import { constants } from 'fs';

const CONFIG_PATH = freeCodeCampConfig.config['projects.json'];

const END_MARKER = '## --fcc-end--';
const SEED_MARKER = '### --seed--';

const path = process.argv[2];
const noBackup = process.argv[3] === '--nobackup';

const logover = new Logger({ level: 'debug' });

async function main(filePath, noBackup = false) {
  const { projectTopic, currentProject } = await getProjectTitle(filePath);
  const projectsConfig = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));
  const projectConfig = projectsConfig.find(
    ({ title }) => title === currentProject
  );
  if (!projectConfig) {
    throw new Error(
      `No project in ${CONFIG_PATH} associated with "${filePath}".`
    );
  }
  const seedFile = filePath.replace('.md', '-seed.md');
  try {
    // If file with seed already exists, seed from it will be mangled
    // with seed included in project file.
    await rm(seedFile);
  } catch (err) {
    if (err?.code !== 'ENOENT') {
      throw new Error(err);
    }
  }

  const header = `# ${projectTopic} - ${currentProject}\n`;
  const seedContents = [header];
  const projectWithoutSeed = [header];

  let lessonNumber = 1;
  try {
    while (lessonNumber <= projectConfig.numberOfLessons) {
      let lesson = await getLessonFromFile(filePath, lessonNumber);
      const seed = getLessonSeed(lesson);
      if (seed) {
        seedContents.push(`## ${lessonNumber}\n\n${SEED_MARKER}`);
        seedContents.push(`${seed.trimEnd('\n')}\n`);
      }
      const lessonWithoutSeed = lesson.replace(
        new RegExp(`${SEED_MARKER}\n*${seed}`),
        ''
      );
      projectWithoutSeed.push(`## ${lessonNumber}\n`);
      projectWithoutSeed.push(`${lessonWithoutSeed.trimEnd('\n')}\n`);
      lessonNumber++;
    }
  } catch (err) {
    logover.error(err);
  }
  seedContents.push(`${END_MARKER}\n`);
  projectWithoutSeed.push(`${END_MARKER}\n`);

  if (!noBackup) {
    const backupFile = filePath.replace('.md', '.original');
    try {
      await copyFile(filePath, backupFile, constants.COPYFILE_EXCL);
    } catch (err) {
      logover.error(err);
      throw new Error(`Backup file already created at ${backupFile}`);
    }
  }

  try {
    await writeFile(seedFile, seedContents.join('\n'));
  } catch (err) {
    logover.error(err);
  }

  try {
    await writeFile(filePath, projectWithoutSeed.join('\n'));
  } catch (err) {
    logover.error(err);
  }
}

if (path) {
  try {
    main(path, noBackup);
  } catch (err) {
    logover.debug(err);
  }
} else {
  logover.info(
    `Usage: node tooling/extract-seed.js path/to/curriculum/markdown/file/learn.md [--nobackup]`
  );
}
