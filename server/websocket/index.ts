import { WSContext } from "hono/ws";

// Store WebSocket connections, keyed by a unique ID
export const GLOBAL_SOCKET: { ws: WSContext | null } = {
  ws: null,
};
