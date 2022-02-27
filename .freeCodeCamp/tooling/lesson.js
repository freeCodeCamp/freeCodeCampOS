// This file parses answer files for lesson content
const {
  getLessonFromFile,
  getLessonDescription,
  getProjectTitle,
  getLessonSeed,
  isForceFlag,
} = require("./parser");
const { LOCALE } = require("./t");
const { updateDescription, updateProjectHeading } = require("./client-socks");
const { PATH, readEnv } = require("./env");
const { seedLesson } = require("./seed");

async function runLesson(ws, project, lessonNumber) {
  const locale = LOCALE === "undefined" ? "english" : LOCALE ?? "english";
  const projectFile = `${PATH}/tooling/locales/${locale}/${project}.md`;
  const lesson = getLessonFromFile(projectFile, lessonNumber);
  const description = getLessonDescription(lesson);

  const projectHeading = await getProjectTitle(projectFile);
  updateProjectHeading(ws, projectHeading, lessonNumber);
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
