import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { logover } from "./logger";
import { pluginEvents } from "../plugin/index";
import { FreeCodeCampConfig } from "../../types/index";

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

export async function getState() {
  let defaultState = {
    currentProject: null,
    locale: "en",
    lastSeed: {
      projectDashedName: null,
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
    logover.error(err);
  }
  return defaultState;
}

export async function setState(obj) {
  const state = await getState();
  const updatedState = {
    ...state,
    ...obj,
  };

  await writeFile(
    join(ROOT, freeCodeCampConfig.config["state.json"]),
    JSON.stringify(updatedState, null, 2)
  );
}

/**
 * @param {string} projectDashedName Project dashed name
 */
export async function getProjectConfig(projectDashedName) {
  const config = await pluginEvents.getProjectMeta(projectDashedName);

  if (!config) {
    return defaultProjectMeta;
  }
  return { ...defaultProjectMeta, ...config };
}

/**
 *
 * @param {string} projectDashedName Project dashed name
 * @param {number} lessonNumber New current lesson number to set
 */
export async function updateCurrentLesson(projectDashedName, lessonNumber) {
  const state = await getState();

  const updatedProjects = {
    ...state.projects,
    [projectDashedName]: {
      ...state.projects[projectDashedName],
      currentLesson: lessonNumber,
    },
  };

  await setState({ projects: updatedProjects });
}

/**
 *
 * @param {string} projectDashedName Project dashed name
 * @param {Record<string, unknown>} obj Fields of the project to update
 */
export async function updateProjectState(projectDashedName, obj) {
  const state = await getState();

  const updatedProjects = {
    ...state.projects,
    [projectDashedName]: {
      ...state.projects[projectDashedName],
      ...obj,
    },
  };

  await setState({ projects: updatedProjects });
}

export const defaultProjectMeta = {
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
