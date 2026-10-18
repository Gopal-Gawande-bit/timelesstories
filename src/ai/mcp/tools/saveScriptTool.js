import { loadProjectFromLocal, saveProjectToLocal } from "../../../domain/localStore";

export async function saveScriptTool(project) {
  // FUTURE: MCP tool that writes Project.script through the backend.
  const current = loadProjectFromLocal(project);
  const next = { ...current, ...project, updatedAt: Date.now() };
  saveProjectToLocal(next);
  return next;
}
