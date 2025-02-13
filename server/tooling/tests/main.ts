import { assert, AssertionError, expect, config as chaiConfig } from "chai";
import { watcher } from "../hot-reload";
import { logover } from "../logger";

import {
  getProjectConfig,
  getState,
  setState,
  updateCurrentLesson,
  freeCodeCampConfig,
  ROOT,
  updateProjectState,
} from "../env";
import {
  updateTestState,
  updateTestsState,
  updateConsole,
  resetBottomPanel,
  handleProjectFinish,
} from "../client-socks";
import { runLesson } from "../lesson";
import { join } from "node:path";
import { Worker } from "node:worker_threads";
import { pluginEvents } from "../../plugin/index";
import { t } from "../t";
import { ConsoleError, Project, TestState } from "../../../types";

try {
  const plugins = freeCodeCampConfig.tooling?.plugins;
  if (plugins) {
    const pluginPath = join(ROOT, plugins);
    logover.debug("Importing plugins from:", pluginPath);
    await import(pluginPath);
  }
} catch (e) {
  logover.error("Error importing plugins:");
  logover.error(e);
}

export const WORKER_POOL: Worker[] = [];

/**
 * Run the given project's tests
 */
export async function runTests(ws: WebSocket, projectId: number) {
  // TODO: Consider awaiting in parallel, since both invoke `fs`
  const project = await pluginEvents.getProject(projectId);
  const { locale, projects } = await getState();
  // toggleLoaderAnimation(ws);
  const lessonNumber = projects[project.id].currentLesson;

  let testsState: TestState[] = [];
  try {
    const lesson = await pluginEvents.getLesson(projectId, lessonNumber);
    const { beforeAll, beforeEach, afterAll, afterEach, hints, tests } = lesson;

    if (beforeAll) {
      try {
        logover.debug("Starting: --before-all-- hook");
        await eval(`(async () => {${beforeAll}})()`);
        logover.debug("Finished: --before-all-- hook");
      } catch (e) {
        logover.error("--before-all-- hook failed to run:");
        logover.error(e);
      }
    }
    // toggleLoaderAnimation(ws);

    testsState = tests.map((text, i) => {
      return {
        passed: false,
        testText: text[0],
        testId: i,
        isLoading: !project.blockingTests,
      };
    });

    await pluginEvents.onTestsStart(project, testsState);

    updateTestsState(ws, testsState);
    updateConsole(ws, {} as ConsoleError);

    // Create one worker for each test if non-blocking.
    // TODO: See if holding pool of workers is better.
    if (project.blockingTests) {
      const worker = createWorker("blocking-worker", { beforeEach, project });
      WORKER_POOL.push(worker);

      // When result is received back from worker, update the client state
      worker.on("message", workerMessage);
      // worker.stdout.on("data", (data) => {
      //   logover.debug(`Blocking Worker:`, data.toString());
      // });
      worker.on("exit", async (exitCode) => {
        removeWorkerFromPool(worker);
        await handleWorkerExit({
          ws,
          exitCode,
          testsState,
          afterEach,
          project,
          hints,
          lessonNumber,
          afterAll,
        });
      });

      for (let i = 0; i < tests.length; i++) {
        const [_text, testCode] = tests[i];
        testsState[i].isLoading = true;
        updateTestState(ws, testsState[i]);

        worker.postMessage({ testCode, testId: i });
      }
    } else {
      // Run tests in parallel, and in own worker threads
      for (let i = 0; i < tests.length; i++) {
        const [_text, testCode] = tests[i];
        testsState[i].isLoading = true;
        updateTestState(ws, testsState[i]);

        const worker = createWorker(`worker-${i}`, { beforeEach, project });
        WORKER_POOL.push(worker);

        // When result is received back from worker, update the client state
        worker.on("message", workerMessage);
        // worker.stdout.on("data", (data) => {
        //   logover.debug(`Worker-${i}:`, data.toString());
        // });
        worker.on("exit", async (exitCode) => {
          removeWorkerFromPool(worker);
          await handleWorkerExit({
            ws,
            exitCode,
            testsState,
            i,
            afterEach,
            project,
            hints,
            lessonNumber,
            afterAll,
          });
        });

        worker.postMessage({ testCode, testId: i });
      }
    }

    async function workerMessage(message: any) {
      const { passed, testId, error } = message;
      testsState[testId].isLoading = false;
      testsState[testId].passed = passed;
      if (error) {
        if (error.type !== "AssertionError") {
          logover.error(`Test #${testId}:`, error);
        }

        if (error.message) {
          const assertionTranslation = await t(error.message, {});
          error.message = assertionTranslation || error.message;
        }

        const consoleError = {
          ...testsState[testId],
          error,
        };
        updateConsole(ws, consoleError);
      }
      updateTestState(ws, testsState[testId]);

      await checkTestsCallback({
        ws,
        project,
        lessonNumber,
        testsState,
        afterAll,
      });
    }
  } catch (e) {
    logover.error("Test Error: ");
    logover.error(e);
  }
}

