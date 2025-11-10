import express from 'express';
import { readFile } from 'fs/promises';
import { getWorkerPool, runTests } from './tests/main.js';
import {
  getProjectConfig,
  getState,
  ROOT,
  setProjectConfig,
  setState,
  getConfig
} from './env.js';

import { WebSocketServer } from 'ws';
import { runLesson } from './lesson.js';
import {
  updateProjects,
  updateFreeCodeCampConfig,
  updateLocale
} from './client-socks.js';
import { hotReload } from './hot-reload.js';
import { hideAll, showFile, showAll } from './utils.js';
import { join } from 'path';
import { logover } from './logger.js';
import { resetProject } from './reset.js';
import { validateCurriculum } from './validate.js';
import { pluginEvents } from '../plugin/index.js';

const freeCodeCampConfig = await getConfig();

await updateProjectConfig();

if (process.env.NODE_ENV === 'development') {
  await validateCurriculum();
}

const app = express();

app.use(
  express.static(
    join(ROOT, 'node_modules/@freecodecamp/freecodecamp-os/.freeCodeCamp/dist')
  )
);

// Serve static dir(s)
const staticDir = freeCodeCampConfig.client?.static;
if (Array.isArray(staticDir)) {
  for (const dir of staticDir) {
    if (typeof dir === 'object') {
      for (const [route, dir] of Object.entries(dir)) {
        app.use(route, express.static(join(ROOT, dir)));
      }
    } else if (typeof dir === 'string') {
      app.use(express.static(join(ROOT, dir)));
    }
  }
} else if (typeof staticDir === 'string') {
  app.use(express.static(join(ROOT, staticDir)));
} else if (typeof staticDir === 'object') {
  for (const [route, dir] of Object.entries(staticDir)) {
    app.use(route, express.static(join(ROOT, dir)));
  }
}
async function handleRunTests(ws, data) {
  const { currentProject } = await getState();
  await runTests(ws, currentProject);
  ws.send(parse({ data: { event: data.event }, event: 'RESPONSE' }));
}

async function handleResetProject(ws, data) {
  await resetProject(ws);
  ws.send(parse({ data: { event: data.event }, event: 'RESPONSE' }));
}
function handleResetLesson(ws, data) {}

async function handleGoToNextLesson(ws, data) {
  const { currentProject } = await getState();
  const project = await getProjectConfig(currentProject);
  const nextLesson = project.currentLesson + 1;

  if (nextLesson > 0 && nextLesson <= project.numberOfLessons - 1) {
    await setProjectConfig(currentProject, { currentLesson: nextLesson });
    await runLesson(ws, project.dashedName);
  }
  ws.send(parse({ data: { event: data.event }, event: 'RESPONSE' }));
}

async function handleGoToPreviousLesson(ws, data) {
  const { currentProject } = await getState();
  const project = await getProjectConfig(currentProject);
  const prevLesson = project.currentLesson - 1;

  if (prevLesson >= 0 && prevLesson <= project.numberOfLessons - 1) {
    await setProjectConfig(currentProject, { currentLesson: prevLesson });
    await runLesson(ws, project.dashedName);
  }
  ws.send(parse({ data: { event: data.event }, event: 'RESPONSE' }));
}

/**
 * Gets the projects from `projects.json` and adds the neta to each project object.
 *
 * The client relies on each project having a title, description, and tags.
 */
async function getProjects() {
  const projects = JSON.parse(
    await readFile(
      join(ROOT, freeCodeCampConfig.config['projects.json']),
      'utf-8'
    )
  );

  for (const project of projects) {
    const {
      title,
      description,
      tags = []
    } = await pluginEvents.getProjectMeta(project.dashedName);
    project.tags = tags;
    project.title = title;
    project.description = description;
  }
  return projects;
}

async function handleConnect(ws) {
  const projects = await getProjects();

  updateProjects(ws, projects);
  updateFreeCodeCampConfig(ws, freeCodeCampConfig);
  const { currentProject, locale } = await getState();
  updateLocale(ws, locale);
  if (!currentProject) {
    return;
  }
  const project = await getProjectConfig(currentProject);
  runLesson(ws, project.dashedName);
}

