// This file contains the parser for the markdown lessons
import { basename, join } from 'path';
import { readFile } from 'fs/promises';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { freeCodeCampConfig, getState, ROOT } from './env.js';
import { logover } from './logger.js';

const DESCRIPTION_MARKER = '### --description--';
const TESTS_MARKER = '### --tests--';
const SEED_MARKER = '### --seed--';
const HINTS_MARKER = `### --hints--`;
const BEFORE_ALL_MARKER = '### --before-all--';
const AFTER_ALL_MARKER = '### --after-all--';
const BEFORE_EACH_MARKER = '### --before-each--';
const NEXT_MARKER_REG = `\n###? --`;
const CMD_MARKER = '#### --cmd--';
const FILE_MARKER_REG = '(?<=#### --")[^"]+(?="--)';

/**
 * Reads the first line of the file to get the project name
 * @param {string} file - The relative path to the locale file
 * @returns {Promise<{projectTopic: string; currentProject: string}>} The project name
 */
export async function getProjectTitle(file) {
  const readable = createReadStream(file);
  const reader = createInterface({ input: readable });
  const firstLine = await new Promise((resolve, reject) => {
    // Timeout after 1 second
    const timeout = setTimeout(() => {
      reader.close();
      readable.close();
      reject(new Error('Timeout'));
    }, 1000);
    reader
      .on('line', line => {
        reader.close();
        clearTimeout(timeout);
        resolve(line);
      })
      .on('error', err => {
        reader.close();
        clearTimeout(timeout);
        reject(err);
      });
  });
  readable.close();
  const proj = firstLine.replace('# ', '');
  if (!proj) {
    throw new Error('Invalid project title. See example format.');
  }
  return proj;
}

/**
 * Gets all content within a lesson
 * @param {string} file - The relative path to the english locale file
 * @param {number} lessonNumber - The number of the lesson
 * @returns {Promise<string | undefined>} The content of the lesson
 */
export async function getLessonFromFile(file, lessonNumber = 0) {
  const fileContent = await readFile(file, 'utf8');
  const fileContentSansCR = fileContent.replace(/\r/g, '');
  const mat = fileContentSansCR.match(
    new RegExp(
      `## ${lessonNumber}\n(.*?)\n## (${lessonNumber + 1}|--fcc-end--)`,
      's'
    )
  );
  const lesson = mat?.[1];
  if (!lesson) {
    logover.debug(`Lesson ${lessonNumber} not found in ${file}`);
    throw new Error(`Lesson ${lessonNumber} not found in ${file}`);
  }

  // Seed might be in external file, but still needs to be returned
  // as part of lesson.
  let fileSeedContent;
  try {
    const { locale } = await getState();
    const project = basename(file);
    const seedFile = join(
      ROOT,
      freeCodeCampConfig.curriculum.locales[locale],
      project.replace('.md', '-seed.md')
    );
    fileSeedContent = await readFile(seedFile, 'utf8');
  } catch (e) {
    if (e?.code !== 'ENOENT') {
      logover.debug(`Error reading external seed for lesson ${lessonNumber}`);
      logover.debug(e);
      throw new Error(`Error reading external seed for lesson ${lessonNumber}`);
    }
  }
  if (fileSeedContent) {
    const fileSeedContentSansCR = fileSeedContent.replace(/\r/g, '');
    const seed = fileSeedContentSansCR.match(
      // NOTE: For separate seed file, there is no condition for every lesson to
      // have a seed - lesson numbers are not necessarily sequential.
      new RegExp(`## ${lessonNumber}\n(.*?)\n## (\d+|--fcc-end--)`, 's')
    )?.[1];
    if (seed) {
      return lesson + seed;
    }
  }

  return lesson;
}

/**
 * Gets the description of the lesson
 * @param {string} lesson - The lesson content
 * @returns {string | null} The description of the lesson
 */
export function getLessonDescription(lesson) {
  const description = parseMarker(DESCRIPTION_MARKER, lesson);
  return description ?? null;
}

/**
 * Gets the test text and tests of the lesson
 * @param {string} lesson - The lesson content
 * @returns {[string, string]} An array of [text, test]
 */
