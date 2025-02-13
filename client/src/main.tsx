import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";

import { WebSocketProvider } from "./context/websocket";
import { LessonRoute } from "./templates/project";
import { LandingRoute } from "./templates/landing";

import "./styles.css";
import { rootRoute } from "./utils";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";

const queryClient = new QueryClient();

const routes = [LessonRoute, LandingRoute];

const routeTree = rootRoute.addChildren(routes);

const router = createRouter({ routeTree, context: { queryClient } });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider>
        <RouterProvider router={router} />
      </WebSocketProvider>
    </QueryClientProvider>
  </StrictMode>
);
