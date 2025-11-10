import { it, describe, before, beforeEach, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  compareEquivalency,
  maybeAddRelativePath,
  shouldWatch,
  PATHS_TO_WATCH,
  PATHS_TO_IGNORE,
  unwatchPath,
  watchPath
} from '../tooling/watcher/watcher.js';

import { watcher } from '../tooling/hot-reload.js';

describe('watcher', async () => {
  let initial_PTI;
  before(() => {
    initial_PTI = [...PATHS_TO_IGNORE];
  });
  beforeEach(() => {
    PATHS_TO_IGNORE.splice(0, PATHS_TO_IGNORE.length);
  });
  afterEach(() => {
    PATHS_TO_IGNORE.splice(0, PATHS_TO_IGNORE.length, ...initial_PTI);
  });
  after(() => {
    watcher.close();
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

  it('maybeAddRelativePath', () => {
    assert.deepEqual(PATHS_TO_IGNORE, []);
    maybeAddRelativePath(PATHS_TO_IGNORE, '/node_modules/');
    assert.deepEqual(PATHS_TO_IGNORE, ['/node_modules/']);
    maybeAddRelativePath(PATHS_TO_IGNORE, 'node_modules');
    assert.deepEqual(PATHS_TO_IGNORE, ['node_modules']);
    maybeAddRelativePath(PATHS_TO_IGNORE, '/node_modules/foo/bar');
    assert.deepEqual(PATHS_TO_IGNORE, ['node_modules']);
    maybeAddRelativePath(PATHS_TO_IGNORE, 'a/node_modules');
    assert.deepEqual(PATHS_TO_IGNORE, ['node_modules']);
    maybeAddRelativePath(PATHS_TO_IGNORE, '/a/node_modules/b/');
    assert.deepEqual(PATHS_TO_IGNORE, ['node_modules']);

    maybeAddRelativePath(PATHS_TO_IGNORE, '/a/b/');
    assert.deepEqual(PATHS_TO_IGNORE, ['node_modules', '/a/b/']);
  });

  it('shouldWatch', () => {
    assert(shouldWatch('node_modules/foo/bar'));
    unwatchPath('/node_modules/');
    assert(!shouldWatch('/node_modules/foo/bar'));
    assert(shouldWatch('example/node_modules/foo/bar'));
    unwatchPath('node_modules');
    assert(!shouldWatch('example/node_modules/foo/bar'));
    watchPath('/node_modules/foo');
    assert(shouldWatch('/node_modules/foo/bar'));
  });
});