interface CheckTestsCallbackI {
  ws: WebSocket;
  project: Project;
  lessonNumber: number;
  testsState: TestState[];
  afterAll?: string;
}

async function checkTestsCallback({
  ws,
  project,
  lessonNumber,
  testsState,
  afterAll,
}: CheckTestsCallbackI) {
  const passed = testsState.every((test) => test.passed);
  if (passed) {
    await pluginEvents.onLessonPassed(project);

    resetBottomPanel(ws);
    if (project.isIntegrated || lessonNumber === project.numberOfLessons - 1) {
      await pluginEvents.onProjectFinished(project);
      await updateProjectState(project.id, {
        completedDate: Date.now(),
      });
      handleProjectFinish(ws);
    } else {
      await updateCurrentLesson(project.id, lessonNumber + 1);
      await runLesson(ws, project.id);
    }
  } else {
    await pluginEvents.onLessonFailed(project);
  }
  const allTestsFinished = testsState.every((test) => !test.isLoading);
  if (allTestsFinished) {
    // Run afterAll hook
    if (afterAll) {
      try {
        logover.debug("Starting: --after-all-- hook");
        await eval(`(async () => {${afterAll}})()`);
        logover.debug("Finished: --after-all-- hook");
      } catch (e) {
        logover.error("--after-all-- hook failed to run:");
        logover.error(e);
      }
    }

    await pluginEvents.onTestsEnd(project, testsState);
    WORKER_POOL.splice(0, WORKER_POOL.length);
  }
}

interface HandleWorkerExitI {
  ws: WebSocket;
  exitCode: number;
  testsState: TestState[];
  i?: number;
  afterEach?: string;
  project: Project;
  hints: string[];
  lessonNumber: number;
  afterAll?: string;
}
/**
 * NOTE: Either `handleCancelTests` or `handleWorkerExit` should update `testsState`
 */
async function handleWorkerExit({
  ws,
  exitCode,
  testsState,
  i,
  afterEach,
  project,
  lessonNumber,
  afterAll,
}: HandleWorkerExitI) {
  // If exit code == 1, worker was likely terminated
  // Let client know test was cancelled
  if (exitCode === 1) {
    if (i !== undefined) {
      testsState[i].isLoading = false;
      testsState[i].passed = false;
      const consoleError = {
        ...testsState[i],
        error: "Tests cancelled.",
      };
      updateConsole(ws, consoleError);
    } else {
      testsState.forEach((test) => {
        if (test.isLoading) {
          test.isLoading = false;
          test.passed = false;
          updateConsole(ws, {
            ...test,
            error: "Tests cancelled.",
          });
        }
      });
    }
    updateTestsState(ws, testsState);
  }
  // Run afterEach even if tests are cancelled
  try {
    const _afterEachOut = await eval(`(async () => { ${afterEach} })();`);
  } catch (e) {
    logover.error("--after-each-- hook failed to run:");
    logover.error(e);
  }
  // Run afterAll even if tests are cancelled
  await checkTestsCallback({
    ws,
    project,
    lessonNumber,
    testsState,
    afterAll,
  });
}

function createWorker(
  name: string,
  workerData: { beforeEach?: string; project: Project }
) {
  const workerPath = join(import.meta.dir, "test-worker.ts");
  return new Worker(workerPath, {
    name,
    workerData,
    // stdout: true,
    // stdin: true,
  });
}

export function getWorkerPool() {
  return WORKER_POOL;
}

function removeWorkerFromPool(worker: Worker) {
  const index = WORKER_POOL.indexOf(worker);
  if (index > -1) {
    WORKER_POOL.splice(index, 1);
  }
}
