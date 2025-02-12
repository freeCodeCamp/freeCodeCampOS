import { Hono } from "hono";
import { createBunWebSocket, serveStatic } from "hono/bun";
import { readdir, readFile } from "fs/promises";
import { getWorkerPool, runTests } from "./tooling/tests/main";
import {
  getProjectConfig,
  getState,
  updateCurrentLesson,
  ROOT,
  setState,
  getConfig,
} from "./tooling/env";

import { WebSocketServer } from "ws";
import { runLesson } from "./tooling/lesson";
import {
  updateProjects,
  updateFreeCodeCampConfig,
  updateLocale,
  updateState,
} from "./tooling/client-socks";
import { hotReload } from "./tooling/hot-reload";
import { hideAll, showFile, showAll } from "./tooling/utils";
import { join } from "path";
import { logover } from "./tooling/logger";
import { resetProject } from "./tooling/reset";
import { validateCurriculum } from "./tooling/validate";
import { pluginEvents } from "./plugin/index";
import { Dirent } from "fs";
import { cors } from "hono/cors";

const freeCodeCampConfig = await getConfig();

if (process.env.NODE_ENV === "development") {
  await validateCurriculum();
}

async function handleRunTests(ws, data) {
  const { currentProject } = await getState();
  await runTests(ws, currentProject);
  ws.send(parse({ data: { event: data.event }, event: "RESPONSE" }));
}

async function handleResetProject(ws, data) {
  await resetProject(ws);
  ws.send(parse({ data: { event: data.event }, event: "RESPONSE" }));
}
function handleResetLesson(ws, data) {}

async function handleGoToNextLesson(ws, data) {
  const { currentProject, projects } = await getState();
  const project = await getProjectConfig(currentProject);
  const nextLesson = project.currentLesson + 1;

  if (nextLesson > 0 && nextLesson <= project.numberOfLessons - 1) {
    await updateCurrentLesson(project.dashedName, nextLesson);
    await runLesson(ws, project.dashedName);
  }
  ws.send(parse({ data: { event: data.event }, event: "RESPONSE" }));
}

async function handleGoToPreviousLesson(ws, data) {
  const { currentProject } = await getState();
  const project = await getProjectConfig(currentProject);
  const prevLesson = project.currentLesson - 1;

  if (prevLesson >= 0 && prevLesson <= project.numberOfLessons - 1) {
    await updateCurrentLesson(project.dashedName, prevLesson);
    await runLesson(ws, project.dashedName);
  }
  ws.send(parse({ data: { event: data.event }, event: "RESPONSE" }));
}

/**
 * Gets the projects for the current locale
 */
async function getProjects() {
  const { locale } = await getState();
  const files = await readdir(
    join(ROOT, freeCodeCampConfig.curriculum.locales[locale]),
    { withFileTypes: true }
  );

  const projects = [];

  for (const file of files) {
    if (!file.isFile) {
      continue;
    }
    // File might not be a valid project, in which case, it is tried as one, but ignored
    let projectMeta;
    try {
      const dashedName = file.name.replace(/.md$/, "");
      projectMeta = await getProjectConfig(dashedName);
    } catch (e) {
      logover.debug(`File ${file.name} skipped as invalid due to:`);
      logover.debug(e);
      continue;
    }
    projects.push(projectMeta);
  }
  return projects;
}

async function handleConnect(ws) {
  const projects = await getProjects();
  const state = await getState();

  updateProjects(ws, projects);
  updateState(ws, state);
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
  const projects = await getProjects();
  const selectedProject = projects.find((p) => p.id === data?.data?.id);
  // TODO: Should this set the currentProject to `null` (empty string)?
  // for the case where the Camper has navigated to the landing page.
  await setState({ currentProject: selectedProject?.dashedName ?? null });
  if (!selectedProject && !data?.data?.id) {
    return ws.send(parse({ data: { event: data.event }, event: "RESPONSE" }));
  }

  // Disabled whilst in development because it is annoying
  if (process.env.NODE_ENV === "production") {
    await hideAll();
    await showFile(selectedProject.dashedName);
  } else {
    await showAll();
  }
  await runLesson(ws, selectedProject.dashedName);
  return ws.send(parse({ data: { event: data.event }, event: "RESPONSE" }));
}

async function handleRequestData(ws, data) {
  console.log(data);
  if (data?.data?.request === "projects") {
    const projects = await getProjects();
    updateProjects(ws, projects);
  }
  if (data?.data?.request === "state") {
    const state = await getState();
    updateState(ws, state);
  }
  ws.send(parse({ data: { event: data.event }, event: "RESPONSE" }));
}

function handleCancelTests(ws, data) {
  const workerPool = getWorkerPool();
  for (const worker of workerPool) {
    worker.terminate();
  }
  ws.send(parse({ data: { event: data.event }, event: "RESPONSE" }));
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
        event: "RESPONSE",
      })
    );
  } catch (e) {
    logover.error("Error running client code:\n", e);
    ws.send(
      parse({
        data: { event: data.event, error: e.message },
        event: "RESPONSE",
      })
    );
  }
}

