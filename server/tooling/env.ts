import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { logger } from "./logger";
import { pluginEvents } from "../plugin/index";
import {
  FreeCodeCampConfig,
  ProjectConfig,
  ProjectState,
  State,
} from "../../types/index";

export const ROOT = process.env.INIT_CWD || process.cwd();

export async function getConfig(): Promise<FreeCodeCampConfig> {
  const config = await readFile(join(ROOT, "freecodecamp.conf.json"), "utf-8");
  const conf = JSON.parse(config);
  const defaultConfig = {
    curriculum: {
      locales: {
        en: "curriculum/locales/en",
      },
    },
    config: {
      "state.json": "config/state.json",
    },
  };
  return { ...defaultConfig, ...conf };
}

export const freeCodeCampConfig = await getConfig();

export async function getState(): Promise<State> {
  let defaultState = {
    currentProject: null,
    locale: "en",
    lastSeed: {
      projectId: null,
      // All lessons start at 0, but the logic for whether to seed a lesson
      // or not is based on the current lesson matching the last seeded lesson
      // So, to ensure the first lesson is seeded, this is -1
      lessonNumber: -1,
    },
    // All lessons start at 0, but the logic for whether to run certain effects
    // is based on the current lesson matching the last lesson
    lastWatchChange: -1,
    // All the projects mapped to their state
    projects: {},
  };
  try {
    const state = JSON.parse(
      await readFile(
        join(ROOT, freeCodeCampConfig.config["state.json"]),
        "utf-8"
      )
    );
    return { ...defaultState, ...state };
  } catch (err) {
    logger.error(err);
  }
  return defaultState;
}

export async function setState(obj: Partial<State>): Promise<State> {
  const state = await getState();
  const updatedState = {
    ...state,
    ...obj,
  };

  await writeFile(
    join(ROOT, freeCodeCampConfig.config["state.json"]),
    JSON.stringify(updatedState, null, 2)
  );

  return updatedState;
}

export async function getProjectConfig(
  projectId: number
): Promise<ProjectConfig> {
  const config = await pluginEvents.getProjectConfig(projectId);

  return { ...defaultProjectConfig, ...config };
}

export async function updateCurrentLesson(
  projectId: number,
  lessonNumber: number
) {
  const state = await getState();

  const updatedProjects = {
    ...state.projects,
    [projectId]: {
      ...state.projects[projectId],
      currentLesson: lessonNumber,
    },
  };

  await setState({ projects: updatedProjects });
}

export async function updateProjectState(
  projectId: number,
  obj: Partial<ProjectState>
) {
  const state = await getState();

  const updatedProjects = {
    ...state.projects,
    [projectId]: {
      ...state.projects[projectId],
      ...obj,
    },
  };

  await setState({ projects: updatedProjects });
}

export const defaultProjectConfig: Partial<ProjectConfig> = {
  isIntegrated: false,
  isPublic: true,
  runTestsOnWatch: false,
  seedEveryLesson: false,
  isResetEnabled: false,
  blockingTests: false,
  breakOnFailure: false,
  lastKnownLessonWithHash: 0,
  testPollingRate: 333,
  useGitBuildOnProduction: false, // TODO: Necessary?
  tags: [],
};
