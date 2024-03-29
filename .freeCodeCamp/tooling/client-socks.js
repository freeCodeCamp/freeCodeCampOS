import { parseMarkdown } from './parser.js';

export function updateLoader(ws, loader) {
  ws.send(parse({ event: 'update-loader', data: { loader } }));
}

/**
 * Update all tests in the tests state
 * @param {WebSocket} ws WebSocket connection to the client
 * @param {Test[]} tests Array of Test objects
 */
export function updateTests(ws, tests) {
  ws.send(parse({ event: 'update-tests', data: { tests } }));
}
/**
 * Update single test in the tests state
 * @param {WebSocket} ws WebSocket connection to the client
 * @param {Test} test Test object
 */
export function updateTest(ws, test) {
  ws.send(parse({ event: 'update-test', data: { test } }));
}
/**
 * Update the lesson description
 * @param {WebSocket} ws WebSocket connection to the client
 * @param {string} description Lesson description
 */
export function updateDescription(ws, description) {
  ws.send(
    parse({
      event: 'update-description',
      data: { description }
    })
  );
}
/**
 * Update the heading of the lesson
 * @param {WebSocket} ws WebSocket connection to the client
 * @param {{lessonNumber: number; title: string;}} projectHeading Project heading
 */
export function updateProjectHeading(ws, projectHeading) {
  ws.send(
    parse({
      event: 'update-project-heading',
      data: projectHeading
    })
  );
}
/**
 * Update the project state
 * @param {WebSocket} ws WebSocket connection to the client
 * @param {Project} project Project object
 */
export function updateProject(ws, project) {
  ws.send(
    parse({
      event: 'update-project',
      data: project
    })
  );
}
/**
 * Update the projects state
 * @param {WebSocket} ws WebSocket connection to the client
 * @param {Project[]} projects Array of Project objects
 */
export function updateProjects(ws, projects) {
  ws.send(
    parse({
      event: 'update-projects',
      data: projects
    })
  );
}
/**
 * Update the projects state
 * @param {WebSocket} ws WebSocket connection to the client
 * @param {any} config config object
 */
export function updateFreeCodeCampConfig(ws, config) {
  ws.send(
    parse({
      event: 'update-freeCodeCamp-config',
      data: config
    })
  );
}
/**
 * Update hints
 * @param {WebSocket} ws WebSocket connection to the client
 * @param {string[]} hints Markdown strings
 */
export function updateHints(ws, hints) {
  ws.send(parse({ event: 'update-hints', data: { hints } }));
}
/**
 *
 * @param {WebSocket} ws WebSocket connection to the client
 * @param {{error: string; testText: string; passed: boolean;isLoading: boolean;testId: number;}} cons
 */
export function updateConsole(ws, cons) {
  if (Object.keys(cons).length) {
    if (cons.error) {
      const error = `\`\`\`json\n${JSON.stringify(
        cons.error,
        null,
        2
      )}\n\`\`\``;
      cons.error = parseMarkdown(error);
    }
  }
  ws.send(parse({ event: 'update-console', data: { cons } }));
}

/**
 * Update error
 * @param {WebSocket} ws WebSocket connection to the client
 * @param {Error} error Error object
 */
export function updateError(ws, error) {
  ws.send(parse({ event: 'update-error', data: { error } }));
}

/**
 * Update the current locale
 * @param {WebSocket} ws WebSocket connection to the client
 * @param {string} locale Locale string
 */
export function updateLocale(ws, locale) {
  ws.send(parse({ event: 'update-locale', data: locale }));
}

/**
 * Handles the case when a project is finished
 * @param {WebSocket} ws WebSocket connection to the client
 */
export function handleProjectFinish(ws) {
  ws.send(parse({ event: 'handle-project-finish' }));
}

export function parse(obj) {
  return JSON.stringify(obj);
}

/**
 * Resets the bottom panel (Tests, Console, Hints) of the client to empty state
 * @param {WebSocket} ws WebSocket connection to the client
 */
export function resetBottomPanel(ws) {
  updateHints(ws, []);
  updateTests(ws, []);
  updateConsole(ws, {});
}
