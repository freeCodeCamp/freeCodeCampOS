// These are used in the local scope of the `eval` in `runTests`
import { assert, AssertionError, expect, config as chaiConfig } from 'chai';
import __helpers_c from './test-utils.js';
import { watcher } from './hot-reload.js';

import {
  getLessonTextsAndTests,
  getLessonFromFile,
  getBeforeAll,
  getBeforeEach,
  getAfterAll,
  getLessonHints
} from './parser.js';

import {
  freeCodeCampConfig,
  getProjectConfig,
  getState,
  ROOT,
  setProjectConfig
} from './env.js';
import { runLesson } from './lesson.js';
import {
  toggleLoaderAnimation,
  updateTest,
  updateTests,
  updateConsole,
  updateHints,
  handleProjectFinish,
  resetBottomPanel
} from './client-socks.js';
import { join } from 'path';
import { logover } from './logger.js';

let __helpers = __helpers_c;

/**
 * Run the given project's tests
 * @param {WebSocket} ws
 * @param {string} projectDashedName
 */
export async function runTests(ws, projectDashedName) {
  // Update __helpers with dynamic utils:
  const helpers = freeCodeCampConfig.tooling?.['helpers'];
  if (helpers) {
    const dynamicHelpers = await import(join(ROOT, helpers));
    __helpers = { ...__helpers_c, ...dynamicHelpers };
  }
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
    const testPromises = textsAndTestsArr.map(([text, testCode], i) => {
      return async () => {
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
        try {
          const _testOutput = await eval(`(async () => {${testCode}})();`);
          testsState[i].passed = true;
          testsState[i].isLoading = false;
          updateTest(ws, testsState[i]);
        } catch (e) {
          if (!(e instanceof AssertionError)) {
            logover.error(`Test #${i}:`, e);
          }

          testsState[i].passed = false;
          testsState[i].isLoading = false;
          const consoleError = { ...testsState[i], error: e };

          updateConsole(ws, consoleError);
          updateTest(ws, testsState[i]);
          return Promise.reject(`- ${text}\n`);
        }
        return Promise.resolve();
      };
    });

    try {
      let passed = false;
      let results = [];
      if (project.blockingTests) {
        for (const testPromise of testPromises) {
          try {
            const val = await testPromise();
            results.push({ status: 'fulfilled', value: val });
          } catch (e) {
            results.push({ status: 'rejected', reason: e });
            if (project.breakOnFailure) {
              break;
            }
          }
        }
      } else {
        results = await Promise.allSettled(testPromises.map(p => p()));
      }
      passed = results.every(r => r.status === 'fulfilled');

      if (passed) {
        if (
          project.isIntegrated ||
          lessonNumber === project.numberOfLessons - 1
        ) {
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
    } catch (e) {
      // TODO: This should not ever run...
      updateHints(ws, hints);
    } finally {
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
  } catch (e) {
    logover.error('Test Error: ');
    logover.error(e);
  } finally {
    // updateTests(ws, testsState);
  }
}
