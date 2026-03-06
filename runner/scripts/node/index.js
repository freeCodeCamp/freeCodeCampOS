import { readFile, writeFile } from 'node:fs/promises';
import { Worker } from 'node:worker_threads';
import path from 'node:path';

const MANIFEST_PATH = process.env.MANIFEST_PATH;
const TEST_WORKER_PATH = process.env.TEST_WORKER_PATH;

async function runTest(test, project, hooks, helpersPath) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(TEST_WORKER_PATH, {
      name: `worker-${test.id}`,
      workerData: { before_each: hooks.before_each, project, helpersPath }
    });

    worker.on('message', async message => {
      const { passed, id, error } = message;
      test.state = passed ? 'PASSED' : 'FAILED';
      
      if (error) {
        test.state = 'FAILED';
        test.error = error;
      }

      await writeFile(test.path, JSON.stringify(test), 'utf-8');

      if (error && error.type !== 'AssertionError') {
        console.error(`Test #${id}:`, error);
      }

      try {
        if (hooks.after_each) {
          await eval(`(async () => { ${hooks.after_each} })();`);
        }
      } catch (e) {
        console.error('--after-each-- hook failed:', e);
      }
      resolve();
    });

    worker.on('error', reject);
    worker.on('exit', code => {
      if (code !== 0 && !worker.exitCode)
        reject(new Error(`Worker ${test.id} exited with code ${code}`));
    });

    worker.postMessage({ code: test.code, id: test.id });
  });
}

async function main() {
  const MANIFEST = JSON.parse(await readFile(MANIFEST_PATH, 'utf-8'));
  const PROJECT = JSON.parse(await readFile(MANIFEST.project_path, 'utf-8'));
  const HOOKS = JSON.parse(await readFile(MANIFEST.hooks_path, 'utf-8'));

  const { before_all, after_all } = HOOKS;

  if (before_all) {
    try {
      await eval(`(async () => {${before_all}})()`);
    } catch (e) {
      console.error('--before-all-- hook failed:', e);
    }
  }

  const tests = [];
  for (const testPath of MANIFEST.test_paths) {
    const test = JSON.parse(await readFile(testPath, 'utf-8'));
    test.path = testPath;
    await writeFile(testPath, JSON.stringify(test), 'utf-8');
    tests.push(test);
  }

  if (PROJECT.blocking_tests) {
    for (const test of tests) {
      await runTest(test, PROJECT, HOOKS, MANIFEST.helpers_path);
    }
  } else {
    await Promise.all(
      tests.map(test => runTest(test, PROJECT, HOOKS, MANIFEST.helpers_path))
    );
  }

  if (after_all) {
    try {
      await eval(`(async () => {${after_all}})()`);
    } catch (e) {
      console.error('--after-all-- hook failed:', e);
    }
  }
}

main()
  .then(() => {
    console.log('Runner finished successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Runner failed:', err);
    process.exit(1);
  });
