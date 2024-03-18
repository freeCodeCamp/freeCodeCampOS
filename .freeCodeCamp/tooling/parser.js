import { lexer } from 'marked';

/**
 * A class that  takes a Markdown string, uses the markedjs package to tokenize it, and provides convenience methods to access different tokens in the token tree
 */
export class CoffeeDown {
  constructor(tokensOrMarkdown, caller = null) {
    this.caller = caller;
    if (typeof tokensOrMarkdown == 'string') {
      this.tokens = lexer(tokensOrMarkdown);
    } else if (Array.isArray(tokensOrMarkdown)) {
      this.tokens = tokensOrMarkdown;
    } else {
      this.tokens = [tokensOrMarkdown];
    }
  }

  getProjectMeta() {
    // There should only be one H1 in the project which is the title
    const title = this.tokens.find(
      t => t.type === 'heading' && t.depth === 1
    ).text;

    const firstLessonMarker = this.tokens.findIndex(t => {
      return (
        t.type === 'heading' &&
        t.depth === 2 &&
        Number.isInteger(parseFloat(t.text))
      );
    });
    const tokensBeforeFirstLesson = this.tokens.slice(0, firstLessonMarker);

    // The first paragraph before the lesson marker should be the description
    const description = tokensBeforeFirstLesson.find(
      t => t.type === 'paragraph'
    ).text;

    // First codeblock before the lesson marker is extra meta within a JSON codeblock
    const jsonMeta =
      tokensBeforeFirstLesson.find(t => t.type === 'code' && t.lang === 'json')
        ?.text ?? '{}';
    const meta = JSON.parse(jsonMeta);

    // All H2 elements with an integer for text are lesson headings
    const numberOfLessons = this.tokens.filter(
      t =>
        t.type === 'heading' &&
        t.depth === 2 &&
        Number.isInteger(parseFloat(t.text))
    ).length;
    return { title, description, numberOfLessons, ...meta };
  }

  getHeading(depth, text, caller) {
    if (this.caller !== 'getLesson') {
      throw new Error(
        `${caller} must be called on getLesson. Called on ${this.caller}`
      );
    }
    const tokens = [];
    let take = false;
    for (const token of this.tokens) {
      if (
        token.type === 'heading' &&
        token.depth <= depth &&
        TOKENS.some(t => t.marker === token.text)
      ) {
        take = false;
      }
      if (take) {
        tokens.push(token);
      }
      if (
        token.type === 'heading' &&
        token.depth === depth &&
        token.text === text
      ) {
        take = true;
      }
    }
    return new CoffeeDown(tokens, caller);
  }

  getLesson(lessonNumber) {
    const lesson = this.#getLesson(lessonNumber);
    const description = lesson.getDescription().markdown;
    const tests = lesson.getTests().tests;
    const seed = lesson.getSeed().seed;
    const isForce = lesson
      .getSeed()
      .tokens.some(
        t => t.type === 'heading' && t.depth === 4 && t.text === '--force--'
      );
    const hints = lesson.getHints().hints;
    const beforeAll = lesson.getBeforeAll().code;
    const afterAll = lesson.getAfterAll().code;
    const beforeEach = lesson.getBeforeEach().code;
    const afterEach = lesson.getAfterEach().code;

    const meta = lesson.getMeta();
    return {
      meta,
      description,
      tests,
      seed,
      hints,
      beforeAll,
      afterAll,
      beforeEach,
      afterEach,
      isForce
    };
  }

