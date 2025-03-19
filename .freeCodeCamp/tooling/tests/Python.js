import { parentPort, workerData } from 'node:worker_threads';
import { runPython } from './utils.js';

const { beforeEach = '' } = workerData;

parentPort.on('message', async ({ testCode, testId }) => {
  let passed = false;
  let error = null;
  try {
    const _out = await runPython(`
${beforeEach}

${testCode}
`);
    passed = true;
  } catch (e) {
    error = e;
  }
  parentPort.postMessage({ passed, testId, error });
});
