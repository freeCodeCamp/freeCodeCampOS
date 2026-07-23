/// Tests can be run from `self/`
/// node ../.freeCodeCamp/tests/state-race.test.js
import { assert } from 'chai';
import { Logger } from 'logover';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import {
  getState,
  setState,
  ROOT,
  freeCodeCampConfig
} from '../tooling/env.js';

const logover = new Logger({
  debug: '\x1b[33m[state-race.test]\x1b[0m',
  error: '\x1b[31m[state-race.test]\x1b[0m',
  level: 'debug',
  timestamp: null
});

const stateFilePath = join(ROOT, freeCodeCampConfig.config['state.json']);
const originalState = await readFile(stateFilePath, 'utf-8');

try {
  const COUNT = 50;

  // Fire many concurrent writes (each setting a distinct key) interleaved
  // with concurrent reads, mirroring the hot-reload burst + seedLesson race.
  const writes = Array.from({ length: COUNT }, (_, i) =>
    setState({ [`raceKey${i}`]: i })
  );
  const reads = Array.from({ length: COUNT }, () => getState());

  await Promise.all([...writes, ...reads]);

  // No lost updates: every one of the concurrent writes' keys must survive.
  const finalState = await getState();
  for (let i = 0; i < COUNT; i++) {
    assert.deepEqual(finalState[`raceKey${i}`], i);
  }
} finally {
  await writeFile(stateFilePath, originalState);
}

logover.debug('All tests passed! 🎉');
