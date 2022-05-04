// This file handles creating the Git curriculum branch

import { PATH, readEnv, updateEnv } from "../env.js";
import {
  getCommands,
  getFilesWithSeed,
  getLessonFromFile,
  getLessonSeed,
} from "../parser.js";
import { runCommands, runSeed } from "../seed.js";
import {
  commit,
  deleteBranch,
  initCurrentProjectBranch,
  pushProject,
} from "./gitterizer.js";

const PROJECT_LIST = ["project-1"];

for (const project of PROJECT_LIST) {
  await updateEnv({ CURRENT_PROJECT: project });
  try {
    await buildProject();
  } catch (e) {
    console.error("🔴 Failed to build project: ", project);
    console.warn("🟠 Deleting created branch...");
    deleteBranch(project);
    throw new Error(e);
  }
}

async function buildProject() {
  const { CURRENT_PROJECT } = await readEnv();
  const FILE = `${PATH}/tooling/locales/english/${CURRENT_PROJECT}.md`;

  try {
    await initCurrentProjectBranch();
  } catch (e) {
    console.error("🔴 Failed to create a branch for ", CURRENT_PROJECT);
    throw new Error(e);
  }

  let lessonNumber = 1;
  let lesson = await getLessonFromFile(FILE, lessonNumber);
  while (lesson) {
    const seed = getLessonSeed(lesson);

    if (seed) {
      const commands = getCommands(seed);
      const filesWithSeed = getFilesWithSeed(seed);
      try {
        await runCommands(commands);
        await runSeed(filesWithSeed);
      } catch (e) {
        console.error("🔴 Failed to run seed for lesson: ", lessonNumber);
        throw new Error(e);
      }
    }
    try {
      // Always commit? Or, skip when seed is empty?
      await commit(lessonNumber);
    } catch (e) {
      console.error("🔴 Failed to commit lesson: ", lessonNumber);
      throw new Error(e);
    }
    lessonNumber++;
    lesson = await getLessonFromFile(FILE, lessonNumber);
  }

  try {
    await pushProject();
  } catch (e) {
    console.error("🔴 Failed to push project");
    throw new Error(e);
  }
}
