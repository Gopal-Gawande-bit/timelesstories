export const GENRES = [
  { id: "folk", label: "Folk story" },
  { id: "mystery", label: "Mystery" },
  { id: "explanation", label: "Explanation" },
  { id: "kids", label: "Kids" },
  { id: "podcast", label: "Podcast-like" },
];

export const SCRIPT_TYPES = [
  { id: "narrative", label: "Story" },
  { id: "dialogue", label: "Dialogue" },
  { id: "podcast", label: "Podcast" },
  { id: "essay", label: "Explainer" },
  { id: "kids", label: "Kids" },
];

export const LENGTHS = [
  { id: "short", label: "About 1 min voiceover", seconds: 75 },
  { id: "standard", label: "4–5 min voiceover", seconds: 270 },
  { id: "long", label: "8–12 min voiceover", seconds: 600 },
  { id: "reel", label: "Reel (20–45s)", seconds: 30 },
];

export const FORMATS = [
  {
    id: "youtube",
    label: "YouTube long",
    platform: "YouTube long-form",
    ratio: "16:9",
    width: 1920,
    height: 1080,
    orientation: "landscape",
  },
  {
    id: "shorts",
    label: "YouTube Shorts",
    platform: "YouTube Shorts",
    ratio: "9:16",
    width: 1080,
    height: 1920,
    orientation: "portrait",
  },
  {
    id: "instagram",
    label: "Instagram Reels",
    platform: "Instagram Reels",
    ratio: "9:16",
    width: 1080,
    height: 1920,
    orientation: "portrait",
  },
  {
    id: "reels",
    label: "Instagram Reels",
    platform: "Instagram Reels",
    ratio: "9:16",
    width: 1080,
    height: 1920,
    orientation: "portrait",
  },
];

export const STAGE_FORMATS = FORMATS.filter((item) => ["youtube", "shorts", "instagram"].includes(item.id));

export const TONES = [
  { id: "warm-oral", label: "Warm oral (dadi / village teller)" },
  { id: "hushed-mystery", label: "Hushed mystery" },
  { id: "clear-teacher", label: "Clear teacher / explainer" },
  { id: "gentle-kids", label: "Gentle kids" },
  { id: "podcast-intimate", label: "Intimate podcast" },
];

export const AUDIENCES = [
  { id: "general", label: "General Hindi YouTube" },
  { id: "family", label: "Family" },
  { id: "kids", label: "Kids" },
  { id: "young-adult", label: "Young adult" },
];

export const POVS = [
  { id: "narrator", label: "Third-person narrator" },
  { id: "first", label: "First person" },
  { id: "host", label: "Host speaking to camera" },
];

export const NARRATION_STYLES = [
  { id: "spoken-vo", label: "Spoken voiceover" },
  { id: "storyteller", label: "Storyteller cadence" },
  { id: "essay", label: "Essay / explainer" },
  { id: "dialogue-led", label: "Dialogue-led" },
];

export const WORDS_PER_MINUTE = 125;

export const defaultPreferences = {
  id: "operator",
  genre: "folk",
  scriptType: "narrative",
  lengthId: "standard",
  language: "hi",
  format: "youtube",
  tone: "warm-oral",
};

export function createEmptyProject(preferences = defaultPreferences) {
  const length = LENGTHS.find((item) => item.id === preferences.lengthId) ?? LENGTHS[1];
  const now = Date.now();

  return {
    id: crypto.randomUUID(),
    name: "Untitled story",
    format: preferences.format ?? "youtube",
    genre: preferences.genre ?? "folk",
    fps: 30,
    script: {
      workingTitle: "",
      language: preferences.language ?? "hi",
      type: preferences.scriptType ?? "narrative",
      lengthId: preferences.lengthId ?? "standard",
      lengthSeconds: length.seconds,
      body: "",
      logline: "",
      meta: null,
    },
    scriptVersions: [],
    scenes: [],
    publish: {
      title: "",
      description: "",
      thumbnailPrompt: "",
    },
    voiceover: {
      id: null,
      fileName: null,
      durationSeconds: null,
    },
    deliveryFormat: preferences.format ?? "youtube",
    cast: [],
    sets: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function getFormatSize(format) {
  return FORMATS.find((item) => item.id === format) ?? FORMATS[0];
}

export function getFormatMeta(format) {
  return getFormatSize(format);
}

export function getProjectDurationFrames(project) {
  return (project.scenes ?? []).reduce((sceneTotal, scene) => {
    const shotTotal = (scene.shots ?? []).reduce(
      (sum, shot) => sum + (shot.durationFrames ?? 0),
      0,
    );
    return sceneTotal + shotTotal;
  }, 0);
}
