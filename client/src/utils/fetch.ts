import { Project, ProjectConfig } from "../../../types";

export async function getProjects(): Promise<Project[]> {
  const response = await fetch("/api/projects");
  return response.json();
}

export async function getProject(id: ProjectConfig["id"]): Promise<Project> {
  const response = await fetch(`/api/projects/${id}`);
  return response.json();
}
