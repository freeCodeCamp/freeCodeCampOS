function toggleLoaderAnimation(ws) {
  ws.send(parse({ event: "toggle-loader-animation" }));
}

function updateTests(ws, tests) {
  ws.send(parse({ event: "update-tests", data: { tests } }));
}

function updateDescription(ws, description) {
  ws.send(parse({ event: "update-description", data: { description } }));
}

function updateProjectHeading(ws, projectHeading, lessonNumber) {
  ws.send(
    parse({
      event: "update-project-heading",
      data: { projectHeading, lessonNumber },
    })
  );
}

function parse(obj) {
  return JSON.stringify(obj);
}

module.exports = {
  toggleLoaderAnimation,
  updateTests,
  updateDescription,
  updateProjectHeading,
};
