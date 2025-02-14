import React, { useState, useEffect, useMemo } from "react";
import { WSCEvents } from "../../../types";
import { url } from "../utils/fetch";

export type Send = (event: WSCEvents, data: unknown) => void;

export const WebSocketContext = React.createContext<{
  socket: WebSocket | null;
  send: Send;
} | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [debouncers, setDebouncers] = useState<WSCEvents[]>([]);

  function connectToWebSocket() {
    let ws = new WebSocket(url("/ws").href.replace("http", "ws"));

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      console.debug("Received message:", event.data);
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket server");
      setSocket(null);
      setTimeout(() => {
        console.log("Attempting to reconnect");

        ws = new WebSocket(url("/ws").href.replace("http", "ws"));
        // window.location.reload(); // simplest reconnection
      }, 1000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setSocket(null);
    };

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }

  useEffect(connectToWebSocket, []);

  function send(event: WSCEvents, data: unknown) {
    if (socket) {
      if (debouncers.includes(event)) {
        return;
      }
      const newDebouncers = [...debouncers, event];
      setDebouncers(() => newDebouncers);
      socket.send(JSON.stringify({ event, data }));
    }
  }

  const value = useMemo(() => ({ socket, send }), [socket]);

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}
