// This file handles the watching of the /curriculum folder for changes
// and executing the command to run the tests for the next (current) lesson
const { readEnv } = require("./env");
const runLesson = require("./lesson");
const runTests = require("./test");
const chokidar = require("chokidar");
const { TEST_POLLING_RATE, RUN_TESTS_ON_WATCH } = readEnv();
const curriculumFolder = "../";

function hotReload(ws) {
  console.log(`Watching for file changes on ${curriculumFolder}`);
  let isWait = false;
  let isClearConsole = false;

  chokidar
    .watch(curriculumFolder, { ignored: ".logs/.temp.log" })
    .on("all", (event, name) => {
      if (name) {
        if (isWait) return;
        isWait = setTimeout(() => {
          isWait = false;
        }, TEST_POLLING_RATE);

        const { CURRENT_PROJECT, CURRENT_LESSON } = readEnv();
        if (isClearConsole) {
          console.clear();
        }
        runLesson(ws, CURRENT_PROJECT, Number(CURRENT_LESSON));
        // console.log(`Watcher: ${event} - ${name}`);
        if (RUN_TESTS_ON_WATCH === "true") {
          runTests(ws, CURRENT_PROJECT, Number(CURRENT_LESSON));
        }
      }
    });
}

module.exports = hotReload;
