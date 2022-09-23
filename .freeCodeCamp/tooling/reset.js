// Handles all the resetting of the projects

import { getProjectConfig, getState } from './env';
import { logover } from './logger';
import {
  getCommands,
  getFilesWithSeed,
  getLessonFromFile,
  getLessonSeed
} from './parser';
import { runCommands, runSeed } from './seed';

export async function resetProject() {
  // Get commands and handle file setting
  const { currentProject } = await getState();
  const project = await getProjectConfig(currentProject);
  const { currentLesson } = project;
  const FILE = join(
    ROOT,
    freeCodeCampConfig.curriculum.locales['english'],
    project.dashedName + '.md'
  );

  let lessonNumber = 1;
  let lesson = await getLessonFromFile(FILE, lessonNumber);
  if (!lesson) {
    return new Error(`No lesson found for ${currentProject}`);
  }
  while (lessonNumber <= currentLesson) {
    const seed = getLessonSeed(lesson);
    if (seed) {
      const commands = getCommands(seed);
      const filesWithSeed = getFilesWithSeed(seed);
      try {
        await runCommands(commands);
        await runSeed(filesWithSeed);
      } catch (e) {
        logover.error('Failed to run seed for lesson: ', lessonNumber);
        throw new Error(e);
      }
    }
    lessonNumber++;
    lesson = await getLessonFromFile(FILE, lessonNumber);
  }
}
