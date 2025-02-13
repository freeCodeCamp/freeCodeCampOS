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

import { runLesson } from "./tooling/lesson";
import { updateState } from "./tooling/client-socks";
import { hotReload } from "./tooling/hot-reload";
import { hideAll, showFile, showAll } from "./tooling/utils";
import { join } from "path";
import { logover } from "./tooling/logger";
import { resetProject } from "./tooling/reset";
import { validateCurriculum } from "./tooling/validate";
import { pluginEvents } from "./plugin/index";
import { cors } from "hono/cors";
import { WSSEvents, Project, Sock } from "../types";
import { WSMessageReceive } from "hono/ws";
import { GLOBAL_SOCKET } from "./websocket";

const freeCodeCampConfig = await getConfig();

if (process.env.NODE_ENV === "development") {
  await validateCurriculum();
}

async function handleRunTests(ws) {
  const { currentProject } = await getState();
  if (currentProject === null) {
    throw new Error("No project selected to run tests");
  }
  await runTests(ws, currentProject);
}

/**
 * Gets the projects for the current locale
 */
async function getProjects() {
  const projects: Project[] = [];
  let id = 0;
  while (true) {
    try {
      const project = await pluginEvents.getProject(id);
      projects.push(project);
    } catch (e) {
      break;
    }
    id++;
  }
  return projects;
}

async function handleConnect(ws: WebSocket) {
  const state = await getState();

  updateState(ws, state);
  const { currentProject } = await getState();
  if (currentProject === null) {
    return;
  }
  const project = await getProjectConfig(currentProject);
  runLesson(ws, project.id);
}

async function handleRequestData(ws, data) {
  console.log(data);
  if (data?.data?.request === "state") {
    const state = await getState();
    updateState(ws, state);
  }
  ws.send(parse({ data: { event: data.event }, event: WSSEvents.RESPONSE }));
}

function handleCancelTests() {
  const workerPool = getWorkerPool();
  for (const worker of workerPool) {
    worker.terminate();
  }
}

const PORT = freeCodeCampConfig.port || 8080;

const handle = {
  connect: (ws, data) => {
    handleConnect(ws);
  },
  "request-data": handleRequestData,
};

const distDir = join(import.meta.dir, "..", "client", "dist");

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

app.get(
  "/ws",
  upgradeWebSocket(() => ({
    onOpen(_, ws) {
      GLOBAL_SOCKET.ws = ws;

      ws.send(parse({ event: WSSEvents.CONNECT, data: "Hello from server" }));
    },
    onClose(_, ws) {
      // Remove the connection when it's closed
      GLOBAL_SOCKET.ws = null;
    },
    onError(event, ws) {
      logover.error(event);
      GLOBAL_SOCKET.ws = null;
    },
    onMessage(event, ws) {
      logover.debug(event.data);
      const parsedData = parseBuffer(event.data);

      handle[parsedData.event]?.(ws, parsedData);
    },
  }))
);

app.get("/api/projects", async (c) => {
  const projects = await getProjects();
  return c.json(projects);
});

app.get("/api/projects/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const project = await pluginEvents.getProject(id);
  return c.json(project);
});

app.get("/api/config", async (c) => {
  return c.json(freeCodeCampConfig);
});

app.get("/api/state", async (c) => {
  const state = await getState();
  return c.json(state);
});

app.post("/api/state", async (c) => {
  const body = await c.req.json();
  const state = await setState(body);
  return c.json(state);
});

app.post("/api/tests/run", async (c) => {
  const ws = GLOBAL_SOCKET.ws;

  if (!ws) {
    return c.json({ error: "WebSocket connection not found" }, 404);
  }

  handleRunTests(ws); // Pass the WebSocket and Connection ID to your handler
  return c.json({ message: "Tests started" });
});

app.post("/api/tests/cancel", async (c) => {});

// app.get("/api/project/:projectId/:lessonId", async (c) => {
//   const projectId = c.req.param("projectId");
//   const _lessonId = c.req.param("lessonId");

//   const project = await pluginEvents.getProject(Number(projectId));
//   return c.json(project);
// });

const server = Bun.serve({
  port: PORT,
  error: (error) => {
    logover.error(error);
    return new Response("Error: " + error.message, { status: 500 });
  },
  fetch: app.fetch,
  websocket,
});

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

function parse(obj: Sock) {
  return JSON.stringify(obj);
}

function parseBuffer(buf: MessageEvent<WSMessageReceive>["data"]) {
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
