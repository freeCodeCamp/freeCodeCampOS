import { createRoot } from "react-dom/client";
import { Suspense, useState, useEffect, StrictMode, useContext } from "react";

import { Loader } from "./components/loader";
import { Landing } from "./templates/landing";
import { Project } from "./templates/project";
import { parse } from "./utils/index";
import { Header } from "./components/header";
import { E44o5 } from "./components/error";

import "./styles.css";
import { WebSocketContext } from "./context/websocket";
import { ProjectConfig, State } from "../../types";

function App() {
  const [projectConfig, setProjectConfig] = useState<ProjectConfig | null>(
    null
  );
  const [state, setState] = useState<State | null>(null);

  return (
    <Suspense fallback={<Loader />}>
      <Header />
      {state?.currentProject ? (
        <Project
          {...{
            project,
          }}
        />
      ) : (
        <Landing />
      )}
    </Suspense>
  );
}

const App2 = () => {
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [state, setState] = useState<State | null>(null);
  const [freeCodeCampConfig, setFreeCodeCampConfig] =
    useState<FreeCodeCampConfigI>({});
  const [project, setProject] = useState<ProjectI | null>(null);

  const [lessonNumber, setLessonNumber] = useState(1);
  const [description, setDescription] = useState("");
  const [locale, setLocale] = useState("english");
  const [tests, setTests] = useState<TestType[]>([]);
  const [hints, setHints] = useState<string[]>([]);
  const [cons, setCons] = useState<ConsoleError[]>([]);
  const [loader, setLoader] = useState({
    isLoading: false,
    progress: { count: 0, total: 1 },
  });
  const [alertCamper, setAlertCamper] = useState<null | string>(null);
  const [error, setError] = useState<Error | null>(null);

  const [debouncers, setDebouncers] = useState<string[]>([]);
  const [connected, setConnected] = useState<boolean>(false);

  const { socket, send } = useContext(WebSocketContext)!;

  function handleSocket() {
    function handleMessage(event: MessageEvent) {
      const parsedData: { event: keyof typeof handle; data: any } = parse(
        event.data
      );
      handle[parsedData.event]?.(parsedData.data);
    }

    socket?.addEventListener("message", handleMessage);

    return () => {
      socket?.removeEventListener("message", handleMessage);
    };
  }

  useEffect(handleSocket, [socket]);

  const handle = {
    "handle-project-finish": handleProjectFinish,
    "update-loader": updateLoader,
    "update-test": updateTest,
    "update-tests": updateTests,
    "update-hints": updateHints,
    "update-console": updateConsole,
    "update-description": updateDescription,
    "update-project-heading": updateProjectHeading,
    "update-project": setProject,
    "update-state": setState,
    "update-projects": setProjects,
    "update-freeCodeCamp-config": setFreeCodeCampConfig,
    "update-error": updateError,
    "reset-tests": resetTests,
    "update-locale": setLocale,
    RESPONSE: debounce,
  };

  function handleProjectFinish() {
    // Send Camper to landing page
    updateProject(null);
  }

  useEffect(() => {
    if (connected) {
      sock(Events.REQUEST_DATA, { request: "projects" });
    }
  }, [project]);

  useEffect(() => {
    if (connected) {
      sock(Events.REQUEST_DATA, { request: "state" });
    }
  }, [project, lessonNumber]);

  function debounce({ event }: { event: string }) {
    const debouncerRemoved = debouncers.filter((d) => d !== event);
    setDebouncers(() => debouncerRemoved);
  }

  function sock(type: Events, data = {}) {
    if (debouncers.includes(type)) {
      return;
    }
    const newDebouncers = [...debouncers, type];
    setDebouncers(() => newDebouncers);
    socket.send(parse({ event: type, data }));
  }

  function updateProject(project: ProjectI | null) {
    sock(Events.SELECT_PROJECT, { id: project?.id });
    resetState();
    setProject(project);
  }

  function updateProjectHeading({ lessonNumber }: { lessonNumber: number }) {
    setLessonNumber(lessonNumber);
  }

  function updateDescription({ description }: { description: string }) {
    setDescription(description);
  }

  function updateTests({ tests }: { tests: TestType[] }) {
    setTests(tests);
  }
  function updateTest({ test }: { test: TestType }) {
    setTests((ts) => ts.map((t) => (t.testId === test.testId ? test : t)));
  }
  function updateHints({ hints }: { hints: string[] }) {
    setHints(hints);
  }

  function updateConsole({ cons }: { cons: ConsoleError }) {
    if (!Object.keys(cons).length) {
      return setCons([]);
    }
    // Insert cons in array at index `id`
    setCons((prev) => {
      const sorted = [
        ...prev.slice(0, cons.testId),
        cons,
        ...prev.slice(cons.testId),
      ].filter(Boolean);
      return sorted;
    });
  }

  function updateError({ error }: { error: Error }) {
    setError(error);
  }

  function updateLoader({ loader }: { loader: LoaderT }) {
    setLoader(loader);
  }

  function resetTests() {
    setTests([]);
  }

  function resetState() {
    setTests([]);
    setHints([]);
    setCons([]);
  }

  function toggleLoaderAnimation({ loader }: { loader: LoaderT }) {
    setLoader(loader);
  }

  function runTests() {
    setCons([]);
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

  function cancelTests() {
    sock(Events.CANCEL_TESTS);
  }

  if (alertCamper) {
    return (
      <>
        <Header {...{ sock, updateProject, freeCodeCampConfig }} />
        <E44o5 text={alertCamper} error={error} />
      </>
    );
  }

  console.log(state);
  console.log(description);
  console.log(lessonNumber);

  return (
    <>
      <Suspense fallback={<Loader />}>
        <Header {...{ sock, updateProject, freeCodeCampConfig }} />
        {project ? (
          <Project
            {...{
              cancelTests,
              cons,
              description,
              goToNextLesson,
              goToPreviousLesson,
              hints,
              loader,
              lessonNumber,
              project,
              resetProject,
              runTests,
              tests,
            }}
          />
        ) : (
          <Landing
            {...{ locale, state: state!, sock, projects, freeCodeCampConfig }}
          />
        )}
      </Suspense>
    </>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
