import { ConsoleError, TestState, WSSEvents } from "../../types";
import { parseMarkdown } from "./parser";

// export function updateLoader(ws: WebSocket, loader) {
//   ws.send(parse({ event: WSSEven, data: { loader } }));
// }

/**
 * Update all tests in the tests state
 */
export function updateTestsState(ws: WebSocket, testsState: TestState[]) {
  ws.send(parse({ event: WSSEvents.UPDATE_TESTS_STATE, data: { testsState } }));
}
/**
 * Update single test in the tests state
 */
export function updateTestState(ws: WebSocket, testState: TestState) {
  ws.send(parse({ event: WSSEvents.UPDATE_TEST_STATE, data: { testState } }));
}

/**
 * Update the state
 */
export function updateState(ws: WebSocket, state) {
  ws.send(
    parse({
      event: WSSEvents.UPDATE_STATE,
      data: state,
    })
  );
}
/**
 *
 */
export function updateConsole(ws: WebSocket, consoleError: ConsoleError) {
  if (Object.keys(consoleError).length) {
    if (consoleError.error) {
      const error = `\`\`\`json\n${JSON.stringify(
        consoleError.error,
        null,
        2
      )}\n\`\`\``;
      consoleError.error = parseMarkdown(error);
    }
  }
  ws.send(parse({ event: WSSEvents.UPDATE_CONSOLE, data: { consoleError } }));
}

/**
 * Update error
 */
export function updateError(ws: WebSocket, error) {
  ws.send(parse({ event: "update-error", data: { error } }));
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
  updateTestsState(ws, []);
  updateConsole(ws, {} as ConsoleError);
}
