// This file parses answer files for lesson content
const {
  getLessonFromFile,
  getLessonDescription,
  getLessonHintsAndTests,
  getProjectTitle,
  getLessonSeed,
  isForceFlag,
} = require("./parser");
const { LOCALE } = require("./t");
const {
  updateDescription,
  updateProjectHeading,
  updateTests,
} = require("./client-socks");
const { PATH, readEnv } = require("./env");
const { seedLesson } = require("./seed");

async function runLesson(ws, project, lessonNumber) {
  const locale = LOCALE === "undefined" ? "english" : LOCALE ?? "english";
  const projectFile = `${PATH}/tooling/locales/${locale}/${project}.md`;
  const lesson = getLessonFromFile(projectFile, Number(lessonNumber));
  const description = getLessonDescription(lesson);

  if (false) {
    const hintsAndTestsArr = getLessonHintsAndTests(lesson);
    updateTests(
      ws,
      hintsAndTestsArr.reduce((acc, curr, i) => {
        return [
          ...acc,
          { passed: false, testText: curr[0], testId: i, isLoading: false },
        ];
      }, [])
    );
  }

  const { projectTopic, currentProject } = await getProjectTitle(projectFile);
  updateProjectHeading(ws, { projectTopic, currentProject, lessonNumber });
  updateDescription(ws, description);

  const { SEED_EVERY_LESSON } = readEnv();
  const seed = getLessonSeed(lesson);
  const isForce = isForceFlag(seed);
  // force flag overrides seed flag
  if (
    (SEED_EVERY_LESSON === "true" && !isForce) ||
    (SEED_EVERY_LESSON !== "true" && isForce)
  ) {
    await seedLesson(ws, project, lessonNumber);
  }
}

module.exports = runLesson;
