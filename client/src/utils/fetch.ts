import {
  FreeCodeCampConfig,
  Project,
  ProjectConfig,
  State,
} from "../../../types";

export function url(path: string) {
  return new URL(path, import.meta.env.VITE_SERVER_URL);
}

export async function getProjects(): Promise<Project[]> {
  const response = await fetch(url("/api/projects"));
  return response.json();
}

export async function getProject(id: ProjectConfig["id"]): Promise<Project> {
  const response = await fetch(url(`/api/projects/${id}`));
  return response.json();
}

export async function getConfig(): Promise<FreeCodeCampConfig> {
  const response = await fetch(url("/api/config"));
  return response.json();
}

export async function getState(): Promise<State> {
  const response = await fetch(url("/api/state"));
  return response.json();
}

export async function runTests() {
  const response = await fetch(url("/api/tests/run"), { method: "POST" });
  return response.json();
}

export async function cancelTests() {
  const response = await fetch(url("/api/tests/cancel"), { method: "POST" });
  return response.json();
}

export async function postState(state: Partial<State>): Promise<State> {
  const response = await fetch(url("/api/state"), {
    method: "POST",
    body: JSON.stringify(state),
  });
  return response.json();
}
