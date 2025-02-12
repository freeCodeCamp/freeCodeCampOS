import { parseMarkdown } from "./parser";

export function updateLoader(ws: WebSocket, loader) {
  ws.send(parse({ event: "update-loader", data: { loader } }));
}

/**
 * Update all tests in the tests state
 */
export function updateTests(ws: WebSocket, tests) {
  ws.send(parse({ event: "update-tests", data: { tests } }));
}
/**
 * Update single test in the tests state
 */
export function updateTest(ws: WebSocket, test) {
  ws.send(parse({ event: "update-test", data: { test } }));
}
/**
 * Update the lesson description
 */
export function updateDescription(ws: WebSocket, description) {
  ws.send(
    parse({
      event: "update-description",
      data: { description },
    })
  );
}
/**
 * Update the heading of the lesson
 */
export function updateProjectHeading(
  ws: WebSocket,
  projectHeading: { lessonNumber: number; title: string }
) {
  ws.send(
    parse({
      event: "update-project-heading",
      data: projectHeading,
    })
  );
}
/**
 * Update the project state
 */
export function updateProject(ws: WebSocket, project) {
  ws.send(
    parse({
      event: "update-project",
      data: project,
    })
  );
}
/**
 * Update the projects
 */
export function updateProjects(ws: WebSocket, projects) {
  ws.send(
    parse({
      event: "update-projects",
      data: projects,
    })
  );
}

/**
 * Update the state
 */
export function updateState(ws: WebSocket, state) {
  ws.send(
    parse({
      event: "update-state",
      data: state,
    })
  );
}
/**
 * Update the projects state
 */
export function updateFreeCodeCampConfig(ws: WebSocket, config) {
  ws.send(
    parse({
      event: "update-freeCodeCamp-config",
      data: config,
    })
  );
}
/**
 * Update hints
 */
export function updateHints(ws: WebSocket, hints) {
  ws.send(parse({ event: "update-hints", data: { hints } }));
}
/**
 *
 * @param {{error: string; testText: string; passed: boolean;isLoading: boolean;testId: number;}} cons
 */
export function updateConsole(ws: WebSocket, cons) {
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
  ws.send(parse({ event: "update-console", data: { cons } }));
}

/**
 * Update error
 */
export function updateError(ws: WebSocket, error) {
  ws.send(parse({ event: "update-error", data: { error } }));
}

/**
 * Update the current locale
 */
export function updateLocale(ws: WebSocket, locale) {
  ws.send(parse({ event: "update-locale", data: locale }));
}

/**
 * Handles the case when a project is finished
 */
export function handleProjectFinish(ws: WebSocket) {
  ws.send(parse({ event: "handle-project-finish" }));
}

export function parse(obj) {
  return JSON.stringify(obj);
}

/**
 * Resets the bottom panel (Tests, Console, Hints) of the client to empty state
 */
export function resetBottomPanel(ws: WebSocket) {
  updateHints(ws, []);
  updateTests(ws, []);
  updateConsole(ws, {});
}
