import { parseMarkdown } from './parser.js';

export function toggleLoaderAnimation(ws) {
  ws.send(parse({ event: 'toggle-loader-animation' }));
}

/**
 * Update all tests in the tests state
 * @param {WebSocket} ws WebSocket connection to the client
 * @param {Test[]} tests Array of Test objects
 */
export function updateTests(ws, tests) {
  const renderedTests = tests?.map((test, i) => {
    return {
      ...test,
      testText: parseMarkdown(test.testText)
    };
  });
  ws.send(parse({ event: 'update-tests', data: { tests: renderedTests } }));
}
/**
 * Update single test in the tests state
 * @param {WebSocket} ws WebSocket connection to the client
 * @param {Test} test Test object
 */
export function updateTest(ws, test) {
  const renderedTest = {
    ...test,
    testText: parseMarkdown(test.testText)
  };
  ws.send(parse({ event: 'update-test', data: { test: renderedTest } }));
}
/**
 * Update the lesson description
 * @param {WebSocket} ws WebSocket connection to the client
 * @param {string} description Lesson description
 */
export function updateDescription(ws, description) {
  const renderedDescription = parseMarkdown(description);
  ws.send(
    parse({
      event: 'update-description',
      data: { description: renderedDescription }
    })
  );
}
/**
 * Update the heading of the lesson
 * @param {WebSocket} ws WebSocket connection to the client
 * @param {{lessonNumber: number; title: string;}} projectHeading Project heading
 */
export function updateProjectHeading(ws, projectHeading) {
  const renderedProjectHeading = {
    lessonNumber: projectHeading.lessonNumber,
    title: parseMarkdown(projectHeading.title)
  };
  ws.send(
    parse({
      event: 'update-project-heading',
      data: renderedProjectHeading
    })
  );
}
/**
 * Update the project state
 * @param {WebSocket} ws WebSocket connection to the client
 * @param {Project} project Project object
 */
export function updateProject(ws, project) {
  const renderedProject = project
    ? {
        title: parseMarkdown(project.title),
        description: parseMarkdown(project.description),
        ...project
      }
    : null;
  ws.send(
    parse({
      event: 'update-project',
      data: renderedProject
    })
  );
}
/**
 * Update the projects state
 * @param {WebSocket} ws WebSocket connection to the client
 * @param {Project[]} projects Array of Project objects
 */
export function updateProjects(ws, projects) {
  const renderedProjects = projects?.map(project => {
    return {
      title: parseMarkdown(project.title),
      description: parseMarkdown(project.description),
      ...project
    };
  });
  ws.send(
    parse({
      event: 'update-projects',
      data: renderedProjects
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
  const renderedHints = hints?.map(hint => parseMarkdown(hint));
  ws.send(parse({ event: 'update-hints', data: { hints: renderedHints } }));
}
/**
 *
 * @param {WebSocket} ws WebSocket connection to the client
 * @param {{error: string; testText: string; passed: boolean;isLoading: boolean;testId: number;}} cons
 */
export function updateConsole(ws, cons) {
  cons.testText = parseMarkdown(cons.testText);
  if (cons.error) {
    const error = `\`\`\`json\n${cons.error}\n\`\`\``;
    cons.error = parseMarkdown(error);
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
