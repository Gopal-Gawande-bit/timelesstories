const KEYS = {
  profiles: "timeless.preferenceProfiles",
  activeProfileId: "timeless.activeProfileId",
  project: "timeless.project",
};

function readJson(key, fallback) {
  // FUTURE: persist via backend API
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  // FUTURE: persist via backend API
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadProfilesFromLocal(fallback) {
  // FUTURE: GET /api/preference-profiles
  const saved = readJson(KEYS.profiles, null);
  return Array.isArray(saved) && saved.length ? saved : fallback;
}

export function saveProfilesToLocal(profiles) {
  // FUTURE: PUT /api/preference-profiles
  writeJson(KEYS.profiles, profiles);
}

export function loadActiveProfileId(fallbackId) {
  // FUTURE: GET /api/operator/active-profile
  return localStorage.getItem(KEYS.activeProfileId) || fallbackId;
}

export function saveActiveProfileId(id) {
  // FUTURE: PUT /api/operator/active-profile
  localStorage.setItem(KEYS.activeProfileId, id);
}

export function loadProjectFromLocal(fallback) {
  // FUTURE: GET /api/projects/current
  return readJson(KEYS.project, fallback);
}

export function saveProjectToLocal(project) {
  // FUTURE: PUT /api/projects/:id
  writeJson(KEYS.project, project);
}
