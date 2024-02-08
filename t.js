import { Renderer, Tokenizer, lexer, marked } from 'marked';
import {
  TokenTwister,
  getLessonFromFile,
  getProjectDescription
} from './parser.js';
import { readFile } from 'fs/promises';

const options = {
  async: false,
  breaks: false,
  gfm: true,
  pedantic: false,
  renderer: new Renderer(),
  silent: false,
  tokenizer: new Tokenizer(),
  walkTokens: null
};

// const lexr = new marked.Lexer(options);

// const tokens = lexr.lex(markdown);

// console.log(tokens);
// const lex = lexer(markdown);
// console.log(JSON.stringify(lex, null, 2));

const FILE = './a.md';

const markdown = await readFile(FILE, 'utf8');

const tokenTwister = new TokenTwister(markdown);

// const projectTitle = tokenTwister.getHeading(1);
// console.log('-'.repeat(10), 'PROJECT TITLE', '-'.repeat(10));
// console.log(projectTitle.text);
// console.log('-'.repeat(10), 'PROJECT TITLE', '-'.repeat(10));
// const projectDescription = 'TODO';
// console.log('-'.repeat(10), 'PROJECT DESCRIPTION', '-'.repeat(10));
// console.log(projectDescription.markdown);
// console.log('-'.repeat(10), 'PROJECT DESCRIPTION', '-'.repeat(10));
const lesson_0 = tokenTwister.getLesson(0);
console.log('-'.repeat(10), 'LESSON 0', '-'.repeat(10));
console.log(lesson_0.markdown);
console.log('-'.repeat(10), 'LESSON 0', '-'.repeat(10));
// const description_0 = lesson_0.getDescription();
// console.log('-'.repeat(10), 'DESCRIPTION 0', '-'.repeat(10));
// console.log(description_0.markdown);
// console.log('-'.repeat(10), 'DESCRIPTION 0', '-'.repeat(10));
// const tests_0 = lesson_0.getTests();
// console.log(tests_0.tokens);
// console.log('-'.repeat(10), 'TESTS 0', '-'.repeat(10));
// console.log(tests_0.markdown);
// console.log('-'.repeat(10), 'TESTS 0', '-'.repeat(10));
// const texts_and_tests_0 = tests_0.textsAndTests;
// console.log(texts_and_tests_0);
const seed_0 = lesson_0.getSeed();
console.log('-'.repeat(10), 'SEED 0', '-'.repeat(10));
console.log(seed_0.markdown);
console.log('-'.repeat(10), 'SEED 0', '-'.repeat(10));
const hints_0 = lesson_0.getHints();
console.log('-'.repeat(10), 'HINTS 0', '-'.repeat(10));
console.log(hints_0.markdown);
console.log('-'.repeat(10), 'HINTS 0', '-'.repeat(10));
const lesson_1 = tokenTwister.getLesson(1);
console.log('-'.repeat(10), 'LESSON 1', '-'.repeat(10));
console.log(lesson_1.markdown);
console.log('-'.repeat(10), 'LESSON 1', '-'.repeat(10));
// const description_1 = lesson_1.getDescription();
// console.log('-'.repeat(10), 'DESCRIPTION 1', '-'.repeat(10));
// console.log(description_1.markdown);
// console.log('-'.repeat(10), 'DESCRIPTION 1', '-'.repeat(10));
// const tests_1 = lesson_1.getTests();
// console.log(tests_1.tokens);
// console.log('-'.repeat(10), 'TESTS 1', '-'.repeat(10));
// console.log(tests_1.markdown);
// console.log('-'.repeat(10), 'TESTS 1', '-'.repeat(10));
// const texts_and_tests_1 = tests_1.textsAndTests;
// console.log(texts_and_tests_1);
const seed_1 = lesson_1.getSeed();
console.log('-'.repeat(10), 'SEED 1', '-'.repeat(10));
console.log(seed_1.markdown);
console.log('-'.repeat(10), 'SEED 1', '-'.repeat(10));
console.log(seed_1);
console.log(seed_1.seedToIterator);
// const hints_1 = lesson_1.getHints();
// console.log('-'.repeat(10), 'HINTS 1', '-'.repeat(10));
// console.log(hints_1.markdown);
// console.log('-'.repeat(10), 'HINTS 1', '-'.repeat(10));
// const hints_markdown_1 = hints_1.hints;
// console.log(hints_markdown_1);
// const before_all_1 = lesson_1.getBeforeAll();
// console.log('-'.repeat(10), 'BEFORE ALL 1', '-'.repeat(10));
// console.log(before_all_1.markdown);
// console.log('-'.repeat(10), 'BEFORE ALL 1', '-'.repeat(10));
// const after_all_1 = lesson_1.getAfterAll();
// console.log('-'.repeat(10), 'AFTER ALL 1', '-'.repeat(10));
// console.log(after_all_1.markdown);
// console.log('-'.repeat(10), 'AFTER ALL 1', '-'.repeat(10));
// const before_each_1 = lesson_1.getBeforeEach();
// console.log('-'.repeat(10), 'BEFORE EACH 1', '-'.repeat(10));
// console.log(before_each_1.markdown);
// console.log('-'.repeat(10), 'BEFORE EACH 1', '-'.repeat(10));
// const after_each_1 = lesson_1.getAfterEach();
// console.log('-'.repeat(10), 'AFTER EACH 1', '-'.repeat(10));
// console.log(after_each_1.markdown);
// console.log('-'.repeat(10), 'AFTER EACH 1', '-'.repeat(10));
// console.log(before_all_1);
// console.log(before_all_1.code);
