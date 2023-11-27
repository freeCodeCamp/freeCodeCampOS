import { AssertionError } from 'chai';

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
      const worker = new Worker('./test-worker.js', {
        name: 'blocking-worker'
      });

      // Kill worker if client says, or test timesout
      ws.on('message', async data => {
        const { event, data } = JSON.parse(message);
        if (event === 'cancel-tests') {
          worker.terminate();
        }
      });
      // When result is received back from worker, update the client state
      worker.on('message', message => {
        const { passed, testId, testText, error } = message;
        if (error) {
          if (!(error instanceof AssertionError)) {
            logover.error(`Test #${testId}:`, error);
            updateError(ws, error);
          }

          const consoleError = {
            ...testsState[testId],
            error
          };
          updateConsole(ws, consoleError);
        }
        updateTest(ws, { passed, testId, testText, isLoading: false });
      });

      for (let i = 0; i < textsAndTestsArr.length; i++) {
        const [text, testCode] = textsAndTestsArr[i];
        testsState[i].isLoading = true;
        updateTest(ws, testsState[i]);

        if (beforeEach) {
          try {
            logover.debug('Starting: --before-each-- hook');
            const _beforeEachOut = await eval(
              `(async () => { ${beforeEach} })();`
            );
            logover.debug('Finished: --before-each-- hook');
          } catch (e) {
            logover.error('--before-each-- hook failed to run:');
            logover.error(e);
          }
        }
        worker.postMessage({ testCode, testId: i });
      }
    } else {
      // Run tests in parallel, and in own worker threads
      for (let i = 0; i < textsAndTestsArr.length; i++) {
        const [text, testCode] = textsAndTestsArr[i];
        testsState[i].isLoading = true;
        updateTest(ws, testsState[i]);

        if (beforeEach) {
          try {
            logover.debug('Starting: --before-each-- hook');
            const _beforeEachOut = await eval(
              `(async () => { ${beforeEach} })();`
            );
            logover.debug('Finished: --before-each-- hook');
          } catch (e) {
            logover.error('--before-each-- hook failed to run:');
            logover.error(e);
          }
        }

        const worker = new Worker('./test-worker.js', {
          name: `worker-${i}`
        });

        // Kill worker if client says, or test timesout
        ws.on('message', async data => {
          const { event, data } = JSON.parse(message);
          if (event === 'cancel-tests') {
            worker.terminate();
          }
        });
        // When result is received back from worker, update the client state
        worker.on('message', message => {
          const { passed, testId, error } = message;
          if (error) {
            if (!(error instanceof AssertionError)) {
              logover.error(`Test #${testId}:`, error);
              updateError(ws, error);
            }

            const consoleError = {
              ...testsState[testId],
              error
            };
            updateConsole(ws, consoleError);
          }
          updateTest(ws, {
            passed,
            testId,
            testText: testsState[testId].testText
          });
        });

        worker.postMessage({ testCode, testId: i });
      }
    }

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
  } catch (e) {}
}

async function testPassedCallback(testId) {
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
      await runLesson(ws, projectDashedName);
    }
  } else {
    updateHints(ws, hints);
  }
}
