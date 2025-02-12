import { readFile } from "fs/promises";
import { freeCodeCampConfig, getState, ROOT } from "../tooling/env";
import { CoffeeDown, parseMarkdown } from "../tooling/parser";
import { join } from "path";
import { logover } from "../tooling/logger";
import { Lesson, Project, ProjectConfig, Test, TestState } from "../../types";

export const pluginEvents = {
  onTestsStart: async (project: Project, testState: TestState) => {},

  onTestsEnd: async (project: Project, testState: TestState) => {},

  onProjectStart: async (project: Project) => {},

  onProjectFinished: async (project: Project) => {},

  onLessonPassed: async (project: Project) => {},

  onLessonFailed: async (project: Project) => {},

  onLessonLoad: async (project: Project) => {},

  getProjectConfig: async (
    projectDashedName: string
  ): Promise<ProjectConfig> => {
    const { locale } = await getState();
    const projectFilePath = join(
      ROOT,
      freeCodeCampConfig.curriculum.locales[locale],
      projectDashedName + ".md"
    );
    const projectFile = await readFile(projectFilePath, "utf8");
    const coffeeDown = new CoffeeDown(projectFile);
    const projectMeta = coffeeDown.getProjectMeta();
    // Remove `<p>` tags if present
    const title = parseMarkdown(projectMeta.title)
      .replace(/<p>|<\/p>/g, "")
      .trim();
    const description = parseMarkdown(projectMeta.description).trim();
    return { ...projectMeta, title, description };
  },

  getLesson: async (
    projectDashedName: string,
    lessonNumber: number
  ): Promise<Lesson> => {
    const { locale } = await getState();
    const projectFilePath = join(
      ROOT,
      freeCodeCampConfig.curriculum.locales[locale],
      projectDashedName + ".md"
    );
    const projectFile = await readFile(projectFilePath, "utf8");
    const coffeeDown = new CoffeeDown(projectFile);
    const lesson = coffeeDown.getLesson(lessonNumber);
    let seed = lesson.seed;
    if (!seed.length) {
      // Check for external seed file
      const seedFilePath = projectFilePath.replace(/.md$/, "-seed.md");
      try {
        const seedContent = await readFile(seedFilePath, "utf-8");
        const coffeeDown = new CoffeeDown(seedContent);
        seed = coffeeDown.getLesson(lessonNumber).seed;
      } catch (e) {
        if (e?.code !== "ENOENT") {
          logover.debug(e);
          throw new Error(
            `Error reading external seed for lesson ${lessonNumber}`
          );
        }
      }
    }
    const { afterAll, afterEach, beforeAll, beforeEach, meta } = lesson;
    const description = parseMarkdown(lesson.description).trim();
    const tests: Test[] = lesson.tests.map(([testText, test]) => [
      parseMarkdown(testText).trim(),
      test,
    ]);
    const hints = lesson.hints.map((h) => parseMarkdown(h).trim());
    return {
      meta,
      description,
      tests,
      hints,
      seed,
      beforeAll,
      afterAll,
      beforeEach,
      afterEach,
    };
  },
};
