import { AssertionError } from 'chai';
import { logover } from '../logger.js';
import { getProjectConfig, getState, setProjectConfig } from '../env.js';
import { freeCodeCampConfig, ROOT } from '../env.js';
import {
  getLessonFromFile,
  getBeforeAll,
  getBeforeEach,
  getAfterAll,
  getAfterEach,
  getLessonHints,
  getLessonTextsAndTests
} from '../parser.js';
import {
  updateTest,
  updateTests,
  updateConsole,
  updateHints,
  resetBottomPanel,
  handleProjectFinish
} from '../client-socks.js';
import { runLesson } from '../lesson.js';
import { join } from 'node:path';
import { Worker } from 'node:worker_threads';
import { pluginEvents } from '../../plugin/index.js';

try {
  const plugins = freeCodeCampConfig.tooling?.plugins;
  if (plugins) {
    await import(join(ROOT, plugins));
  }
} catch (e) {
  logover.error('Error importing plugins:');
  logover.error(e);
}

/**
 * Run the given project's tests
 * @param {WebSocket} ws
 * @param {string} projectDashedName
 */
export async function runTests(ws, projectDashedName) {
  // TODO: Consider awaiting in parallel, since both invoke `fs`
  const project = await getProjectConfig(projectDashedName);
  const { locale } = await getState();
  // toggleLoaderAnimation(ws);
  const lessonNumber = project.currentLesson;
  const projectFile = join(
    ROOT,
    freeCodeCampConfig.curriculum.locales[locale],
    project.dashedName + '.md'
  );
  let testsState = [];
  try {
    const lesson = await getLessonFromFile(projectFile, lessonNumber);
    const beforeAll = getBeforeAll(lesson);
    const beforeEach = getBeforeEach(lesson);
    const afterAll = getAfterAll(lesson);
    const afterEach = getAfterEach(lesson);

    if (beforeAll) {
      try {
        logover.debug('Starting: --before-all-- hook');
        await eval(`(async () => {${beforeAll}})()`);
        logover.debug('Finished: --before-all-- hook');
      } catch (e) {
        logover.error('--before-all-- hook failed to run:');
        logover.error(e);
      }
    }
    // toggleLoaderAnimation(ws);

    const hints = getLessonHints(lesson);

    const textsAndTestsArr = getLessonTextsAndTests(lesson);
    testsState = textsAndTestsArr.map((text, i) => {
      return {
        passed: false,
        testText: text[0],
        testId: i,
        isLoading: !project.blockingTests
      };
    });

    await pluginEvents.onTestsStart(project, testsState);

    updateTests(ws, testsState);
    updateConsole(ws, '');

    // Create one worker for each test if non-blocking.
    // TODO: See if holding pool of workers is better.
    if (project.blockingTests) {
      const worker = createWorker('blocking-worker', { beforeEach });

      // Kill worker if client says, or test timesout
      ws.on('message', async message => {
        await handleCancelTests({
          ws,
          project,
          message,
          worker,
          testsState,
          hints,
          afterAll,
          lessonNumber
        });
      });
      // When result is received back from worker, update the client state
      worker.on('message', workerMessage);
      worker.stdout.on('data', data => {
        logover.debug(`Blocking Worker:`, data.toString());
      });
      worker.on('exit', async exitCode => {
        worker.exited = true;
        await handleWorkerExit({ ws, exitCode, testsState, afterEach });
      });

      for (let i = 0; i < textsAndTestsArr.length; i++) {
        const [text, testCode] = textsAndTestsArr[i];
        testsState[i].isLoading = true;
        updateTest(ws, testsState[i]);

        worker.postMessage({ testCode, testId: i });
      }
    } else {
      // Run tests in parallel, and in own worker threads
      for (let i = 0; i < textsAndTestsArr.length; i++) {
        const [_text, testCode] = textsAndTestsArr[i];
        testsState[i].isLoading = true;
        updateTest(ws, testsState[i]);

        const worker = createWorker(`worker-${i}`, { beforeEach });

        // Kill worker if client says, or test timesout
        ws.on('message', async message => {
          await handleCancelTests({
            ws,
            message,
            worker,
            testsState,
            i,
            project,
            hints,
            afterAll,
            lessonNumber
          });
        });
        // When result is received back from worker, update the client state
        worker.on('message', workerMessage);
        worker.stdout.on('data', data => {
          logover.debug(`Worker-${i}:`, data.toString());
        });
        worker.on('exit', async exitCode => {
          worker.exited = true;
          await handleWorkerExit({ ws, exitCode, testsState, i, afterEach });
        });

        worker.postMessage({ testCode, testId: i });
      }
    }

    async function workerMessage(message) {
      const { passed, testId, error } = message;
      testsState[testId].isLoading = false;
      testsState[testId].passed = passed;
      if (error) {
        if (error.type !== 'AssertionError') {
          logover.error(`Test #${testId}:`, error);
        }

        const consoleError = {
          ...testsState[testId],
          error
        };
        updateConsole(ws, consoleError);
      }
      updateTest(ws, testsState[testId]);

      await checkTestsCallback({
        ws,
        project,
        hints,
        lessonNumber,
        testsState,
        afterAll
      });
    }
  } catch (e) {
    logover.error('Test Error: ');
    logover.error(e);
  }
}

