// Handles all the resetting of the projects
import { resetBottomPanel, updateError } from './client-socks.js';
import { getProjectConfig, getState } from './env.js';
import { logover } from './logger.js';
import { runCommand, runLessonSeed } from './seed.js';
import { pluginEvents } from '../plugin/index.js';

/**
 * Resets the current project by running, in order, every seed
 * @param {WebSocket} ws
 */
export async function resetProject(ws) {
  resetBottomPanel(ws);
  // Get commands and handle file setting
  const { currentProject } = await getState();
  const project = await getProjectConfig(currentProject);
  const { currentLesson } = project;

  let lessonNumber = 0;
  try {
    await gitResetCurrentProjectDir();
    while (lessonNumber <= currentLesson) {
      const { seed } = pluginEvents.getLesson(currentProject, lessonNumber);
      if (seed) {
        await runLessonSeed(seed, currentProject, lessonNumber);
      }
      lessonNumber++;
    }
  } catch (err) {
    updateError(ws, err);
    logover.error(err);
  }
}

async function gitResetCurrentProjectDir() {
  const { currentProject } = await getState();
  const project = await getProjectConfig(currentProject);
  try {
    logover.debug(`Cleaning '${project.dashedName}'`);
    const { stdout, stderr } = await runCommand(
      `git clean -f -q -- ${project.dashedName}`
    );
  } catch (e) {
    logover.error(e);
  }
}