  #getLesson(lessonNumber) {
    const tokens = [];
    let take = false;
    for (const token of this.tokens) {
      if (
        token.type === 'heading' &&
        token.depth === 2 &&
        (parseInt(token.text, 10) === lessonNumber + 1 ||
          token.text === '--fcc-end--')
      ) {
        take = false;
      }
      if (take) {
        tokens.push(token);
      }
      if (token.type === 'heading' && token.depth === 2) {
        if (parseInt(token.text, 10) === lessonNumber) {
          take = true;
        }
      }
    }
    return new CoffeeDown(tokens, 'getLesson');
  }

  getDescription() {
    return this.getHeading(3, '--description--', 'getDescription');
  }

  getTests() {
    return this.getHeading(3, '--tests--', 'getTests');
  }

  getSeed() {
    return this.getHeading(3, '--seed--', 'getSeed');
  }

  getHints() {
    return this.getHeading(3, '--hints--', 'getHints');
  }

  getBeforeAll() {
    return this.getHeading(3, '--before-all--', 'getBeforeAll');
  }

  getAfterAll() {
    return this.getHeading(3, '--after-all--', 'getAfterAll');
  }

  getBeforeEach() {
    return this.getHeading(3, '--before-each--', 'getBeforeEach');
  }

  getAfterEach() {
    return this.getHeading(3, '--after-each--', 'getAfterEach');
  }

  getMeta() {
    const firstHeadingMarker = this.tokens.findIndex(t => {
      return t.type === 'heading' && t.depth === 3;
    });
    const tokensBeforeFirstHeading = this.tokens.slice(0, firstHeadingMarker);
    const jsonMeta =
      tokensBeforeFirstHeading.find(t => t.type === 'code' && t.lang === 'json')
        ?.text ?? '{}';
    return JSON.parse(jsonMeta);
  }

  /**
   * Get first code block text from tokens
   *
   * Meant to be used with `getBeforeAll`, `getAfterAll`, `getBeforeEach`, and `getAfterEach`
   */
  get code() {
    const callers = [
      'getBeforeAll',
      'getAfterAll',
      'getBeforeEach',
      'getAfterEach'
    ];
    if (!callers.includes(this.caller)) {
      throw new Error(
        `code must be called on "${callers.join(', ')}". Called on ${
          this.caller
        }`
      );
    }
    return this.tokens.find(t => t.type === 'code')?.text;
  }

  get seed() {
    if (this.caller !== 'getSeed') {
      throw new Error(
        `seedToIterator must be called on getSeed. Called on ${this.caller}`
      );
    }
    return seedToIterator(this.tokens);
  }

  get tests() {
    if (this.caller !== 'getTests') {
      throw new Error(
        `textsAndTests must be called on getTests. Called on ${this.caller}`
      );
    }
    const textTokens = [];
    const testTokens = [];
    for (const token of this.tokens) {
      if (token.type === 'paragraph') {
        textTokens.push(token);
      }
      if (token.type === 'code') {
        testTokens.push(token);
      }
    }
    const texts = textTokens.map(t => t.text);
    const tests = testTokens.map(t => t.text);
    return texts.map((text, i) => [text, tests[i]]);
  }

  get hints() {
    if (this.caller !== 'getHints') {
      throw new Error(
        `hints must be called on getHints. Called on ${this.caller}`
      );
    }
    const hintTokens = [[]];
    let currentHint = 0;
    for (const token of this.tokens) {
      if (token.type === 'heading' && token.depth === 4) {
        if (token.text != currentHint) {
          currentHint = token.text;
          hintTokens[currentHint] = [];
        }
      } else {
        hintTokens[currentHint].push(token);
      }
    }
    const hints = hintTokens
      .map(t => t.map(t => t.raw).join(''))
      .filter(Boolean);
    return hints;
  }

  get markdown() {
    return this.tokens.map(t => t.raw).join('');
  }

  get text() {
    return this.tokens.map(t => t.text).join('');
  }
}

function seedToIterator(tokens) {
  const seed = [];
  const sectionTokens = {};
  let currentSection = 0;
  for (const token of tokens) {
    if (
      token.type === 'heading' &&
      token.depth === 4 &&
      token.text !== '--force--'
    ) {
      if (token.text !== currentSection) {
        currentSection = token.text;
        sectionTokens[currentSection] = {};
      }
    } else if (token.type === 'code') {
      sectionTokens[currentSection] = token;
    }
  }
  for (const [filePath, { text }] of Object.entries(sectionTokens)) {
    if (filePath === '--cmd--') {
      seed.push(text);
    } else {
      seed.push({
        filePath: filePath.slice(3, filePath.length - 3),
        fileSeed: text
      });
    }
  }
  return seed;
}

import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import Prism from 'prismjs';
import loadLanguages from 'prismjs/components/index.js';

loadLanguages([
  'javascript',
  'css',
  'html',
  'json',
  'markdown',
  'sql',
  'rust',
  'typescript',
  'jsx',
  'c',
  'csharp',
  'cpp',
  'dotnet',
  'python',
  'pug',
  'handlebars'
]);

marked.use(
  markedHighlight({
    highlight: (code, lang) => {
      if (Prism.languages[lang]) {
        return Prism.highlight(code, Prism.languages[lang], String(lang));
      } else {
        return code;
      }
    }
  })
);

export function parseMarkdown(markdown) {
  return marked.parse(markdown, { gfm: true });
}

const TOKENS = [
  {
    marker: /\d+/,
    depth: 2
  },
  {
    marker: '--fcc-end--',
    depth: 2
  },
  {
    marker: '--description--',
    depth: 3
  },
  {
    marker: '--tests--',
    depth: 3
  },
  {
    marker: '--seed--',
    depth: 3
  },
  {
    marker: '--hints--',
    depth: 3
  },
  {
    marker: '--before-all--',
    depth: 3
  },
  {
    marker: '--after-all--',
    depth: 3
  },
  {
    marker: '--before-each--',
    depth: 3
  },
  {
    marker: '--after-each--',
    depth: 3
  },
  {
    marker: '--cmd--',
    depth: 4
  },
  {
    marker: /(?<=--)[^"]+(?="--)/,
    depth: 4
  },
  {
    marker: '--force--',
    depth: 4
  }
];
