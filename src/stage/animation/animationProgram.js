const SOURCE_HEADER = `/**
 * Timeless Stories — animation program for THIS video.
 *
 * The Stage player runs this file. The app host stays small; this object is the cut.
 *
 * How to improve it elsewhere:
 * 1. Copy this whole file into another LLM.
 * 2. Ask for camera, timing, kits, caption, or palette changes.
 * 3. Keep the contract: function createProgram() { return { ... } }
 * 4. Paste or upload the result here and press Apply this code.
 *
 * Clip fields the player understands:
 *   id, sceneId, sceneIndex, durationFrames, voLine, action
 *   bgKit, actorKit, bgVariant, actorVariant
 *   camera: { move: "kenBurns" | "pan" | "dolly-shake", intensity, from, to }
 *   captionSize, captionRotate, palette: { sky, bubble, ink }
 */

`;

function layerKit(shot, kind, fallback) {
  return (shot.layers ?? []).find((layer) => layer.kind === kind)?.kit ?? fallback;
}

function layerVariant(shot, kind) {
  return (shot.layers ?? []).find((layer) => layer.kind === kind)?.variant ?? 0;
}

export function buildAnimationProgramFromProject(project) {
  const clips = [];
  (project.scenes ?? []).forEach((scene, sceneIndex) => {
    (scene.shots ?? []).forEach((shot, shotIndex) => {
      clips.push({
        id: shot.id,
        sceneId: scene.id,
        sceneIndex,
        shotIndex,
        durationFrames: Math.max(shot.durationFrames ?? 30, 10),
        voLine: shot.voLine || "",
        action: shot.action || scene.heading || "",
        bgKit: layerKit(shot, "bg", "folkDusk"),
        actorKit: layerKit(shot, "character", "boy"),
        bgVariant: layerVariant(shot, "bg"),
        actorVariant: layerVariant(shot, "character"),
        camera: {
          angle: shot.camera?.angle ?? "medium",
          move: shot.camera?.move ?? "kenBurns",
          intensity: shot.camera?.intensity ?? 0.4,
          from: shot.camera?.from ?? { x: 0, y: 0, scale: 1, rotate: 0 },
          to: shot.camera?.to ?? { x: -16, y: 8, scale: 1.12, rotate: 0 },
        },
        captionSize: 42,
        captionRotate: -1.5,
        palette: {
          sky: "#1b1433",
          bubble: "#FFF18A",
          ink: "#28213B",
        },
      });
    });
  });

  return {
    version: 1,
    title: project.script?.workingTitle || project.name || "Untitled",
    mode: project.animationMode ?? "2d",
    background: "#111827",
    revision: 1,
    notes: [],
    clips,
  };
}

export function serializeAnimationSource(program) {
  return `${SOURCE_HEADER}function createProgram() {
  return ${JSON.stringify(program, null, 2)};
}
`;
}

function validateProgram(program) {
  if (!program || typeof program !== "object") {
    throw new Error("Animation code must return an object.");
  }
  if (!Array.isArray(program.clips) || !program.clips.length) {
    throw new Error("createProgram() must return { clips: [ ...at least one clip ] }.");
  }
  return {
    version: program.version ?? 1,
    title: program.title ?? "Untitled",
    mode: program.mode === "3d" ? "3d" : "2d",
    background: program.background ?? "#111827",
    revision: program.revision ?? 1,
    notes: program.notes ?? [],
    clips: program.clips.map((clip, index) => ({
      id: clip.id || `clip-${index + 1}`,
      sceneId: clip.sceneId || `scene-${clip.sceneIndex ?? 0}`,
      sceneIndex: clip.sceneIndex ?? 0,
      shotIndex: clip.shotIndex ?? index,
      durationFrames: Math.max(Number(clip.durationFrames) || 30, 10),
      voLine: clip.voLine || "",
      action: clip.action || "",
      bgKit: clip.bgKit || "folkDusk",
      actorKit: clip.actorKit || "boy",
      bgVariant: clip.bgVariant ?? 0,
      actorVariant: clip.actorVariant ?? 0,
      camera: {
        angle: clip.camera?.angle ?? "medium",
        move: clip.camera?.move ?? "kenBurns",
        intensity: clip.camera?.intensity ?? 0.4,
        from: clip.camera?.from ?? { x: 0, y: 0, scale: 1, rotate: 0 },
        to: clip.camera?.to ?? { x: -16, y: 8, scale: 1.12, rotate: 0 },
      },
      captionSize: clip.captionSize ?? 42,
      captionRotate: clip.captionRotate ?? -1.5,
      palette: {
        sky: clip.palette?.sky ?? "#1b1433",
        bubble: clip.palette?.bubble ?? "#FFF18A",
        ink: clip.palette?.ink ?? "#28213B",
      },
    })),
  };
}

