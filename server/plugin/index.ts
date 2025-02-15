import { readFile } from "fs/promises";
import { freeCodeCampConfig, getState, ROOT } from "../tooling/env";
import { CoffeeDown } from "../tooling/parser";
import { join } from "path";
import { logger } from "../tooling/logger";
import { Lesson, Project, ProjectConfig, Test, TestState } from "../../types";
import { getProjectFileById } from "../tooling/utils";

export const pluginEvents = {
  onTestsStart: async (project: Project, testsState: TestState[]) => {},

  onTestsEnd: async (project: Project, testsState: TestState[]) => {},

  onProjectStart: async (project: Project) => {},

  onProjectFinished: async (project: Project) => {},

  onLessonPassed: async (project: Project) => {},

  onLessonFailed: async (project: Project) => {},

  onLessonLoad: async (project: Project) => {},

  getProjectConfig: async (id: number): Promise<ProjectConfig> => {
    const projectFile = await getProjectFileById(id);

    if (!projectFile) {
      throw new Error(`Project with id ${id} not found`);
    }

    const coffeeDown = new CoffeeDown(projectFile);
    const projectMeta = coffeeDown.getProjectMeta();

    return projectMeta;
  },

  getLesson: async (
    projectId: number,
    lessonNumber: number
  ): Promise<Lesson> => {
    const projectFile = await getProjectFileById(projectId);

    if (!projectFile) {
      throw new Error(`Project with id ${projectId} not found`);
    }

    const coffeeDown = new CoffeeDown(projectFile);
    const lesson = coffeeDown.getLesson(lessonNumber);
    let seed = lesson.seed;
    if (!seed.length) {
      // Check for external seed file
      const seedFilePath = coffeeDown.getProjectMeta().dashedName + "-seed.md";
      try {
        const seedContent = await readFile(seedFilePath, "utf-8");
        const coffeeDown = new CoffeeDown(seedContent);
        // TODO: might fail as lesson is not valid
        seed = coffeeDown.getLesson(lessonNumber).seed;
      } catch (e) {
        if (e?.code !== "ENOENT") {
          logger.debug(e);
          throw new Error(
            `Error reading external seed for lesson ${lessonNumber}`
          );
        }
      }
    }

    return lesson;
  },

  getProject: async (projectId: number): Promise<Project> => {
    const projectFile = await getProjectFileById(projectId);

    if (!projectFile) {
      throw new Error(`Project with id ${projectId} not found`);
    }

    const coffeeDown = new CoffeeDown(projectFile);

    const project = coffeeDown.project;

    return project;
  },
};
