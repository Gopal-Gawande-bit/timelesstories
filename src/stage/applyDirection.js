import { applySceneNoteToSource, applyVideoNoteToSource, projectWithProgram } from "./animation/animationProgram";

export function applySceneDirection(project, sceneId, note) {
  if (!note.trim() || !sceneId || !project.animationSource) return project;
  return projectWithProgram(project, applySceneNoteToSource(project.animationSource, sceneId, note));
}

export function applyVideoDirection(project, note) {
  if (!note.trim() || !project.animationSource) return project;
  return projectWithProgram(project, applyVideoNoteToSource(project.animationSource, note));
}
