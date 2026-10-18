import Dexie from "dexie";

// FUTURE: replace with backend API. Phase 1 still uses localStorage for JSON.
// Stage uses IndexedDB for voiceover blobs, Lot assets, and cut versions.
export const db = new Dexie("timelessStoriesStudio");

db.version(1).stores({
  projects: "id, updatedAt, name",
  preferences: "id",
});

db.version(2).stores({
  projects: "id, updatedAt, name",
  preferences: "id",
  media: "id",
  assets: "id, kind, name, createdAt",
  cutVersions: "id, projectId, createdAt",
});
