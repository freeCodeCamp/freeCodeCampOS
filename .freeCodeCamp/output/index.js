// Create WebSocket connection.
const socket = new WebSocket("ws://localhost:8080");

const handle = {
  "toggle-loader-animation": toggleLoaderAnimation,
  "update-tests": updateTests,
  "update-description": updateDescription,
  "update-project-heading": updateProjectHeading,
  "reset-tests": resetTests,
};

// Connection opened
socket.addEventListener("open", function (event) {
  sock("connect");
});

// Listen for messages
socket.addEventListener("message", function (event) {
  const parsedData = parse(event.data);
  handle[parsedData.event]?.(parsedData.data);
});

function runTests() {
  sock("run-tests");
}
function resetProject() {
  sock("reset-project");
}
function goToNextLesson() {
  sock("go-to-next-lesson");
}
function goToPreviousLesson() {
  sock("go-to-previous-lesson");
}

// Testing websockets

// Export functions affecting `/index.html` dom.

marked.setOptions({
  highlight: (code, lang) => {
    if (Prism.languages[lang]) {
      return Prism.highlight(code, Prism.languages[lang], lang);
    } else {
      return code;
    }
  },
});

function parseMarkdown(markdown) {
  return marked.parse(markdown, { gfm: true });
}

let latestLessonNumber = 0;
function updateProjectHeading({ projectHeading, lessonNumber }) {
  if (lessonNumber !== latestLessonNumber) {
    const projectHeadingElement = document.querySelector("#project-heading");
    projectHeadingElement.innerHTML = `${projectHeading} - Lesson <span id="lesson-number">${lessonNumber}</span>`;
    projectHeadingElement.querySelector("span").classList.toggle("sparkle");
    latestLessonNumber = lessonNumber;
  }
}

function updateDescription({ description }) {
  const descriptionElement = document.querySelector("#description");
  descriptionElement.innerHTML = parseMarkdown(description);
}

function updateTests({ tests }) {
  const testsElement = document.querySelector("#tests");
  testsElement.innerHTML = parseMarkdown(tests);
}

function resetTests() {
  const testsElement = document.querySelector("#tests");
  testsElement.innerHTML = "";
}

function toggleLoaderAnimation() {
  const loaderElement = document.querySelector("#loader");
  loaderElement.classList.toggle("hidden");
}

function parse(objOrString) {
  if (typeof objOrString === "string") {
    return JSON.parse(objOrString);
  } else {
    return JSON.stringify(objOrString);
  }
}

function sock(type, data = {}) {
  socket.send(parse({ event: type, data }));
}
