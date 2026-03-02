import { parentPort, workerData } from 'node:worker_threads';
import { assert, AssertionError, expect, config as chaiConfig } from 'chai';

const { before_each = '', project } = workerData;

parentPort.on('message', async ({ code, id }) => {
  let passed = false;
  let error = null;
  try {
    await eval(`(async () => {
      ${before_each || ''}
      ${code}
})();`);
    passed = true;
  } catch (e) {
    error = {
      message: e?.message || String(e),
      stack: e?.stack,
      type: e?.name || (e instanceof AssertionError ? 'AssertionError' : 'Error')
    };
    // Ensure it's correctly identified as AssertionError if it is one
    if (e instanceof AssertionError) {
      error.type = 'AssertionError';
    }
    // Copy other properties
    Object.getOwnPropertyNames(e).forEach(key => {
      if (!error[key]) {
        error[key] = e[key];
      }
    });
  }
  parentPort.postMessage({ passed, id, error });
});
