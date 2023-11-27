import { parentPort } from 'node:worker_threads';
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
import { Worker } from 'node:worker_threads';

let __helpers = __helpers_c;

// Update __helpers with dynamic utils:
const helpers = freeCodeCampConfig.tooling?.['helpers'];
if (helpers) {
  const dynamicHelpers = await import(join(ROOT, helpers));
  __helpers = { ...__helpers_c, ...dynamicHelpers };
}

// Needs testString to run eval
// Needs globals to run eval
// Sends back: { passed, testId, error }

parentPort.on('message', async ({ testCode, testId }) => {
  const _testOutput = await eval(`(async () => {${testCode}})();`);
  return { passed, testId, error };
});
