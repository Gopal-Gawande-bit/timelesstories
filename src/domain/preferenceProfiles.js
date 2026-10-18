export function createEmptyProfile(partial = {}) {
  return {
    id: crypto.randomUUID(),
    name: "New preference",
    isDefault: false,
    genre: "folk",
    scriptType: "narrative",
    lengthId: "standard",
    language: "hi",
    instructions: "",
    ...partial,
  };
}

export function normalizeProfile(raw) {
  if (!raw) return createEmptyProfile();
  return createEmptyProfile({
    id: raw.id,
    name: raw.name,
    isDefault: Boolean(raw.isDefault),
    genre: raw.genre ?? "folk",
    scriptType: raw.scriptType ?? "narrative",
    lengthId: raw.lengthId ?? "standard",
    language: raw.language ?? "hi",
    instructions: raw.instructions || raw.customInstructions || "",
  });
}

export function seedPreferenceProfiles() {
  return [
    createEmptyProfile({
      id: "folk-hindi-standard",
      name: "Folk Hindi 4–5 min",
      isDefault: true,
      genre: "folk",
      scriptType: "narrative",
      lengthId: "standard",
      language: "hi",
      instructions: "Oral village voice. Short spoken sentences. Quiet moral, not a lecture.",
    }),
    createEmptyProfile({
      id: "mystery-reel",
      name: "Mystery reel",
      isDefault: false,
      genre: "mystery",
      scriptType: "narrative",
      lengthId: "reel",
      language: "hi",
      instructions: "Cold open on one concrete detail. One unanswered question.",
    }),
  ];
}

export function getDefaultProfile(profiles) {
  return profiles.find((profile) => profile.isDefault) ?? profiles[0];
}
