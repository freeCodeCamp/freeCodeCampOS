function toggleLoaderAnimation(ws) {
  ws.send(parse({ event: "toggle-loader-animation" }));
}

function updateTests(ws, tests) {
  ws.send(parse({ event: "update-tests", data: { tests } }));
}
function updateTest(ws, test) {
  ws.send(parse({ event: "update-test", data: { test } }));
}

function updateDescription(ws, description) {
  ws.send(parse({ event: "update-description", data: { description } }));
}

function updateProjectHeading(ws, projectHeading) {
  ws.send(
    parse({
      event: "update-project-heading",
      data: projectHeading,
    })
  );
}

function updateHints(ws, hints) {
  ws.send(parse({ event: "update-hints", data: { hints } }));
}

function updateConsole(ws, cons) {
  ws.send(parse({ event: "update-console", data: { cons } }));
}

function parse(obj) {
  return JSON.stringify(obj);
}

module.exports = {
  toggleLoaderAnimation,
  updateTests,
  updateTest,
  updateDescription,
  updateProjectHeading,
  updateHints,
  updateConsole,
};
