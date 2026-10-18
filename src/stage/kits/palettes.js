export const CHARACTER_KITS = ["boy", "girl", "elder", "cow", "host"];

export const CHARACTER_VARIANTS = [
  { cloth: "#1f4e5f", accent: "#c45c3e", skin: "#e8b894", hair: "#2b2118" },
  { cloth: "#7c2d12", accent: "#f59e0b", skin: "#f1c7a4", hair: "#3f2a1a" },
  { cloth: "#1e1b4b", accent: "#94a3b8", skin: "#d4a574", hair: "#111827" },
  { cloth: "#365314", accent: "#fde68a", skin: "#efc2a0", hair: "#292524" },
];

export const SET_KITS = ["folkDusk", "mistForest", "mysteryLane", "lampRoom", "marketStreet", "folkMeadow", "village", "forest", "room", "street", "dusk"];

export const SET_VARIANTS = [
  { sky: "#1b1433", mid: "#4a2a4a", warm: "#c45c3e", gold: "#f0a36b", ground: "#24160f" },
  { sky: "#10261c", mid: "#1a3324", warm: "#4a3b2a", gold: "#c4b59a", ground: "#07130e" },
  { sky: "#0f172a", mid: "#1e293b", warm: "#334155", gold: "#fbbf24", ground: "#020617" },
  { sky: "#fff7ed", mid: "#fed7aa", warm: "#9a3412", gold: "#fde68a", ground: "#431407" },
];

export function cycleVariant(current, total) {
  return ((current ?? 0) + 1) % total;
}

export function isSetKit(kit) {
  return SET_KITS.includes(kit) && !CHARACTER_KITS.includes(kit);
}
