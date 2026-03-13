/**
 * @file Extract seed from curriculum file to separate -seed.md file. Extracted seeds are removed from original file.
 * @example
 *
 * ```bash
 * node tooling/extract-seed.js curriculum/locales/english/learn-x-by-building-y.md
 * ```
 */

import { copyFile, readFile, rm, writeFile } from 'fs/promises';
import { constants } from 'fs';

const END_MARKER = '## --fcc-end--';
const SEED_HEADER = '### --seed--';

const path = process.argv[2];
const noBackup = process.argv[3] === '--nobackup';

if (!path) {
  console.info(
    'Usage: node tooling/extract-seed.js path/to/curriculum/locales/english/learn-x.md [--nobackup]'
  );
  process.exit(0);
}

async function main(filePath, noBackup = false) {
  const source = await readFile(filePath, 'utf-8');

  // Split into lesson blocks by "## <N>" headings
  const lessonPattern = /^## (\d+|--fcc-end--)/m;
  const blocks = source.split(/(?=^## (?:\d+|--fcc-end--))/m);

  const header = blocks[0]; // title + description before first lesson
  const seedBlocks = [header.trimEnd()];
  const projectBlocks = [header.trimEnd()];

  for (const block of blocks.slice(1)) {
    const lessonMatch = block.match(/^## (\d+)/m);
    if (!lessonMatch) {
      // end marker or unrecognized — pass through
      projectBlocks.push(block.trimEnd());
      continue;
    }
    const lessonNumber = lessonMatch[1];

    const seedStart = block.indexOf(`\n${SEED_HEADER}`);
    if (seedStart === -1) {
      projectBlocks.push(block.trimEnd());
      continue;
    }

    // Find where the seed section ends (next ### heading or end of block)
    const afterSeedHeader = block.indexOf('\n', seedStart + 1);
    const nextH3 = block.indexOf('\n### --', afterSeedHeader + 1);
    const seedContent =
      nextH3 === -1
        ? block.slice(seedStart)
        : block.slice(seedStart, nextH3);

    seedBlocks.push(`\n## ${lessonNumber}\n${SEED_HEADER}${seedContent.slice(SEED_HEADER.length + 1).trimEnd()}`);

    // Remove seed section from project block
    const blockWithoutSeed = block.slice(0, seedStart) + (nextH3 === -1 ? '' : block.slice(nextH3));
    projectBlocks.push(blockWithoutSeed.trimEnd());
  }

  seedBlocks.push(`\n${END_MARKER}\n`);

  const seedFile = filePath.replace('.md', '-seed.md');

  try {
    await rm(seedFile);
  } catch (err) {
    if (err?.code !== 'ENOENT') throw err;
  }

  if (!noBackup) {
    const backupFile = filePath.replace('.md', '.original');
    try {
      await copyFile(filePath, backupFile, constants.COPYFILE_EXCL);
    } catch (err) {
      console.error(err);
      throw new Error(`Backup file already created at ${backupFile}`);
    }
  }

  await writeFile(seedFile, seedBlocks.join('\n') + '\n');
  await writeFile(filePath, projectBlocks.join('\n') + '\n');

  console.info(`Seed extracted to ${seedFile}`);
}

main(path, noBackup).catch(err => console.error(err));
