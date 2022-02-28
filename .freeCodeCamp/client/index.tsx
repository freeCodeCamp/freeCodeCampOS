import { render } from "react-dom";
import { useEffect, useState, StrictMode } from "react";
import "./assets/prism.css";
import "./styles.css";
import { marked } from "marked";
import * as Prism from "./assets/prism.js";
import Project from "./templates/project";
import IntegratedProject from "./templates/integrated-project";
import { Events } from "./types/index";

marked.setOptions({
  highlight: (code, lang: keyof typeof Prism["languages"]) => {
    if (Prism.languages[lang]) {
      return Prism.highlight(code, Prism.languages[lang], lang);
    } else {
      return code;
    }
  },
});

function parseMarkdown(markdown: string) {
  return marked.parse(markdown, { gfm: true });
}

let INTEGRATED_PROJECT = false;
try {
  INTEGRATED_PROJECT = !!process?.env?.INTEGRATED_PROJECT;
} catch (e) {}

const socket = new WebSocket("ws://localhost:8080");
const App = () => {
  const [topic, setTopic] = useState("");
  const [project, setProject] = useState("");
  const [lessonNumber, setLessonNumber] = useState(1);
  const [description, setDescription] = useState("");
  const [tests, setTests] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    socket.onopen = function (_event) {
      sock(Events.CONNECT);
    };
    socket.onmessage = function (event) {
      const parsedData: { event: keyof typeof handle; data: any } = parse(
        event.data
      );
      handle[parsedData.event]?.(parsedData.data);
    };

    return () => {
      console.log("socket closing");
      socket.close();
    };
  }, []);

  const handle = {
    "toggle-loader-animation": toggleLoaderAnimation,
    "update-tests": updateTests,
    "update-description": updateDescription,
    "update-project-heading": updateProjectHeading,
    "reset-tests": resetTests,
  };

  function sock(type: Events, data = {}) {
    socket.send(parse({ event: type, data }));
  }

  function updateProjectHeading({
    projectTopic,
    currentProject,
    lessonNumber,
  }: {
    projectTopic: string;
    currentProject: string;
    lessonNumber: number;
  }) {
    setTopic(projectTopic);
    setProject(currentProject);
    setLessonNumber(lessonNumber);
  }

  function updateDescription({ description }: { description: string }) {
    setDescription(parseMarkdown(description));
  }

  function updateTests({ tests }: { tests: string }) {
    setTests(parseMarkdown(tests));
  }

  function resetTests() {
    setTests("");
  }

  function toggleLoaderAnimation() {
    setIsLoading((prev) => !prev);
  }

  function runTests() {
    sock(Events.RUN_TESTS);
  }
  function resetProject() {
    sock(Events.RESET_PROJECT);
  }
  function goToNextLesson() {
    sock(Events.GO_TO_NEXT_LESSON);
  }
  function goToPreviousLesson() {
    sock(Events.GO_TO_PREVIOUS_LESSON);
  }
  return (
    <>
      {INTEGRATED_PROJECT ? (
        <IntegratedProject />
      ) : (
        <Project
          runTests={runTests}
          resetProject={resetProject}
          goToNextLesson={goToNextLesson}
          goToPreviousLesson={goToPreviousLesson}
          isLoading={isLoading}
          project={project}
          topic={topic}
          lessonNumber={lessonNumber}
          description={description}
          tests={tests}
        />
      )}
    </>
  );
};

render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById("root")
);

function parse(objOrString: any) {
  if (typeof objOrString === "string") {
    return JSON.parse(objOrString);
  } else {
    return JSON.stringify(objOrString);
  }
}