async function checkTestsCallback({
  ws,
  project,
  hints,
  lessonNumber,
  testsState,
  afterAll
}) {
  const passed = testsState.every(test => test.passed);
  if (passed) {
    await pluginEvents.onLessonPassed(project);

    if (project.isIntegrated || lessonNumber === project.numberOfLessons - 1) {
      await pluginEvents.onProjectFinished(project);
      await setProjectConfig(project.dashedName, {
        completedDate: Date.now()
      });
      resetBottomPanel(ws);
      handleProjectFinish(ws);
    } else {
      await setProjectConfig(project.dashedName, {
        currentLesson: lessonNumber + 1
      });
      await runLesson(ws, project.dashedName);
    }
  } else {
    await pluginEvents.onLessonFailed(project);
    updateHints(ws, hints);
  }
  const allTestsFinished = testsState.every(test => !test.isLoading);
  if (allTestsFinished) {
    // Run afterAll hook
    if (afterAll) {
      try {
        logover.debug('Starting: --after-all-- hook');
        await eval(`(async () => {${afterAll}})()`);
        logover.debug('Finished: --after-all-- hook');
      } catch (e) {
        logover.error('--after-all-- hook failed to run:');
        logover.error(e);
      }
    }

    await pluginEvents.onTestsEnd(project, testsState);
  }
}

/**
 * Handles the 'cancel-tests' event from the client
 * @param {object} param0
 * @param {WebSocket} param0.ws
 * @param {string} param0.message
 * @param {Worker} param0.worker
 * @param {Array} param0.testsState
 * @param {number} param0.i
 * @param {object} param0.project
 * @param {Array} param0.hints
 * @param {string} param0.afterAll
 * @param {number} param0.lessonNumber
 */
async function handleCancelTests({
  ws,
  message,
  worker,
  testsState,
  i,
  project,
  hints,
  afterAll,
  lessonNumber
}) {
  const { event, data } = JSON.parse(message);
  // When worker is exited, `.resourceLimits == {}`
  if (event === 'cancel-tests') {
    worker.terminate();
    if (i !== undefined && !worker.exited) {
      testsState[i].isLoading = false;
      testsState[i].passed = false;
      updateConsole(ws, {
        ...testsState[i],
        error: 'Tests cancelled.'
      });
    } else {
      testsState.forEach(test => {
        if (test.isLoading) {
          test.isLoading = false;
          test.passed = false;
          updateConsole(ws, {
            ...test,
            error: 'Tests cancelled.'
          });
        }
      });
    }
    updateTests(ws, testsState);

    // Run afterAll even if tests are cancelled
    await checkTestsCallback({
      ws,
      project,
      hints,
      lessonNumber,
      testsState,
      afterAll
    });
  }
}

/**
 * NOTE: Either `handleCancelTests` or `handleWorkerExit` should update `testsState`
 * @param {object} param0
 * @param {number} param0.exitCode
 * @param {Array} param0.testsState
 * @param {number} param0.i
 * @param {string} param0.afterEach
 * @param {object} param0.error
 */
async function handleWorkerExit({ ws, exitCode, testsState, i, afterEach }) {
  // If exit code == 1, worker was likely terminated
  // Let client know test was cancelled
  if (exitCode === 1) {
    if (i !== undefined) {
      testsState[i].isLoading = false;
      testsState[i].passed = false;
      const consoleError = {
        ...testsState[i],
        error: 'Tests cancelled.'
      };
      updateConsole(ws, consoleError);
    } else {
      testsState.forEach(test => {
        if (test.isLoading) {
          test.isLoading = false;
          test.passed = false;
          updateConsole(ws, {
            ...test,
            error: 'Tests cancelled.'
          });
        }
      });
    }
    updateTests(ws, testsState);
  }
  // Run afterEach even if tests are cancelled
  try {
    const _afterEachOut = await eval(`(async () => { ${afterEach} })();`);
  } catch (e) {
    logover.error('--after-each-- hook failed to run:');
    logover.error(e);
  }
}

function createWorker(name, workerData) {
  return new Worker(
    join(ROOT, '.freeCodeCamp/tooling/tests', 'test-worker.js'),
    {
      name,
      workerData,
      stdout: true,
      stdin: true
    }
  );
}