async function handleSelectProject(ws, data) {
  const projects = JSON.parse(
    await readFile(
      join(ROOT, freeCodeCampConfig.config['projects.json']),
      'utf-8'
    )
  );
  const selectedProject = projects.find(p => p.id === data?.data?.id);
  // TODO: Should this set the currentProject to `null` (empty string)?
  // for the case where the Camper has navigated to the landing page.
  await setState({ currentProject: selectedProject?.dashedName ?? null });
  if (!selectedProject && !data?.data?.id) {
    return ws.send(parse({ data: { event: data.event }, event: 'RESPONSE' }));
  }

  // Disabled whilst in development because it is annoying
  if (process.env.NODE_ENV === 'production') {
    await hideAll();
    await showFile(selectedProject.dashedName);
  } else {
    await showAll();
  }
  await runLesson(ws, selectedProject.dashedName);
  return ws.send(parse({ data: { event: data.event }, event: 'RESPONSE' }));
}

async function handleRequestData(ws, data) {
  if (data?.data?.request === 'projects') {
    const projects = await getProjects();
    updateProjects(ws, projects);
  }
  ws.send(parse({ data: { event: data.event }, event: 'RESPONSE' }));
}

function handleCancelTests(ws, data) {
  const workerPool = getWorkerPool();
  for (const worker of workerPool) {
    worker.terminate();
  }
  ws.send(parse({ data: { event: data.event }, event: 'RESPONSE' }));
}

async function handleRunClientCode(ws, data) {
  const code = data?.data;
  if (!code) {
    return;
  }
  try {
    let __result;
    await eval(`(async () => {${code}})()`);
    ws.send(
      parse({
        data: { event: data.event, __result },
        event: 'RESPONSE'
      })
    );
  } catch (e) {
    logover.error('Error running client code:\n', e);
    ws.send(
      parse({
        data: { event: data.event, error: e.message },
        event: 'RESPONSE'
      })
    );
  }
}

async function handleChangeLanguage(ws, data) {
  await setState({ locale: data?.data?.locale });
  updateLocale(ws, data?.data?.locale);
  const projects = await getProjects();
  updateProjects(ws, projects);
}

const PORT = freeCodeCampConfig.port || 8080;

const server = app.listen(PORT, () => {
  logover.info(`Server listening on port ${PORT}`);
});

const handle = {
  connect: (ws, data) => {
    handleConnect(ws);
  },
  'run-tests': handleRunTests,
  'reset-project': handleResetProject,
  'go-to-next-lesson': handleGoToNextLesson,
  'go-to-previous-lesson': handleGoToPreviousLesson,
  'request-data': handleRequestData,
  'select-project': handleSelectProject,
  'cancel-tests': handleCancelTests,
  'change-language': handleChangeLanguage,
  '__run-client-code': handleRunClientCode
};

const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws) {
  hotReload(ws);
  ws.on('message', function message(data) {
    const parsedData = parseBuffer(data);
    handle[parsedData.event]?.(ws, parsedData);
  });
  (async () => {
    const projects = await getProjects();
    updateProjects(ws, projects);
    updateFreeCodeCampConfig(ws, freeCodeCampConfig);
  })();
  sock('connect', { message: "Server says 'Hello!'" });

  function sock(type, data = {}) {
    ws.send(parse({ event: type, data }));
  }
});

function parse(obj) {
  return JSON.stringify(obj);
}

function parseBuffer(buf) {
  return JSON.parse(buf.toString());
}

/**
 * Files currently under ownership by another thread.
 */
const RACING_FILES = new Set();
const FREEDOM_TIMEOUT = 100;

/**
 * Adds an operation to the race queue. If a file is already in the queue, the op is delayed until the file is released.
 * @param {string} filepath Path to file to move
 * @param {*} cb Callback to call once file is free
 */
async function addToRaceQueue(filepath, cb) {
  const isFileFree = await new Promise(resolve => {
    setTimeout(() => {
      if (!RACING_FILES.has(filepath)) {
        resolve(true);
      }
    }, FREEDOM_TIMEOUT);
  });
  if (isFileFree) {
    RACING_FILES.add(filepath);
    cb();
  }
}

async function updateProjectConfig() {
  const projects = JSON.parse(
    await readFile(
      join(ROOT, freeCodeCampConfig.config['projects.json']),
      'utf-8'
    )
  );
  for (const project of projects) {
    const { numberOfLessons } = await pluginEvents.getProjectMeta(
      project.dashedName
    );
    await setProjectConfig(project.dashedName, { numberOfLessons });
  }
}
