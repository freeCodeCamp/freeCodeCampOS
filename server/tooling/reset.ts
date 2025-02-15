// Handles all the resetting of the projects
import { resetBottomPanel, updateError } from "./client-socks";
import { getProjectConfig, getState } from "./env";
import { logger } from "./logger";
import { runCommand, runLessonSeed } from "./seed";
import { pluginEvents } from "../plugin/index";

/**
 * Resets the current project by running, in order, every seed
 */
export async function resetProject(ws: WebSocket) {
  resetBottomPanel(ws);
  // Get commands and handle file setting
  const { currentProject, projects } = await getState();
  const project = await pluginEvents.getProject(currentProject!);
  const currentLesson = projects[project.id].currentLesson;
  // updateLoader(ws, {
  //   isLoading: true,
  //   progress: { total: currentLesson, count: 0 },
  // });

  let lessonNumber = 0;
  try {
    await gitResetCurrentProjectDir();
    while (lessonNumber <= currentLesson) {
      const { seed } = await pluginEvents.getLesson(
        currentProject!,
        lessonNumber
      );
      if (seed) {
        await runLessonSeed(seed, lessonNumber);
      }
      lessonNumber++;
      // updateLoader(ws, {
      //   isLoading: true,
      //   progress: { total: currentLesson, count: lessonNumber },
      // });
    }
  } catch (err) {
    updateError(ws, err);
    logger.error(err);
  }
  // updateLoader(ws, {
  //   isLoading: false,
  //   progress: { total: 1, count: 1 },
  // });
}

async function gitResetCurrentProjectDir() {
  const { currentProject } = await getState();
  const project = await pluginEvents.getProject(currentProject!);
  try {
    logger.debug(`Cleaning '${project.dashedName}'`);
    const { stdout, stderr } = await runCommand(
      `git clean -f -q -- ${project.dashedName}`
    );
  } catch (e) {
    logger.error(e);
  }
}