export function compileAnimationSource(source) {
  const text = String(source || "").trim();
  if (!text) throw new Error("Animation code is empty.");

  if (text.startsWith("{")) {
    return validateProgram(JSON.parse(text));
  }

  const cleaned = text.replace(/^export\s+default\s+/m, "").replace(/^export\s+(function|const|let|var)/gm, "$1");

  const runner = new Function(
    `"use strict";
    ${cleaned}
    if (typeof createProgram === "function") return createProgram();
    if (typeof program !== "undefined") return program;
    throw new Error("Keep function createProgram() { return { clips: [...] } }");`,
  );

  return validateProgram(runner());
}

export function ensureAnimationSource(project) {
  if (project.animationSource?.trim()) {
    try {
      compileAnimationSource(project.animationSource);
      return project;
    } catch {
      // fall through and rebuild
    }
  }
  const program = buildAnimationProgramFromProject(project);
  return {
    ...project,
    animationSource: serializeAnimationSource(program),
  };
}

export function programDurationFrames(program) {
  return (program?.clips ?? []).reduce((sum, clip) => sum + (clip.durationFrames ?? 0), 0);
}

export function scenesFromProgram(program, previousScenes = []) {
  const prevById = Object.fromEntries((previousScenes ?? []).map((scene) => [scene.id, scene]));
  const groups = [];
  const order = [];

  for (const clip of program.clips) {
    const key = clip.sceneId || `scene-${clip.sceneIndex}`;
    if (!order.includes(key)) order.push(key);
    const bucket = groups[key] ?? (groups[key] = []);
    bucket.push(clip);
  }

  return order.map((sceneId, sceneIndex) => {
    const clips = groups[sceneId];
    const prev = prevById[sceneId];
    return {
      id: sceneId,
      heading: prev?.heading || clips[0]?.action || `Scene ${sceneIndex + 1}`,
      shots: clips.map((clip, shotIndex) => ({
        id: clip.id,
        durationFrames: clip.durationFrames,
        voLine: clip.voLine,
        action: clip.action,
        camera: clip.camera,
        setId: prev?.shots?.[shotIndex]?.setId,
        characterIds: prev?.shots?.[shotIndex]?.characterIds ?? [],
        layers: [
          { kind: "bg", kit: clip.bgKit, variant: clip.bgVariant },
          { kind: "character", kit: clip.actorKit, variant: clip.actorVariant },
        ],
      })),
    };
  });
}

