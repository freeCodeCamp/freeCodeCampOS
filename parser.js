import { lexer } from 'marked';
import { isForceFlag } from './.freeCodeCamp/tooling/parser.js';

/**
 * A class that  takes a Markdown string, uses the markedjs package to tokenize it, and provides convenience methods to access different tokens in the token tree
 */
export class TokenTwister {
  constructor(tokensOrMarkdown) {
    if (typeof tokensOrMarkdown == 'string') {
      this.tokens = lexer(tokensOrMarkdown);
    } else if (Array.isArray(tokensOrMarkdown)) {
      this.tokens = tokensOrMarkdown;
    } else {
      this.tokens = [tokensOrMarkdown];
    }
  }

  getHeading(depth, text) {
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
    return new TokenTwister(tokens);
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
    return new TokenTwister(tokens);
  }

  getDescription() {
    return this.getHeading(3, '--description--');
  }

  getTests() {
    return this.getHeading(3, '--tests--');
  }

  getSeed() {
    return this.getHeading(3, '--seed--');
  }

  getHints() {
    return this.getHeading(3, '--hints--');
  }

  getBeforeAll() {
    return this.getHeading(3, '--before-all--');
  }

  getAfterAll() {
    return this.getHeading(3, '--after-all--');
  }

  getBeforeEach() {
    return this.getHeading(3, '--before-each--');
  }

  getAfterEach() {
    return this.getHeading(3, '--after-each--');
  }

  /**
   * Get first code block text from tokens
   *
   * Meant to be used with `getBeforeAll`, `getAfterAll`, `getBeforeEach`, and `getAfterEach`
   */
  get code() {
    return this.tokens.find(t => t.type === 'code')?.text;
  }

  get seedToIterator() {
    return seedToIterator(this.tokens);
  }

  get textsAndTests() {
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