export function getLessonTextsAndTests(lesson) {
  const testsString = parseMarker(TESTS_MARKER, lesson);
  const textsAndTestsArr = [];
  const texts = testsString?.match(/^(.*?)$(?=\n+```js)/gm)?.filter(Boolean);
  const tests = testsString?.match(/(?<=```js\n).*?(?=```)/gms);

  if (texts?.length) {
    for (let i = 0; i < texts.length; i++) {
      textsAndTestsArr.push([texts[i], tests[i]]);
    }
  }
  return textsAndTestsArr;
}

/**
 * Gets the seed of the lesson. If none is found, returns `null`.
 * @param {string} lesson - The lesson content
 * @returns {string | null} The seed of the lesson
 */
export function getLessonSeed(lesson) {
  const seed = parseMarker(SEED_MARKER, lesson);
  return seed ?? null;
}

/**
 * Gets the hints of the lesson. If none are found, returns `null`.
 * @param {string} lesson - The lesson content
 * @returns {string[] | null} The hints of the lesson
 */
export function getLessonHints(lesson) {
  const hints = parseMarker(HINTS_MARKER, lesson);
  const hintsArr = hints.split(/\n#### \d+/);
  return hintsArr.filter(Boolean).map(h => h.trim());
}

/**
 * Gets the command/script to run before running the lesson tests
 * @param {string} lesson - The lesson content
 * @returns {string | null} The command to run before running the lesson tests
 */
export function getBeforeAll(lesson) {
  const beforeAll = parseMarker(BEFORE_ALL_MARKER, lesson);
  if (!beforeAll) return null;
  const beforeAllCommand = extractStringFromCode(beforeAll);
  return beforeAllCommand ?? null;
}

/**
 * Gets the command/script to run before running each lesson test
 * @param {string} lesson - The lesson content
 * @returns {string | null} The command to run before running each lesson test
 */
export function getBeforeEach(lesson) {
  const beforeEach = parseMarker(BEFORE_EACH_MARKER, lesson);
  if (!beforeEach) return null;
  const beforeEachCommand = extractStringFromCode(beforeEach);
  return beforeEachCommand ?? null;
}

/**
 * Gets the command/script to run after running the lesson tests
 * @param {string} lesson - The lesson content
 * @returns {string} The command to run after running the lesson tests
 */
export function getAfterAll(lesson) {
  const afterAll = parseMarker(AFTER_ALL_MARKER, lesson);
  if (!afterAll) return null;
  const afterAllCommand = extractStringFromCode(afterAll);
  return afterAllCommand ?? null;
}

/**
 * Gets any commands of the lesson seed. If none is found, returns an empty array.
 * @param {string} seed - The seed content
 * @returns {string[]} The commands of the lesson in order
 */
export function getCommands(seed) {
  const cmds = seed.match(new RegExp(`${CMD_MARKER}\n(.*?\`\`\`\n)`, 'gs'));
  const commands = cmds?.map(cmd => extractStringFromCode(cmd)?.trim());
  return commands ?? [];
}

/**
 * Gets any seed for specified files of the lesson seed. If none is found, returns an empty array.
 * @param {string} seed - The seed content
 * @returns {[string, string][]} [[filePath, fileSeed]]
 */
export function getFilesWithSeed(seed) {
  const files = seed.match(
    new RegExp(`#### --"([^"]+)"--\n(.*?\`\`\`\n)`, 'gs')
  );
  const filePaths = seed.match(new RegExp(FILE_MARKER_REG, 'gsm'));
  const fileSeeds = files?.map(file => extractStringFromCode(file)?.trim());

  const pathAndSeedArr = [];
  if (filePaths?.length) {
    for (let i = 0; i < filePaths.length; i++) {
      pathAndSeedArr.push([filePaths[i], fileSeeds[i]]);
    }
  }
  return pathAndSeedArr;
}

/**
 * Returns `boolean` for if lesson seed contains `force` flag
 * @param {string} seed - The seed content
 * @returns {boolean} Whether the seed has the `force` flag
 */
export function isForceFlag(seed) {
  return seed.includes('#### --force--');
}

/**
 * Returns a string stripped from the input codeblock
 * @param {string} code - The codeblock to strip
 * @returns {string} The stripped codeblock
 */
export function extractStringFromCode(code) {
  return code.replace(/.*?```[a-z]+\n(.*?)```.*/s, '$1');
}

/**
 * Return the total number of lessons for a given project
 * @param {string} file - The relative path to the english locale file
 * @returns {Promise<number>} The stripped codeblock
 */
export async function getTotalLessons(file) {
  const fileContent = await readFile(file, 'utf-8');
  const lessonNumbers = fileContent.match(/## \d+/g);
  const numberOfLessons = lessonNumbers.length;
  return numberOfLessons;
}

/**
 * Returns the content within the given marker of the lesson
 * @param {string} marker
 * @param {string} lesson
 * @returns {string | undefined} content or `undefined`
 */
function parseMarker(marker, lesson) {
  const mat = lesson.match(
    new RegExp(`${marker}\n(((?!${NEXT_MARKER_REG}).)*\n?)`, 's')
  );
  return mat?.[1];
}

/**
 * Returns a generator on the seed for ordered execution
 * @param {string} seed The lesson seed
 */
export function* seedToIterator(seed) {
  const sections = seed.match(new RegExp(`#### --(((?!#### --).)*\n?)`, 'sg'));
  for (const section of sections) {
    if (isForceFlag(section)) {
      continue;
    }

    const isFile = section.match(
      new RegExp(`#### --"([^"]+)"--\n(.*?\`\`\`\n)`, 's')
    );
    const isCMD = section.match(new RegExp(`#### --cmd--\n(.*?\`\`\`\n)`, 's'));
    if (isFile) {
      const filePath = isFile[1];
      const fileSeed = extractStringFromCode(isFile[2])?.trim();

      yield { filePath, fileSeed };
    } else if (isCMD) {
      yield extractStringFromCode(isCMD[1])?.trim();
    } else {
      throw new Error('Seed is malformed');
    }
  }
}
