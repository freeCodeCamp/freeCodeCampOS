import { lexer } from 'marked';
import { isForceFlag } from './.freeCodeCamp/tooling/parser.js';

/**
 * A class that  takes a Markdown string, uses the markedjs package to tokenize it, and provides convenience methods to access different tokens in the token tree
 */
export class TokenTwister {
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
    return new TokenTwister(tokens, caller);
  }

  getWithinHeading(depth, text) {
    const tokens = [];
    let take = false;
    for (const token of this.tokens) {
      if (
        token.type === 'heading' &&
        token.depth === depth &&
        token.text === text
      ) {
        take = true;
      }
      if (
        token.type === 'heading' &&
        token?.depth <= depth &&
        token?.text !== text
      ) {
        take = false;
      }
      if (take) {
        tokens.push(token);
      }
    }
    return new TokenTwister(tokens);
  }

  getLesson(lessonNumber) {
    const tokens = [];
    let take = false;
    for (const token of this.tokens) {
      if (
        parseInt(token.text, 10) === lessonNumber + 1 ||
        token.text === '--fcc-end--'
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
    return new TokenTwister(tokens, 'getLesson');
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

  get seedToIterator() {
    if (this.caller !== 'getSeed') {
      throw new Error(
        `seedToIterator must be called on getSeed. Called on ${this.caller}`
      );
    }
    return seedToIterator(this.tokens);
  }

  get textsAndTests() {
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
    const hints = hintTokens.map(t => t.map(t => t.raw).join(''));
    return hints;
  }

  get markdown() {
    return this.tokens.map(t => t.raw).join('');
  }

  get text() {
    return this.tokens.map(t => t.text).join('');
  }
}

function* seedToIterator(tokens) {
  const sectionTokens = [];
  let currentSection = 0;
  for (const token of tokens) {
    if (
      token.type === 'heading' &&
      token.depth === 4 &&
      token.text !== '--force--'
    ) {
      if (token.text !== currentSection) {
        currentSection = token.text;
        sectionTokens[currentSection] = [];
      }
    } else {
      sectionTokens[currentSection].push(token);
    }
  }
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
