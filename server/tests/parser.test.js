/// Tests can be run from `self/`
/// node ../.freeCodeCamp/tests/parser.test.js
import { assert } from 'chai';
import { Logger } from 'logover';
import { pluginEvents } from '../plugin/index.js';
import { defaultProjectMeta } from '../tooling/env.js';

const logover = new Logger({
  debug: '\x1b[33m[parser.test]\x1b[0m',
  error: '\x1b[31m[parser.test]\x1b[0m',
  level: 'debug',
  timestamp: null
});

try {
  const project = await pluginEvents.getProjectMeta('one-of-all');
  const lesson = await pluginEvents.getLesson(project.dashedName, 0);

  const expectedProject = {
    blockingTests: true,
    breakOnFailure: true,
    dashedName: 'one-of-all',
    description:
      '<p>This project uses all of the features possible for a project.</p>',
    id: 6,
    isIntegrated: false,
    isResetEnabled: true,
    isPublic: true,
    lastKnownLessonWithHash: 0,
    numberOfLessons: 1,
    runTestsOnWatch: true,
    seedEveryLesson: true,
    tags: ['TEST'],
    testPollingRate: 333,
    title: 'One of All',
    useGitBuildOnProduction: false
  };

  // This ensures all defaultProjectMeta fields are present in the expected
  for (const key of Object.keys(defaultProjectMeta)) {
    assert.property(expectedProject, key);
  }

  for (const [key, value] of Object.entries(expectedProject)) {
    assert.deepEqual(project[key], value);
  }

  const expectedLesson = {
    meta: { watch: ['one-of-all/*'] },
    description: '<p>TODO:</p>',
    tests: [
      [
        '<p>Test <code>1</code>.</p>',
        'await new Promise(resolve => setTimeout(resolve, 1000));\n' +
          'assert.equal(true, false);'
      ]
    ],
    hints: [],
    seed: [],
    beforeAll: undefined,
    afterAll: undefined,
    beforeEach: undefined,
    afterEach: undefined,
    isForce: false
  };

  for (const [key, value] of Object.entries(expectedLesson)) {
    assert.deepEqual(lesson[key], value);
  }

  assert.deepEqual(lesson.meta, {
    watch: ['one-of-all/*']
  });
} catch (e) {
  throw logover.error(e);
}

logover.debug('All tests passed! 🎉');
