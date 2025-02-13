import {
  FreeCodeCampConfig,
  Project,
  ProjectConfig,
  State,
} from "../../../types";

export async function getProjects(): Promise<Project[]> {
  const response = await fetch("/api/projects");
  return response.json();
}

export async function getProject(id: ProjectConfig["id"]): Promise<Project> {
  const response = await fetch(`/api/projects/${id}`);
  return response.json();
}

export async function getConfig(): Promise<FreeCodeCampConfig> {
  const response = await fetch("/api/config");
  return response.json();
}

export async function getState(): Promise<State> {
  const response = await fetch("/api/state");
  return response.json();
}

export async function runTests() {
  const response = await fetch("/api/tests/run", { method: "POST" });
  return response.json();
}

export async function cancelTests() {
  const response = await fetch("/api/tests/cancel", { method: "POST" });
  return response.json();
}

export async function postState(state: Partial<State>): Promise<State> {
  const response = await fetch("/api/state", {
    method: "POST",
    body: JSON.stringify(state),
  });
  return response.json();
}
