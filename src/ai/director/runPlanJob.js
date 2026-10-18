import { SET_KITS } from "../../stage/kits/palettes";
import { inferMood, setKitForMood } from "../../stage/generateLooks";

function splitBeats(script) {
  const parts = String(script || "")
    .split(/\n+|(?<=[।.?!])\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 8);
  return parts.length ? parts : ["कहानी शुरू होती है।"];
}

function inferKitFromText(text) {
  const t = text.toLowerCase();
  if (/गाय|cow|बैल/.test(t)) return "cow";
  if (/लड़की|girl|बेटी|स्त्री|औरत/.test(t)) return "girl";
  if (/बूढ़|elder|दादी|दादा/.test(t)) return "elder";
  if (/लड़का|boy|बेटा|युवक/.test(t)) return "boy";
  if (/मैं |हम |podcast|host/.test(t)) return "host";
  return "boy";
}

function inferLocation(text, index, mood) {
  const t = text.toLowerCase();
  if (/जंगल|forest|पेड़/.test(t)) return { location: "Forest path", kit: setKitForMood(mood, "forest") };
  if (/घर|room|आँगन|कमरा/.test(t)) return { location: "Inside a house", kit: setKitForMood(mood, "room") };
  if (/गली|सड़क|street|बाजार/.test(t)) return { location: "Lane", kit: setKitForMood(mood, "street") };
  if (/शाम|dusk|सूरज/.test(t)) return { location: "Dusk fields", kit: setKitForMood(mood, "dusk") };
  const fallback = ["village", "forest", "dusk", "street"][index % 4];
  return { location: `Place ${index + 1}`, kit: setKitForMood(mood, fallback) };
}

function cameraFor(instructions, index) {
  const t = String(instructions || "").toLowerCase();
  if (/slow|धीमे|शांत|calm|soft/.test(t)) {
    return {
      angle: "wide",
      move: "kenBurns",
      intensity: 0.22,
      from: { x: 0, y: 0, scale: 1, rotate: 0 },
      to: { x: -16, y: 8, scale: 1.1, rotate: 0 },
    };
  }
  if (/dramatic|mystery|रहस्य|intense|shake/.test(t)) {
    return {
      angle: index % 2 ? "close" : "medium",
      move: "dolly-shake",
      intensity: 0.65,
      from: { x: 8, y: 12, scale: 1.04, rotate: 0 },
      to: { x: -10, y: -8, scale: 1.2, rotate: -0.4 },
    };
  }
  if (/fast|तेज|brisk|energy/.test(t)) {
    return {
      angle: "medium",
      move: "pan",
      intensity: 0.55,
      from: { x: 48, y: 0, scale: 1.05, rotate: 0 },
      to: { x: -48, y: 6, scale: 1.12, rotate: 0 },
    };
  }
  const moves = ["kenBurns", "pan", "dolly-shake"];
  const move = moves[index % moves.length];
  return {
    angle: ["wide", "medium", "close"][index % 3],
    move,
    intensity: 0.4,
    from: { x: 0, y: 0, scale: 1, rotate: 0 },
    to: { x: move === "pan" ? -36 : 10, y: 8, scale: move === "kenBurns" ? 1.14 : 1.08, rotate: 0 },
  };
}

export function runPlanJob({
  script,
  durationSeconds,
  fps = 30,
  title = "Untitled",
  instructions = "",
}) {
  const mood = inferMood(instructions, script);
  const beats = splitBeats(script);
  const total = Math.max(durationSeconds || beats.length * 8, beats.length * 5);
  const per = total / beats.length;
  const characters = new Map();
  const locations = new Map();
  const scenes = [];
  let scene = null;
  let time = 0;
  let sceneIndex = 0;

  beats.forEach((line, index) => {
    const kit = inferKitFromText(line);
    if (!characters.has(kit)) {
      characters.set(kit, {
        id: `cast-${kit}`,
        role: kit,
        kit,
        variant: 0,
        locked: false,
        assetId: null,
      });
    }
    const loc = inferLocation(line, index, mood);
    if (!locations.has(loc.location)) {
      locations.set(loc.location, {
        id: `set-${locations.size}`,
        location: loc.location,
        kit: loc.kit,
        variant: 0,
        locked: false,
        assetId: null,
      });
    }
    const set = locations.get(loc.location);
    const durationFrames = Math.max(Math.round(per * fps), Math.round(5 * fps));
    const shot = {
      id: `shot-${index + 1}`,
      durationFrames,
      voInSeconds: time,
      voOutSeconds: time + durationFrames / fps,
      action: line.slice(0, 160),
      voLine: line.slice(0, 110),
      camera: cameraFor(instructions, index),
      characterIds: [characters.get(kit).id],
      setId: set.id,
      layers: [
        { id: `bg-${index}`, kind: "bg", kit: set.kit, variant: 0, parallax: 0.12 },
        { id: `ch-${index}`, kind: "character", kit, variant: 0, parallax: 0.4 },
      ],
      sfxCue: null,
    };
    time += durationFrames / fps;

    const shouldNewScene = !scene || scene.shots.length >= 3 || scene.location !== loc.location;
    if (shouldNewScene) {
      sceneIndex += 1;
      scene = {
        id: `scene-${sceneIndex}`,
        intent: `${title} · scene ${sceneIndex}`,
        location: loc.location,
        timeOfDay: mood === "mystery" ? "night" : "day",
        mood,
        shots: [],
      };
      scenes.push(scene);
    }
    scene.shots.push(shot);
  });

  void SET_KITS;

  return {
    scenes,
    cast: [...characters.values()],
    sets: [...locations.values()],
    mood,
  };
}