async function handleChangeLanguage(ws, data) {
  await setState({ locale: data?.data?.locale });
  updateLocale(ws, data?.data?.locale);
  const projects = await getProjects();
  updateProjects(ws, projects);
  const state = await getState();
  updateState(ws, state);
}

const PORT = freeCodeCampConfig.port || 8080;

// const server = app.listen(PORT, () => {
//   logover.info(`Server listening at http://localhost:${PORT}`);
// });

const handle = {
  connect: (ws, data) => {
    handleConnect(ws);
  },
  "run-tests": handleRunTests,
  "reset-project": handleResetProject,
  "go-to-next-lesson": handleGoToNextLesson,
  "go-to-previous-lesson": handleGoToPreviousLesson,
  "request-data": handleRequestData,
  "select-project": handleSelectProject,
  "cancel-tests": handleCancelTests,
  "change-language": handleChangeLanguage,
  "__run-client-code": handleRunClientCode,
};

// const staticRoutes = {};

const distDir = join(import.meta.dir, "..", "client", "dist");
// try {
//   await recurseStatics(distDir);
//   // Handle `/`
//   staticRoutes["/"] = staticRoutes["/index.html"];
// } catch (e) {
//   logover.error(e);
// }

// async function recurseStatics(path: string): Promise<void> {
//   try {
//     const file = Bun.file(path);
//     const fileStat = await file.stat();

//     if (fileStat.isFile()) {
//       const fileBytes = await Bun.file(path).arrayBuffer();
//       const basePath = path.substring(
//         path.indexOf("client/dist") + "client/dist".length
//       );
//       staticRoutes[basePath] = new Response(fileBytes, {
//         headers: { "Content-Type": pathToFileType(path) },
//       });
//     } else if (fileStat.isDirectory()) {
//       const entries = await readdir(path, { withFileTypes: true });
//       for (const entry of entries) {
//         const fullPath = join(path, entry.name);
//         await recurseStatics(fullPath); // Recursive call
//       }
//     } else {
//       console.warn(`Skipping unknown file type: ${path}`);
//     }
//   } catch (err) {
//     console.error(`Error processing path ${path}:`, err);
//   }
// }

// function pathToFileType(path: string): string {
//   const ext = path.split(".").pop();
//   switch (ext) {
//     case "html":
//       return "text/html";
//     case "css":
//       return "text/css";
//     case "js":
//       return "text/javascript";
//     case "json":
//       return "application/json";
//     case "svg":
//       return "image/svg+xml";
//     case "png":
//       return "image/png";
//     case "jpg":
//     case "jpeg":
//       return "image/jpeg";
//     case "gif":
//       return "image/gif";
//     case "ico":
//       return "image/x-icon";
//     case "webp":
//       return "image/webp";
//     case "mp4":
//       return "video/mp4";
//     case "webm":
//       return "video/webm";
//     case "woff":
//       return "font/woff";
//     case "woff2":
//       return "font/woff2";
//     case "ttf":
//       return "font/ttf";
//     default:
//       return "text/plain";
//   }
// }

const app = new Hono();
app.use("*", cors({ origin: "*" }));
app.use("*", serveStatic({ root: distDir }));
// TODO
const staticDir = freeCodeCampConfig.client?.static;
if (Array.isArray(staticDir)) {
  for (const dir of staticDir) {
    if (typeof dir === "object") {
      for (const [route, d] of Object.entries<string>(dir)) {
        app.use(route, serveStatic({ path: join(ROOT, d) }));
      }
    } else if (typeof dir === "string") {
      app.use(serveStatic({ path: join(ROOT, dir) }));
    }
  }
} else if (typeof staticDir === "string") {
  app.use(serveStatic({ path: join(ROOT, staticDir) }));
} else if (typeof staticDir === "object") {
  for (const [route, dir] of Object.entries(staticDir)) {
    app.use(route, serveStatic({ path: join(ROOT, dir) }));
  }
}

const { upgradeWebSocket, websocket } = createBunWebSocket();

const server = Bun.serve({
  port: PORT,
  // static: staticRoutes,
  error: (error) => {
    logover.error(error);
    return new Response("Error: " + error.message, { status: 500 });
  },
  fetch: app.fetch,
  websocket,
});

app.get(
  "/ws",
  upgradeWebSocket(() => ({
    onOpen(_, ws) {},
    onClose(_, ws) {},
    onError(event, ws) {
      logover.error(event);
    },
    onMessage(event, ws) {
      logover.debug(event.data);
      const parsedData = parseBuffer(event.data);
      handle[parsedData.event]?.(ws, parsedData);
    },
  }))
);

logover.info(`Server listening at ${server.url}`);

//   (async () => {
//     const projects = await getProjects();
//     updateProjects(ws, projects);
//     const state = await getState();
//     updateState(ws, state);
//     updateFreeCodeCampConfig(ws, freeCodeCampConfig);
//   })();
//   sock("connect", { message: "Server says 'Hello!'" });

//   function sock(type, data = {}) {
//     ws.send(parse({ event: type, data }));
//   }

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
  const isFileFree = await new Promise((resolve) => {
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
