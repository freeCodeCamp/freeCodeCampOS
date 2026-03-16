import { createRoot } from 'react-dom/client';
import { Suspense, useState, useEffect } from 'react';
import {
  ConsoleError,
  Events,
  FreeCodeCampConfigI,
  LoaderT,
  ProjectI,
  TestType
} from './types/index';
import { Loader } from './components/loader';
import { Landing } from './templates/landing';
import { Project } from './templates/project';
import { parse } from './utils/index';
import { Header } from './components/header';
import './styles.css';
import { E44o5 } from './components/error';

// Dynamically construct the socket url based on `window.location`
let socket = new WebSocket(
  `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${
    window.location.host
  }/ws`
);

const App = () => {
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [freeCodeCampConfig, setFreeCodeCampConfig] =
    useState<FreeCodeCampConfigI>({});
  const [project, setProject] = useState<ProjectI | null>(null);

  const [lesson_number, setLessonNumber] = useState(1);
  const [description, setDescription] = useState('');
  const [locale, setLocale] = useState('english');
  const [tests, setTests] = useState<TestType[]>([]);
  const [hints, setHints] = useState<string[]>([]);
  const [cons, setCons] = useState<ConsoleError[]>([]);
  const [loader, setLoader] = useState({
    is_loading: false,
    progress: { count: 0, total: 1 }
  });
const [alertCamper, setAlertCamper] = useState<null | string>(null);
  const [error, setError] = useState<Error | null>(null);

  const [debouncers, setDebouncers] = useState<string[]>([]);
  const [connected, setConnected] = useState<boolean>(false);

  function connectToWebSocket() {
    socket.onopen = function (_event) {
      setConnected(true);
      setAlertCamper(null);
      sock(Events.CONNECT);
    };
    socket.onmessage = function (event) {
      const parsedData: { event: keyof typeof handle; data: any } = parse(
        event.data
      );
      handle[parsedData.event]?.(parsedData.data);
    };
    socket.onclose = function (_event) {
      setAlertCamper('Client has disconnected from local server');
      setConnected(false);
      // Try to reconnect
      setTimeout(() => {
        socket = new WebSocket(
          `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${
            window.location.host
          }/ws`
        );
        connectToWebSocket();
      }, 1000);
    };

    return () => {
      console.log('socket closing');
      socket.close();
    };
  }

  useEffect(connectToWebSocket, []);

  const handle = {
    handle_project_finish: handleProjectFinish,
    update_loader: updateLoader,
    update_test: updateTest,
    update_tests: updateTests,
    update_hints: updateHints,
    update_console: updateConsole,
    update_description: updateDescription,
    update_project_heading: updateProjectHeading,
    update_lesson: updateLesson,
    update_project: setProject,
    update_projects: setProjects,
    update_freecodecamp_config: setFreeCodeCampConfig,
    update_error: updateError,
    reset_tests: resetTests,
    update_locale: setLocale,
    RESPONSE: debounce
  };

  function handleProjectFinish() {
    // Send Camper to landing page
    updateProject(null);
  }

  useEffect(() => {
    if (connected) {
      sock(Events.REQUEST_DATA, { request: 'projects' });
    }
  }, [project]);

  function debounce({ event }: { event: string }) {
    const debouncerRemoved = debouncers.filter(d => d !== event);
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

  function updateProjectHeading({ lesson_number }: { lesson_number: number }) {
    setLessonNumber(lesson_number);
  }

  function updateLesson({
    lesson_number,
    description,
    tests,
    hints
  }: {
    lesson_number: number;
    description: string;
    tests: TestType[];
    hints: string[];
  }) {
    setLessonNumber(lesson_number);
    setDescription(description);
    setTests(tests);
    setHints(hints || []);
  }

  function updateDescription({ description }: { description: string }) {
    setDescription(description);
  }

  function updateTests({ tests }: { tests: TestType[] }) {
    setTests(tests);
  }
  function updateTest({ test }: { test: TestType }) {
    setTests(ts => ts.map(t => (t.test_id === test.test_id ? test : t)));
  }
  function updateHints({ hints }: { hints: string[] }) {
    setHints(hints);
  }

  function updateConsole({ cons }: { cons: ConsoleError }) {
    if (!Object.keys(cons).length) {
      return setCons([]);
    }
    setCons(prev => {
      const existing = prev.findIndex(c => c.test_id === cons.test_id);
      let nextCons = [...prev];
      if (existing !== -1) {
        nextCons[existing] = cons;
      } else {
        nextCons.push(cons);
      }
      return nextCons.sort((a, b) => {
        const indexA = tests.findIndex(t => t.test_id === a.test_id);
        const indexB = tests.findIndex(t => t.test_id === b.test_id);
        return indexA - indexB;
      });
    });
  }

  function updateError({ error }: { error: any }) {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    setError(errorObj);
    setAlertCamper('An error occurred while running tests');
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
              lesson_number,
              project,
              resetProject,
              runTests,
              tests
            }}
          />
        ) : (
          <Landing {...{ locale, sock, projects, freeCodeCampConfig }} />
        )}
      </Suspense>
    </>
  );
};

const container = document.getElementById('root');
if (!container) throw Error('Element #root not found to mount to');
const root = createRoot(container);
root.render(<App />);
