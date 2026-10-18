import { loadActiveProfileId, loadProfilesFromLocal } from "../../../domain/localStore";
import { getDefaultProfile, seedPreferenceProfiles } from "../../../domain/preferenceProfiles";

export async function loadPreferencesTool() {
  // FUTURE: MCP tool that reads profiles from the backend.
  const profiles = loadProfilesFromLocal(seedPreferenceProfiles());
  const activeId = loadActiveProfileId(getDefaultProfile(profiles).id);
  return { profiles, activeId };
}