function effectsFromNote(note) {
  const t = String(note || "").toLowerCase();
  const fx = {
    matched: false,
    move: null,
    intensity: null,
    toScale: null,
    toX: null,
    durationScale: 1,
    captionScale: 1,
    captionRotate: null,
    palette: {},
    bgKit: null,
  };

  if (/slow|धीमे|calm|soft|quiet|शांत/.test(t)) {
    fx.matched = true;
    fx.move = "kenBurns";
    fx.intensity = 0.2;
    fx.toScale = 1.1;
    fx.durationScale = 1.18;
  }
  if (/fast|तेज|brisk|energy|slide/.test(t)) {
    fx.matched = true;
    fx.move = "pan";
    fx.intensity = 0.58;
    fx.toX = -56;
    fx.durationScale = 0.88;
  }
  if (/dramatic|shake|intense|mystery|रहस्य/.test(t)) {
    fx.matched = true;
    fx.move = "dolly-shake";
    fx.intensity = 0.72;
    fx.toScale = 1.24;
  }
  if (/close|closer|zoom|पास|निकट/.test(t)) {
    fx.matched = true;
    fx.toScale = 1.3;
    fx.captionScale = 1.12;
  }
  if (/wide|wide shot|दूर/.test(t)) {
    fx.matched = true;
    fx.toScale = 1.05;
    fx.move = fx.move ?? "kenBurns";
  }
  if (/bigger text|large caption|बड़ा पाठ|बड़ा/.test(t)) {
    fx.matched = true;
    fx.captionScale = 1.28;
  }
  if (/smaller text|छोटा/.test(t)) {
    fx.matched = true;
    fx.captionScale = 0.82;
  }
  if (/dusk|शाम|evening|sunset/.test(t)) {
    fx.matched = true;
    fx.bgKit = "folkDusk";
    fx.palette.sky = "#2a1638";
    fx.palette.bubble = "#FFD27A";
  }
  if (/forest|जंगल/.test(t)) {
    fx.matched = true;
    fx.bgKit = "mistForest";
    fx.palette.sky = "#14261c";
  }
  if (/night|रात|dark/.test(t)) {
    fx.matched = true;
    fx.palette.sky = "#0b1020";
    fx.palette.bubble = "#E8F0FF";
  }

  if (!fx.matched) {
    fx.move = "kenBurns";
    fx.intensity = 0.48;
    fx.toScale = 1.18;
    fx.captionScale = 1.1;
    fx.palette.bubble = "#FFE27A";
  }

  return fx;
}

function applyEffectsToClip(clip, fx) {
  const to = { ...(clip.camera?.to ?? { x: -16, y: 8, scale: 1.12, rotate: 0 }) };
  if (fx.toScale != null) to.scale = fx.toScale;
  if (fx.toX != null) to.x = fx.toX;

  return {
    ...clip,
    durationFrames: Math.max(10, Math.round(clip.durationFrames * fx.durationScale)),
    bgKit: fx.bgKit ?? clip.bgKit,
    captionSize: Math.round((clip.captionSize ?? 42) * fx.captionScale),
    captionRotate: fx.captionRotate ?? clip.captionRotate,
    palette: { ...clip.palette, ...fx.palette },
    camera: {
      ...clip.camera,
      move: fx.move ?? clip.camera.move,
      intensity: fx.intensity ?? clip.camera.intensity,
      to,
    },
  };
}

export function applyNoteToProgram(program, note, predicate) {
  const fx = effectsFromNote(note);
  return {
    ...program,
    revision: (program.revision ?? 1) + 1,
    notes: [...(program.notes ?? []), note].slice(-12),
    clips: program.clips.map((clip) => (predicate(clip) ? applyEffectsToClip(clip, fx) : clip)),
  };
}

export function applySceneNoteToSource(source, sceneId, note) {
  const program = applyNoteToProgram(compileAnimationSource(source), note, (clip) => clip.sceneId === sceneId);
  return serializeAnimationSource(program);
}

export function applyVideoNoteToSource(source, note) {
  const program = applyNoteToProgram(compileAnimationSource(source), note, () => true);
  return serializeAnimationSource(program);
}

export function projectWithProgram(project, source) {
  const program = compileAnimationSource(source);
  return {
    ...project,
    animationSource: serializeAnimationSource(program),
    animationMode: program.mode,
    scenes: scenesFromProgram(program, project.scenes),
  };
}

export function getAnimationPackageJson() {
  return JSON.stringify(
    {
      name: "timeless-stories-animation",
      private: true,
      type: "module",
      description: "Packages the Stage player uses to draw this video",
      dependencies: {
        remotion: "^4.0.409",
        "@remotion/player": "^4.0.409",
        "@remotion/transitions": "^4.0.536",
        "@remotion/three": "^4.0.536",
        "@remotion/motion-blur": "^4.0.536",
        "@remotion/gsap": "^4.0.409",
        gsap: "^3.13.0",
        three: "^0.170.0",
        motion: "^12.23.24",
      },
    },
    null,
    2,
  );
}

export function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
