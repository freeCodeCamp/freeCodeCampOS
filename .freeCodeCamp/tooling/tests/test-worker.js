import { parentPort } from 'node:worker_threads';
// These are used in the local scope of the `eval` in `runTests`
import { assert, AssertionError, expect, config as chaiConfig } from 'chai';
import __helpers_c from '../test-utils.js';
import { watcher } from '../hot-reload.js';

import { freeCodeCampConfig, ROOT } from '../env.js';
import { join } from 'path';
import { logover } from '../logger.js';

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
  let passed = false;
  let error = null;
  try {
    const _testOutput = await eval(`(async () => {${testCode}})();`);
    passed = true;
  } catch (e) {
    error = e;
  }
  parentPort.postMessage({ passed, testId, error });
});
