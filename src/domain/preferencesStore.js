import { defaultPreferences } from "./projectDefaults";

// FUTURE: replace localStore with API + DB.
// This Dexie helper is leftover from the POC and is unused by Phase 1 profiles.
export async function loadPreferences() {
  return defaultPreferences;
}

export async function persistPreferences(preferences) {
  return { ...defaultPreferences, ...preferences, id: "operator" };
}
