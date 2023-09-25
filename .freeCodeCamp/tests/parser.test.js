import {
  getProjectTitle,
  getLessonFromFile,
  getLessonDescription,
  getLessonTextsAndTests,
  getLessonSeed,
  getBeforeAll,
  getBeforeEach,
  getCommands,
  getFilesWithSeed,
  isForceFlag,
  extractStringFromCode,
  getLessonHints
} from '../tooling/parser.js';
import { assert } from 'chai';
import { Logger } from 'logover';

const logover = new Logger({
  debug: '\x1b[33m[parser.test]\x1b[0m',
  error: '\x1b[31m[parser.test]\x1b[0m',
  level: 'debug',
  timestamp: null
});

const EXPECTED_PATH = '.freeCodeCamp/tests/fixtures/expected-format.md';
const POOR_PATH = '.freeCodeCamp/tests/fixtures/valid-poor-format.md';

try {
  const projectTitle = await getProjectTitle(EXPECTED_PATH);
  assert.deepEqual(projectTitle, 'Title - Project');
  const lesson = await getLessonFromFile(EXPECTED_PATH, 0);

  const lessonDescription = getLessonDescription(lesson);
  assert.equal(
    lessonDescription,
    '\n\nSome description.\n\nMaybe some code:\n\n```js\nconst a = 1;\n// A comment at the end?\n```\n\n'
  );

  const lessonTextsAndTests = getLessonTextsAndTests(lesson);

  assert.equal(lessonTextsAndTests[0][0], 'Test text with many words.');
  assert.equal(
    lessonTextsAndTests[0][1],
    "// First test code\nconst a = 'test';\n"
  );
  assert.equal(
    lessonTextsAndTests[1][0],
    'Second test text with `inline-code`.'
  );
  assert.equal(
    lessonTextsAndTests[1][1],
    "const a = 'test2';\n// Second test code;\n"
  );

  const lessonSeed = getLessonSeed(lesson);

  const lessonHints = getLessonHints(lesson);

  assert.equal(lessonHints.length, 2);
  assert.equal(lessonHints.at(0), 'Hint 1.');
  assert.equal(
    lessonHints.at(1),
    'Hint 2, with multiple lines.\n\n```js\nconst a = 0;\n```'
  );

  const beforeAll = getBeforeAll(lesson);
  assert.equal(beforeAll, "global.__beforeAll = 'before-all';\n");

  const beforeEach = getBeforeEach(lesson);
  assert.equal(beforeEach, "global.__beforeEach = 'before-each';\n");

  const commands = getCommands(lessonSeed);

  const filesWithSeed = getFilesWithSeed(lessonSeed);

  const isForce = isForceFlag(lessonSeed);
} catch (e) {
  throw logover.error(e);
}

// -----------------
// VALID POOR FORMAT
// -----------------

try {
  const projectTitle = await getProjectTitle(POOR_PATH);
  assert.deepEqual(projectTitle, 'Title - Project');
  const lesson = await getLessonFromFile(POOR_PATH, 0);

  const lessonDescription = getLessonDescription(lesson);
  assert.equal(
    lessonDescription,
    '\nThis description has no spaces between the heading.\n```rs\n\n//Same goes for this code.\nlet mut a = 1;\n// comment\n```\n'
  );

  const lessonTextsAndTests = getLessonTextsAndTests(lesson);

  assert.equal(lessonTextsAndTests[0][0], 'Test text at top.');
  assert.equal(
    lessonTextsAndTests[0][1],
    '// First test no space\n// No code?\n\n'
  );
  assert.equal(
    lessonTextsAndTests[1][0],
    'Second test text with `inline-code`.'
  );
  assert.equal(
    lessonTextsAndTests[1][1],
    "// Too many spaces?\nconst a = 'test2';\n"
  );

  const lessonSeed = getLessonSeed(lesson);

  const beforeAll = getBeforeAll(lesson);
  assert.equal(beforeAll, "global.__beforeAll = 'before-all';\n");
} catch (e) {
  throw logover.error(e);
}

try {
  let stringFromCode = extractStringFromCode(`\`\`\`js
const a = 1;
\`\`\``);
  assert.equal(stringFromCode, 'const a = 1;\n');
  stringFromCode = extractStringFromCode(`\`\`\`js
const a = 1;
// comment
\`\`\`
`);
  assert.equal(stringFromCode, 'const a = 1;\n// comment\n');
} catch (e) {
  throw logover.error(e);
}

logover.debug('All tests passed! 🎉');
