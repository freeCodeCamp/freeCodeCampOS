import { parentPort, workerData } from 'node:worker_threads';
import { assert, AssertionError, expect, config as chaiConfig } from 'chai';
import { join } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';

const { before_each = '', project, helpersPath } = workerData;

// Inject globals
global.ROOT = process.cwd();

parentPort.on('message', async ({ code, id }) => {
  let passed = false;
  let error = null;
  
  if (helpersPath) {
    try {
      const helpers = await import(`file://${helpersPath}`);
      global.__helpers = helpers.default || helpers;
    } catch (e) {
      console.error(`Failed to load helpers from ${helpersPath}:`, e);
    }
  }

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
