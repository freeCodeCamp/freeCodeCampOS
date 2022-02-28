// This file handles seeding the lesson contents with the seed in markdown.
const {
  getLessonFromFile,
  getLessonSeed,
  getCommands,
  getFilesWithSeed,
} = require("./parser");
const { LOCALE } = require("./t");
const { PATH } = require("./env");
const fs = require("fs/promises");
const util = require("util");
const execute = util.promisify(require("child_process").exec);

async function seedLesson(ws, project, lessonNumber) {
  // TODO: Use ws to display loader whilst seeding
  const locale = LOCALE === "undefined" ? "english" : LOCALE ?? "english";
  const projectFile = `${PATH}/tooling/locales/${locale}/${project}.md`;
  const lesson = getLessonFromFile(projectFile, Number(lessonNumber));
  const seed = getLessonSeed(lesson);

  const commands = getCommands(seed);
  const filesWithSeed = getFilesWithSeed(seed);

  try {
    await runCommands(commands);
    await runSeed(filesWithSeed);
  } catch (e) {
    // TODO: Add error to UI explaining error
    console.error(e);
  }
}

/**
 * Runs the given array of commands in order
 * @param {string[]} commands - Array of commands to run
 */
async function runCommands(commands) {
  // Execute the following commands in the shell
  for (const command of commands) {
    const { stdout, stderr } = await execute(command);
    if (stderr) {
      console.error(stderr);
      return Promise.reject(stderr);
    }
  }
  return Promise.resolve();
}

/**
 * Runs the given array of files with seed
 * @param {[string, string][]} filesWithSeed - [[filePath, fileSeed]]
 */
async function runSeed(filesWithSeed) {
  try {
    for (const [filePath, fileSeed] of filesWithSeed) {
      const filePathWithRoot = `${filePath}`;
      const file = await fs.readFile(filePathWithRoot, "utf8");
      const newFile = file.replace(fileSeed, "");
      await fs.writeFile(filePathWithRoot, newFile);
    }
  } catch (e) {
    return Promise.reject(e);
  }
  return Promise.resolve();
}

module.exports = {
  seedLesson,
};
