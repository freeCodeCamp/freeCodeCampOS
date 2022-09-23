// Handles all the resetting of the projects

import { getProjectConfig, getState } from './env';
import { getLessonFromFile, getLessonSeed, seedToIterator } from './parser';
import { runLessonSeed } from './seed';

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
      await runLessonSeed(seed, currentProject, lessonNumber);
    }
    lessonNumber++;
    lesson = await getLessonFromFile(FILE, lessonNumber);
  }
}
