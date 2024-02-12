/// Tests can be run from `self/`
import { assert } from 'chai';
import { Logger } from 'logover';
import { pluginEvents } from '../plugin/index.js';

const logover = new Logger({
  debug: '\x1b[33m[parser.test]\x1b[0m',
  error: '\x1b[31m[parser.test]\x1b[0m',
  level: 'debug',
  timestamp: null
});

try {
  const {
    title,
    description: projectDescription,
    numberOfLessons
  } = await pluginEvents.getProjectMeta('build-x-using-y');
  const {
    description: lessonDescription,
    tests,
    hints,
    seed,
    isForce,
    beforeAll,
    beforeEach,
    afterAll,
    afterEach
  } = await pluginEvents.getLesson('build-x-using-y', 0);

  assert.deepEqual(title, 'Build X Using Y');
  assert.deepEqual(
    projectDescription,
    'In this course, you will build x using y.'
  );
  assert.deepEqual(numberOfLessons, 1);

  assert.deepEqual(
    lessonDescription,
    `Some description here.

\`\`\`rust
fn main() {
    println!("Hello, world!");
}
\`\`\`

Here is an image:

<img src="../../images/fcc_primary_large.png" width="300px" />

`
  );

  const expectedTests = [
    [
      'First test using Chai.js `assert`.',
      '// 0\n// Timeout for 3 seconds\nawait new Promise(resolve => setTimeout(resolve, 3000));\nassert.equal(true, true);'
    ],
    [
      'Second test using global variables passed from `before` hook.',
      "// 1\nawait new Promise(resolve => setTimeout(resolve, 4000));\nassert.equal(__projectLoc, 'example global variable for tests');"
    ],
    [
      'Dynamic helpers should be imported.',
      "// 2\nawait new Promise(resolve => setTimeout(resolve, 1000));\nassert.equal(__helpers.testDynamicHelper(), 'Helper success!');"
    ]
  ];

  for (const [i, [testText, testCode]] of tests.entries()) {
    assert.deepEqual(testText, expectedTests[i][0]);
    assert.deepEqual(testCode, expectedTests[i][1]);
  }

  const expectedHints = [
    'Inline hint with `some` code `blocks`.\n\n',
    'Multi-line hint with:\n\n```js\nconst code_block = true;\n```\n\n'
  ];

  for (const [i, hint] of hints.entries()) {
    assert.deepEqual(hint, expectedHints[i]);
  }

  const expectedSeed = [
    {
      filePath: 'build-x-using-y/readme.md',
      fileSeed: '# Build X Using Y\n\nIn this course\n\n## 0\n\nHello'
    },
    'npm install'
  ];

  let i = 0;
  for (const s of seed) {
    assert.deepEqual(s, expectedSeed[i]);
    i++;
  }
  assert.deepEqual(i, 2);

  assert.deepEqual(isForce, true);

  assert.deepEqual(
    beforeEach,
    "await new Promise(resolve => setTimeout(resolve, 1000));\nconst __projectLoc = 'example global variable for tests';"
  );
  assert.deepEqual(
    afterEach,
    "await new Promise(resolve => setTimeout(resolve, 1000));\nlogover.info('after each');"
  );
  assert.deepEqual(
    beforeAll,
    "await new Promise(resolve => setTimeout(resolve, 1000));\nlogover.info('before all');"
  );
  assert.deepEqual(
    afterAll,
    "await new Promise(resolve => setTimeout(resolve, 1000));\nlogover.info('after all');"
  );
} catch (e) {
  throw logover.error(e);
}

logover.debug('All tests passed! 🎉');
