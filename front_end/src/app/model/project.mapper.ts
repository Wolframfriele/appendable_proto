import { ProjectJson } from "./project.interface";
import { Project } from "./project.model";

export function mapToProject(project: ProjectJson): Project {
  return {
    id: project.project_id,
    name: project.name,
    archived: project.archived,
    color: project.color,
  };
}

export function mapToProjects(jsonArray: ProjectJson[]): Project[] {
  return jsonArray.map(mapToProject);
}

export function mapToProjectJson(project: Project): ProjectJson {
  return {
    project_id: project.id,
    name: project.name,
    archived: project.archived,
    color: project.color,
  };
}
