// This file handles the fetching/parsing of the Git status of the project
import { promisify } from "util";
import { exec } from "child_process";
import { readEnv, updateEnv } from "../env.js";
const execute = promisify(exec);

export async function commit(lessonNumber) {
  try {
    const { stdout, stderr } = await execute(
      `git add . && git commit --allow-empty -m "(${lessonNumber})"`
    );
    if (stderr) {
      throw new Error(stderr);
    }
  } catch (e) {
    return Promise.reject(e);
  }
  return Promise.resolve();
}

export async function initCurrentProjectBranch() {
  const { CURRENT_PROJECT } = await readEnv();
  try {
    const { stdout, stderr } = await execute(
      `git checkout -b ${CURRENT_PROJECT}`
    );
    if (stderr) {
      throw new Error(stderr);
    }
  } catch (e) {
    return Promise.reject(e);
  }
  return Promise.resolve();
}

export async function getCommitHashByNumber(number) {
  const { LAST_KNOWN_LESSON_WITH_HASH, CURRENT_PROJECT } = await readEnv();
  try {
    const { stdout, stderr } = await execute(
      `git log origin/${CURRENT_PROJECT} --oneline --grep="(${number})" --`
    );
    if (stderr) {
      throw new Error(stderr);
    }
    const hash = stdout.match(/\w+/)?.[0];
    // This keeps track of the latest known commit in case there are no commits from one lesson to the next
    if (!hash) {
      return getCommitHashByNumber(LAST_KNOWN_LESSON_WITH_HASH);
    }
    await updateEnv({ LAST_KNOWN_LESSON_WITH_HASH: number });
    return hash;
  } catch (e) {
    throw new Error(e);
  }
}

async function ensureNoUnfinishedGit() {
  try {
    const { stdout, stderr } = await execute(`git cherry-pick --abort`);
    // Throwing in a `try` probably does not make sense
    if (stderr) {
      throw new Error(stderr);
    }
  } catch (e) {
    return Promise.reject(e);
  }
  return Promise.resolve();
}

export async function setFileSystemToLessonNumber(lessonNumber) {
  await ensureNoUnfinishedGit();
  const endHash = await getCommitHashByNumber(lessonNumber);
  const firstHash = await getCommitHashByNumber(1);
  try {
    // TODO: Continue on this error? Or, bail?
    if (!endHash || !firstHash) {
      throw new Error("Could not find commit hash");
    }
    // VOLUME BINDING?
    //
    // TODO: Probably do not want to always completely clean for each lesson
    if (firstHash === endHash) {
      await execute(`git clean -f -q -- . && git cherry-pick ${endHash}`);
    } else {
      // TODO: Why not git checkout ${endHash}
      const { stdout, stderr } = await execute(
        `git clean -f -q -- . && git cherry-pick ${firstHash}^..${endHash}`
      );
      if (stderr) {
        throw new Error(stderr);
      }
    }
  } catch (e) {
    return Promise.reject(e);
  }
  return Promise.resolve();
}

export async function pushProject() {
  const { CURRENT_PROJECT } = await readEnv();
  try {
    const { stdout, stderr } = await execute(
      `git push origin ${CURRENT_PROJECT}`
    );
    if (stderr) {
      throw new Error(stderr);
    }
  } catch (e) {
    return Promise.reject(e);
  }
  return Promise.resolve();
}

export async function finalise() {
  try {
    const { stdout, stderr } = await execute(`git checkout main`);
    if (stderr) {
      throw new Error(stderr);
    }
  } catch (e) {
    return Promise.reject(e);
  }
  return Promise.resolve();
}
