// These are used in the local scope of the `eval` in `runTests`
const fs = require("fs");
const assert = require("chai").assert;
const __helpers = require("./test-utils");

const { getLessonHintsAndTests, getLessonFromFile } = require("./parser.js");

const { t, LOCALE } = require("./t");
const { updateEnv, PATH } = require("./env.js");
const runLesson = require("./lesson");
const { toggleLoaderAnimation, updateTests } = require("./client-socks");

async function runTests(ws, project, lessonNumber) {
  const locale = LOCALE === "undefined" ? "english" : LOCALE;
  toggleLoaderAnimation(ws);
  try {
    const projectFile = `${PATH}/tooling/locales/${locale}/${project}.md`;
    const lesson = getLessonFromFile(projectFile, lessonNumber);
    const hintsAndTestsArr = getLessonHintsAndTests(lesson);

    const testPromises = hintsAndTestsArr.map(async ([hint, test]) => {
      try {
        const _testOutput = await eval(`(async () => {${test}})();`);
      } catch (e) {
        return Promise.reject(`- ${hint}\n`);
      }
      return Promise.resolve();
    });

    try {
      const passed = await Promise.all(testPromises);
      if (passed) {
        console.log(t("lesson-correct", { lessonNumber }));
        updateEnv({ CURRENT_LESSON: lessonNumber + 1 });
        runLesson(ws, project, lessonNumber + 1);
        updateTests(ws, "");
      }
    } catch (e) {
      // console.log(e);
      updateTests(ws, e);
    }
  } catch (e) {
    console.log(t("tests-error"));
    console.log(e);
  } finally {
    toggleLoaderAnimation(ws);
  }
}

module.exports = runTests;
