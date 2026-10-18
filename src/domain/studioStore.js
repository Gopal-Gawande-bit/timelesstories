import { create } from "zustand";
import { createEmptyProject, defaultPreferences, LENGTHS } from "./projectDefaults";
import {
  loadActiveProfileId,
  loadProfilesFromLocal,
  loadProjectFromLocal,
  saveActiveProfileId,
  saveProfilesToLocal,
  saveProjectToLocal,
} from "./localStore";
import {
  createEmptyProfile,
  getDefaultProfile,
  normalizeProfile,
  seedPreferenceProfiles,
} from "./preferenceProfiles";
import { demoProject } from "../remotion/demo/demoProject";

function cloneDemo() {
  return structuredClone(demoProject);
}

function withScriptDefaults(project) {
  return {
    ...project,
    scriptVersions: project.scriptVersions ?? [],
    scenes: project.scenes ?? [],
    cast: project.cast ?? [],
    sets: project.sets ?? [],
    deliveryFormat: project.deliveryFormat ?? project.format ?? "youtube",
    stageInstructions: project.stageInstructions ?? "",
    animationMode: project.animationMode ?? "2d",
    animationSource: project.animationSource ?? "",
    voiceover: {
      id: null,
      fileName: null,
      durationSeconds: null,
      ...project.voiceover,
    },
    script: {
      logline: "",
      meta: null,
      ...project.script,
    },
  };
}

export const useStudioStore = create((set, get) => ({
  ready: false,
  preferences: defaultPreferences,
  profiles: [],
  activeProfileId: null,
  project: withScriptDefaults(cloneDemo()),

  async hydrate() {
    // FUTURE: persist via backend API
    const profiles = loadProfilesFromLocal(seedPreferenceProfiles()).map(normalizeProfile);
    const activeProfileId = loadActiveProfileId(getDefaultProfile(profiles).id);
    const project = withScriptDefaults(loadProjectFromLocal(cloneDemo()));
    const active = profiles.find((profile) => profile.id === activeProfileId) ?? getDefaultProfile(profiles);

    saveProfilesToLocal(profiles);
    saveActiveProfileId(active.id);
    saveProjectToLocal(project);

    set({
      ready: true,
      profiles,
      activeProfileId: active.id,
      preferences: active,
      project,
    });
  },

  async savePreferences(partial) {
    const { profiles, activeProfileId } = get();
    const nextProfiles = profiles.map((profile) =>
      profile.id === activeProfileId ? { ...profile, ...partial } : profile,
    );
    // FUTURE: persist via backend API
    saveProfilesToLocal(nextProfiles);
    const active = nextProfiles.find((profile) => profile.id === activeProfileId);
    set({ profiles: nextProfiles, preferences: active });
  },

  async updateProject(updater) {
    const current = get().project;
    const next = typeof updater === "function" ? updater(current) : { ...current, ...updater };
    const project = withScriptDefaults({ ...next, updatedAt: Date.now() });
    // FUTURE: persist via backend API
    saveProjectToLocal(project);
    set({ project });
  },

  async newProject() {
    const active = get().profiles.find((profile) => profile.id === get().activeProfileId);
    const project = withScriptDefaults(createEmptyProject(active ?? defaultPreferences));
    saveProjectToLocal(project);
    set({ project });
  },

  async loadDemo() {
    const project = withScriptDefaults(cloneDemo());
    saveProjectToLocal(project);
    set({ project });
  },

  setActiveProfile(id) {
    const profile = get().profiles.find((item) => item.id === id);
    if (!profile) return;
    // FUTURE: persist via backend API
    saveActiveProfileId(id);
    set({ activeProfileId: id, preferences: profile });
  },

  createProfile(partial) {
    const profile = createEmptyProfile(partial);
    const profiles = [...get().profiles, profile];
    saveProfilesToLocal(profiles);
    saveActiveProfileId(profile.id);
    set({ profiles, activeProfileId: profile.id, preferences: profile });
    return profile;
  },

  updateProfile(id, partial) {
    const profiles = get().profiles.map((profile) =>
      profile.id === id ? { ...profile, ...partial } : profile,
    );
    saveProfilesToLocal(profiles);
    const activeId = get().activeProfileId;
    const active = profiles.find((profile) => profile.id === activeId);
    set({ profiles, preferences: active });
  },

  duplicateProfile(id) {
    const source = get().profiles.find((profile) => profile.id === id);
    if (!source) return null;
    const copy = createEmptyProfile({
      ...source,
      id: crypto.randomUUID(),
      name: `${source.name} copy`,
      isDefault: false,
    });
    const profiles = [...get().profiles, copy];
    saveProfilesToLocal(profiles);
    saveActiveProfileId(copy.id);
    set({ profiles, activeProfileId: copy.id, preferences: copy });
    return copy;
  },

  deleteProfile(id) {
    const remaining = get().profiles.filter((profile) => profile.id !== id);
    if (!remaining.length) return;
    if (remaining.every((profile) => !profile.isDefault)) {
      remaining[0].isDefault = true;
    }
    const activeId = get().activeProfileId === id ? getDefaultProfile(remaining).id : get().activeProfileId;
    saveProfilesToLocal(remaining);
    saveActiveProfileId(activeId);
    const active = remaining.find((profile) => profile.id === activeId);
    set({ profiles: remaining, activeProfileId: activeId, preferences: active });
  },

  setDefaultProfile(id) {
    const profiles = get().profiles.map((profile) => ({
      ...profile,
      isDefault: profile.id === id,
    }));
    saveProfilesToLocal(profiles);
    set({ profiles });
  },

  applyProfileToProject(profile) {
    const length = LENGTHS.find((item) => item.id === profile.lengthId);
    return get().updateProject((current) => ({
      ...current,
      genre: profile.genre,
      format: profile.lengthId === "reel" ? "reels" : current.format || "youtube",
      script: {
        ...current.script,
        language: profile.language,
        type: profile.scriptType,
        lengthId: profile.lengthId,
        lengthSeconds: length?.seconds ?? current.script.lengthSeconds,
      },
    }));
  },
}));
