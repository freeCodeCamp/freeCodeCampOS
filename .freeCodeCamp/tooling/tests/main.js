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

/**
 * Run the given project's tests
 * @param {WebSocket} ws
 * @param {string} projectDashedName
 */
export async function runTests(ws, projectDashedName) {
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
    testsState = textsAndTestsArr.reduce((acc, curr, i) => {
      return [
        ...acc,
        {
          passed: false,
          testText: curr[0],
          testId: i,
          isLoading: !project.blockingTests
        }
      ];
    }, []);

    updateTests(ws, testsState);
    updateConsole(ws, '');

    // Create one worker for each test if non-blocking.
    // TODO: See if holding pool of workers is better.
    if (project.blockingTests) {
      const worker = new Worker(
        join(ROOT, '.freeCodeCamp/tooling/tests', 'test-worker.js'),
        {
          name: 'blocking-worker',
          workerData: {
            beforeEach
          }
        }
      );

      // Kill worker if client says, or test timesout
      ws.on('message', async message => {
        const { event, data } = JSON.parse(message);
        if (event === 'cancel-tests') {
          worker.terminate();
          testsState.forEach(test => {
            test.isLoading = false;
            test.passed = false;
          });
          updateTests(ws, testsState);
          updateConsole(ws, '');
          await checkTestsCallback({
            ws,
            project,
            hints,
            lessonNumber,
            testsState,
            afterAll
          });
        }
      });
      // When result is received back from worker, update the client state
      worker.on('message', workerMessage);

      for (let i = 0; i < textsAndTestsArr.length; i++) {
        const [text, testCode] = textsAndTestsArr[i];
        testsState[i].isLoading = true;
        updateTest(ws, testsState[i]);

        worker.on('exit', async exitCode => {
          // If exit code == 1, worker was likely terminated
          // Let client know test was cancelled
          if (exitCode === 1) {
            testsState[i].isLoading = false;
            testsState[i].passed = false;
            updateTests(ws, testsState);

            const consoleError = {
              ...testsState[i],
              error
            };
            updateConsole(ws, consoleError);
          }
          // Run afterEach even if tests are cancelled
          try {
            const _afterEachOut = await eval(
              `(async () => { ${afterEach} })();`
            );
          } catch (e) {
            logover.error('--after-each-- hook failed to run:');
            logover.error(e);
          }
        });

        worker.postMessage({ testCode, testId: i });
      }
    } else {
      // Run tests in parallel, and in own worker threads
      for (let i = 0; i < textsAndTestsArr.length; i++) {
        const [_text, testCode] = textsAndTestsArr[i];
        testsState[i].isLoading = true;
        updateTest(ws, testsState[i]);

        const worker = new Worker(
          join(ROOT, '.freeCodeCamp/tooling/tests', 'test-worker.js'),
          {
            name: `worker-${i}`,
            workerData: {
              beforeEach
            }
          }
        );

        // Kill worker if client says, or test timesout
        ws.on('message', async message => {
          const { event, data } = JSON.parse(message);
          if (event === 'cancel-tests') {
            worker.terminate();
            testsState[i].isLoading = false;
            testsState[i].passed = false;
            updateTests(ws, testsState);
            updateConsole(ws, '');

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
        });
        // When result is received back from worker, update the client state
        worker.on('message', workerMessage);
        worker.on('exit', async exitCode => {
          // If exit code == 1, worker was likely terminated
          // Let client know test was cancelled
          if (exitCode === 1) {
            testsState[i].isLoading = false;
            testsState[i].passed = false;
            updateTests(ws, testsState);

            const consoleError = {
              ...testsState[i],
              error
            };
            updateConsole(ws, consoleError);
          }
          // Run afterEach even if tests are cancelled
          try {
            const _afterEachOut = await eval(
              `(async () => { ${afterEach} })();`
            );
          } catch (e) {
            logover.error('--after-each-- hook failed to run:');
            logover.error(e);
          }
        });

        worker.postMessage({ testCode, testId: i });
      }
    }

    async function workerMessage(message) {
      const { passed, testId, error } = message;
      testsState[testId].isLoading = false;
      testsState[testId].passed = passed;
      if (error) {
        if (!(error instanceof AssertionError)) {
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
    if (project.isIntegrated || lessonNumber === project.numberOfLessons - 1) {
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
  }
}
