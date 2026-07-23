/// Tests can be run from `self/`
/// node ../.freeCodeCamp/tests/state-lock.test.js
import { assert } from 'chai';
import { Logger } from 'logover';
import { withLock } from '../tooling/env.js';

const logover = new Logger({
  debug: '\x1b[33m[state-lock.test]\x1b[0m',
  error: '\x1b[31m[state-lock.test]\x1b[0m',
  level: 'debug',
  timestamp: null
});

try {
  const log = [];

  const delayed = withLock('test-key', async () => {
    log.push('A-start');
    await new Promise(resolve => setTimeout(resolve, 50));
    log.push('A-end');
  });

  const fast = withLock('test-key', async () => {
    log.push('B-start');
    log.push('B-end');
  });

  await Promise.all([delayed, fast]);

  // B must never start before A finishes, regardless of A being slower.
  assert.deepEqual(log, ['A-start', 'A-end', 'B-start', 'B-end']);

  // A failing operation must not permanently wedge the queue.
  await withLock('test-key', async () => {
    throw new Error('boom');
  }).catch(() => {});

  const afterFailure = [];
  await withLock('test-key', async () => {
    afterFailure.push('ran');
  });

  assert.deepEqual(afterFailure, ['ran']);
} catch (e) {
  throw logover.error(e);
}

logover.debug('All tests passed! 🎉');
