import { it, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  compareEquivalency,
  maybeAddRelativePathToPTI
} from '../tooling/watcher/watcher.js';
import { PATHS_TO_IGNORE } from '../tooling/hot-reload.js';

describe('watcher', async () => {
  let initial_PTI;
  before(() => {
    initial_PTI = [...PATHS_TO_IGNORE];
    const TEST_PTI = ['/node_modules/'];
    PATHS_TO_IGNORE.splice(0, PATHS_TO_IGNORE.length, ...TEST_PTI);
  });
  after(() => {
    PATHS_TO_IGNORE.splice(0, PATHS_TO_IGNORE.length, ...initial_PTI);
  });

  it('compareEquivalency', () => {
    const pti = ['/a', 'b', '/c/'];
    const equivalent_paths = ['/a/1', '/a/b', '/c/1/2'];
    const unequivalent_paths = ['a/1', 'c', '/d'];

    pti.forEach((p, i) => {
      const ep = equivalent_paths[i];
      assert(compareEquivalency(p, ep), `Expected ${p} ~= ${ep}`);
      const up = unequivalent_paths[i];
      assert(!compareEquivalency(p, up), `Expected ${p} !~= ${up}`);
    });
  });

  it('maybeAddRelativePathToPTI', () => {
    assert.deepEqual(PATHS_TO_IGNORE, ['/node_modules/']);
    maybeAddRelativePathToPTI('node_modules');
    assert.deepEqual(PATHS_TO_IGNORE, ['node_modules']);
  });
});
