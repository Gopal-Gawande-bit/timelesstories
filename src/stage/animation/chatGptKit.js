import { getFormatMeta } from "../../domain/projectDefaults";
import { CHARACTER_KITS, SET_KITS } from "../kits/palettes";

export const TEMPLATE_MARK = "TIMELESS_TEMPLATE";

export function getAnimationMode(project) {
  return project?.animationMode === "3d" ? "3d" : "2d";
}

export function isHouseTemplate(source) {
  const text = String(source || "");
  return (
    text.includes(TEMPLATE_MARK) ||
    text.includes("Open on dusk. Camera breathes") ||
    text.includes("2D Beat 1") ||
    text.includes("3D Beat 1")
  );
}

function clipText(text, max) {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  if (value.length <= max) return value;
  return `${value.slice(0, Math.max(1, max - 1)).trim()}…`;
}

function splitBeats(script) {
  const parts = String(script || "")
    .split(/(?<=[।.!?…])\s+|\n+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 4);
  if (!parts.length) {
    const fallback = String(script || "").trim();
    return fallback ? [fallback] : ["कहानी शुरू होती है।"];
  }
  const max = 8;
  if (parts.length <= max) return parts;
  return Array.from({ length: max }, (_, index) => {
    const at = Math.round((index / (max - 1)) * (parts.length - 1));
    return parts[at];
  });
}

function kickerFrom(line) {
  const clean = String(line || "").replace(/[।.!?…]+$/g, "").trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length <= 6) return clean;
  return words.slice(0, 5).join(" ");
}

export function inferStoryFields(scriptBody, stored = {}) {
  const script = String(scriptBody || "").trim();
  const beats = splitBeats(script);
  const storedTitle = String(stored.workingTitle || stored.title || "").trim();
  const title =
    storedTitle && script.includes(storedTitle) ? storedTitle : kickerFrom(beats[0] || script) || "यह कहानी";
  const logline = clipText(beats[0] || script || stored.logline || "", 110);
  return { title, logline, beats };
}

function jsxText(value) {
  return JSON.stringify(String(value ?? ""));
}

const SHARED_DEPS = {
  remotion: "^4.0.409",
  "@remotion/player": "^4.0.409",
  "@remotion/transitions": "^4.0.536",
  react: "^19.2.0",
  tone: "^15.1.22",
  zzfx: "^1.4.0",
};

export function getAnimationPackageJson(project) {
  const mode = getAnimationMode(project);
  const format = getFormatMeta(project?.deliveryFormat || project?.format);
  const dependencies =
    mode === "3d"
      ? {
          ...SHARED_DEPS,
          "@remotion/three": "^4.0.536",
          three: "^0.170.0",
          "@remotion/motion-blur": "^4.0.536",
        }
      : {
          ...SHARED_DEPS,
          gsap: "^3.13.0",
          "@remotion/gsap": "^4.0.409",
          "@remotion/motion-blur": "^4.0.536",
          motion: "^12.23.24",
        };

  return JSON.stringify(
    {
      name: "timeless-stories-animation",
      private: true,
      type: "module",
      description:
        mode === "3d"
          ? "3D pipeline — write Remotion + Three (@remotion/three). Do not fall back to 2D SVG cartoons."
          : "2D pipeline — write Remotion motion-comic (GSAP / springs / KitSvg). Do not use Three.js.",
      timeless: {
        pipeline: mode,
        format: format.id,
        platform: format.platform,
        ratio: format.ratio,
        width: format.width,
        height: format.height,
      },
      dependencies,
    },
    null,
    2,
  );
}

function timingHeader(project) {
  const fps = project.fps || 30;
  const seconds = Math.max(8, Math.round(project.voiceover?.durationSeconds || 24));
  return { fps, seconds, durationInFrames: seconds * fps };
}

function channelBugSnippet(format) {
  const pos =
    format.id === "youtube"
      ? 'left: 48, bottom: 40, top: "auto", right: "auto"'
      : format.id === "instagram"
        ? 'left: 36, top: 80, bottom: "auto", right: "auto"'
        : 'left: 40, top: 88, bottom: "auto", right: "auto"';

  return `function ChannelBug() {
  return (
    <div
      style={{
        position: "absolute",
        ${pos},
        zIndex: 30,
        padding: "10px 14px",
        borderRadius: 999,
        border: "1px solid rgba(255,248,231,0.35)",
        background: "rgba(9,8,12,0.45)",
        color: "#FFF8E7",
        fontSize: 18,
        letterSpacing: 3,
        textTransform: "uppercase",
        fontFamily: "Georgia, serif",
      }}
    >
      Timeless Stories
    </div>
  );
}
`;
}

function formatCaptionBox(isPortrait) {
  if (isPortrait) {
    return {
      left: 48,
      right: 48,
      top: "14%",
      bottom: "auto",
      titleSize: 22,
      bodySize: 44,
    };
  }
  return {
    left: 72,
    right: 72,
    top: "18%",
    bottom: "auto",
    titleSize: 28,
    bodySize: 64,
  };
}

function get2dTemplate(project) {
  const { fps, durationInFrames } = timingHeader(project);
  const format = getFormatMeta(project.deliveryFormat || project.format);
  const story = inferStoryFields(project.script?.body, project.script);
  const lines = [0, 1, 2].map((index) => story.beats[Math.min(index, story.beats.length - 1)]);
  const caption = formatCaptionBox(format.orientation === "portrait");
  return `// ${TEMPLATE_MARK} 2d ${format.id}
// FORMAT: ${format.platform} ${format.ratio} ${format.width}x${format.height}
import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { CodedBed, CodedSfx } from "./CodedSound";

export const fps = ${fps};
export const durationInFrames = ${durationInFrames};

${channelBugSnippet(format)}
function Beat({ title, body, color, fromColor }) {
  const frame = useCurrentFrame();
  const { fps: clipFps, durationInFrames: dur } = useVideoConfig();
  const enter = spring({ frame, fps: clipFps, config: { damping: 14, stiffness: 90 } });
  const drift = interpolate(frame, [0, dur], [0, -36], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [dur - 12, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: \`linear-gradient(160deg, \${fromColor} 0%, \${color} 70%)\`,
        overflow: "hidden",
      }}
    >
      <KitSvg kit="folkDusk" style={{ position: "absolute", inset: 0, opacity: 0.35 }} />
      <div
        style={{
          position: "absolute",
          inset: "-10%",
          background:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.14), transparent 40%), radial-gradient(circle at 80% 80%, rgba(0,0,0,0.25), transparent 45%)",
          transform: \`translateY(\${drift}px) scale(\${1.04 + enter * 0.06})\`,
        }}
      />
      <CartoonActor kit="boy" frame={frame} />
      <div
        style={{
          position: "absolute",
          left: ${caption.left},
          right: ${caption.right},
          top: "${caption.top}",
          zIndex: 4,
          opacity: fadeOut,
          transform: \`translateY(\${(1 - enter) * 40}px) scale(\${0.92 + enter * 0.08})\`,
          color: "#FFF8E7",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: ${caption.titleSize}, letterSpacing: 6, textTransform: "uppercase", opacity: 0.7 }}>{title}</div>
        <div style={{ marginTop: 22, fontSize: ${caption.bodySize}, lineHeight: 1.15, fontWeight: 700 }}>{body}</div>
      </div>
    </AbsoluteFill>
  );
}

export default function StoryVideo({ audioSrc }) {
  const beat = Math.max(20, Math.floor(durationInFrames / 3));

  return (
    <AbsoluteFill style={{ background: "#09080c" }}>
      {audioSrc ? <Audio src={audioSrc} /> : null}
      <CodedBed mood="folk" volume={0.12} />
      <CodedSfx from={beat} patch={[0.35, 0, 280, 0.02, 0.06, 0.18, 0, 1.4, -0.45, 0, 0, 0, 0, 0.35]} />
      <CodedSfx from={beat * 2} patch={[0.28, 0, 190, 0.01, 0.04, 0.14, 0, 1.1, -0.3, 0, 0, 0, 0, 0.25]} />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={beat}>
          <Beat title={${jsxText(kickerFrom(lines[0]))}} body={${jsxText(lines[0])}} color="#3b1d32" fromColor="#120c18" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 10 })} />
        <TransitionSeries.Sequence durationInFrames={beat}>
          <Beat title={${jsxText(kickerFrom(lines[1]))}} body={${jsxText(lines[1])}} color="#1d2f3b" fromColor="#0c1418" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 10 })} />
        <TransitionSeries.Sequence durationInFrames={Math.max(20, durationInFrames - beat * 2)}>
          <Beat title={${jsxText(kickerFrom(lines[2]))}} body={${jsxText(lines[2])}} color="#2a2316" fromColor="#120e0a" />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <ChannelBug />
    </AbsoluteFill>
  );
}
`;
}

function get3dTemplate(project) {
  const { fps, durationInFrames } = timingHeader(project);
  const format = getFormatMeta(project.deliveryFormat || project.format);
  const story = inferStoryFields(project.script?.body, project.script);
  const lines = [0, 1, 2].map((index) => story.beats[Math.min(index, story.beats.length - 1)]);
  const isPortrait = format.orientation === "portrait";
  return `// ${TEMPLATE_MARK} 3d ${format.id}
// FORMAT: ${format.platform} ${format.ratio} ${format.width}x${format.height}
import React from "react";
import { AbsoluteFill, Audio, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { CodedBed, CodedSfx } from "./CodedSound";

export const fps = ${fps};
export const durationInFrames = ${durationInFrames};

${channelBugSnippet(format)}
function World({ sky, accent }) {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames: dur } = useVideoConfig();
  const z = interpolate(frame, [0, dur], [7.2, 4.4], { extrapolateRight: "clamp" });
  const x = interpolate(frame, [0, dur], [-0.55, 0.55], { extrapolateRight: "clamp" });
  const bob = Math.sin(frame * 0.16) * 0.1;

  return (
    <ThreeCanvas width={width} height={height} camera={{ fov: 48, position: [x, 1.2, z] }}>
      <color attach="background" args={[sky]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 9, 6]} intensity={1.35} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.45, 0]}>
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial color="#1a120c" />
      </mesh>
      <mesh position={[x * 0.4, -0.2 + bob, 0]}>
        <cylinderGeometry args={[0.45, 0.55, 1.4, 18]} />
        <meshStandardMaterial color={accent} />
      </mesh>
      <mesh position={[x * 0.4, 0.92 + bob, 0.04]}>
        <sphereGeometry args={[0.4, 24, 24]} />
        <meshStandardMaterial color="#FFD0A6" />
      </mesh>
    </ThreeCanvas>
  );
}

function Beat({ title, body, sky, accent }) {
  const frame = useCurrentFrame();
  const { fps: clipFps } = useVideoConfig();
  const enter = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#07070a" }}>
      <World sky={sky} accent={accent} />
      <div
        style={{
          position: "absolute",
          left: ${isPortrait ? 40 : 64},
          right: ${isPortrait ? 40 : 64},
          ${isPortrait ? 'top: "12%"' : "bottom: 72"},
          color: "#FFF8E7",
          fontFamily: "Georgia, serif",
          opacity: 0.35 + enter * 0.65,
          transform: \`translateY(\${(1 - enter) * 24}px)\`,
        }}
      >
        <div style={{ fontSize: ${isPortrait ? 20 : 24}, letterSpacing: 6, textTransform: "uppercase", opacity: 0.75 }}>{title}</div>
        <div style={{ marginTop: 14, fontSize: ${isPortrait ? 36 : 48}, lineHeight: 1.2, fontWeight: 700 }}>{body}</div>
      </div>
    </AbsoluteFill>
  );
}

export default function StoryVideo({ audioSrc }) {
  const frame = useCurrentFrame();
  const beat = Math.max(20, Math.floor(durationInFrames / 3));
  const index = frame < beat ? 0 : frame < beat * 2 ? 1 : 2;
  const beats = [
    { title: ${jsxText(kickerFrom(lines[0]))}, body: ${jsxText(lines[0])}, sky: "#2a1630", accent: "#2F8D79" },
    { title: ${jsxText(kickerFrom(lines[1]))}, body: ${jsxText(lines[1])}, sky: "#10261c", accent: "#c45c3e" },
    { title: ${jsxText(kickerFrom(lines[2]))}, body: ${jsxText(lines[2])}, sky: "#0f172a", accent: "#f59e0b" },
  ];
  const current = beats[index];

  return (
    <AbsoluteFill>
      {audioSrc ? <Audio src={audioSrc} /> : null}
      <CodedBed mood="mystery" volume={0.12} />
      <CodedSfx from={beat} patch={[0.35, 0, 280, 0.02, 0.06, 0.18, 0, 1.4, -0.45, 0, 0, 0, 0, 0.35]} />
      <CodedSfx from={beat * 2} patch={[0.28, 0, 190, 0.01, 0.04, 0.14, 0, 1.1, -0.3, 0, 0, 0, 0, 0.25]} />
      <Beat title={current.title} body={current.body} sky={current.sky} accent={current.accent} />
      <ChannelBug />
    </AbsoluteFill>
  );
}
`;
}

export function getTemplateCode(project) {
  return getAnimationMode(project) === "3d" ? get3dTemplate(project) : get2dTemplate(project);
}

function formatCraft(format) {
  if (format.id === "shorts") {
    return `YouTube Shorts ${format.width}×${format.height} (${format.ratio}). Phone-native vertical — never a 16:9 film letterboxed in a tall frame.
Subject in the upper-middle third. Captions large, one idea per shot. Keep type and faces out of the top 10% (username) and bottom 20% (Shorts UI). Cuts every 1.5–3s unless a line needs a hold.`;
  }
  if (format.id === "instagram") {
    return `Instagram Reels ${format.width}×${format.height} (${format.ratio}). Vertical-first — never YouTube landscape.
Keep faces and type out of the right 12% (like/comment stack) and bottom 22% (caption + audio UI). Punchy motion, large Hindi type.`;
  }
  return `YouTube long-form ${format.width}×${format.height} (${format.ratio}). Cinematic widescreen — never 9:16.
Captions as a lower-third or a top title card, not a stacked Shorts layout. Mild side safe-area. Shots can breathe 3–8s if the VO line needs it.`;
}

function pipelineCraft(mode) {
  if (mode === "3d") {
    return `Picture is 3D only: @remotion/three <ThreeCanvas> + three meshes, lights, and a real camera.
Forbidden as the picture: KitSvg, CartoonActor, CSS gradient cards, SVG silhouettes posing as the world.
Every beat changes camera (position / look / fov) — dolly, orbit, crane, or push. Always: ground plane, character volumes, sky color, key + fill light.
Captions and the channel bug are HTML overlays on AbsoluteFill, not 3D text.`;
  }
  return `Picture is 2D motion-comic / limited animation (Indian folk storybook that moves) — not anime, not a slideshow.
Use Remotion 2D: AbsoluteFill, spring, interpolate, Sequence / TransitionSeries. Optional gsap for extra motion.
House picture tags (injected; import optional):
  <KitSvg kit="folkDusk" /> sets: ${SET_KITS.join(", ")}
  <CartoonActor kit="boy" frame={frame} variant={0} /> kits: ${CHARACTER_KITS.join(", ")}
  <CartoonSet kit="folkDusk" />
Forbidden: ThreeCanvas, three, @remotion/three, remote images, CSS-only title cards as the whole shot.
Every beat: new or shifted environment + character acting + camera (pan / push / parallax). Hold poses, live the camera.`;
}

function captionCraft(format) {
  if (format.id === "youtube") {
    return `Hindi captions from the spoken script (not English placeholders). Lower-third or top card. High contrast on a dim plate. Never cover the figure’s face. Channel bug sits lower-left, clear of the caption.`;
  }
  if (format.id === "instagram") {
    return `Hindi from the spoken script. Large type in the upper half, away from the right icons. Channel bug top-left, below the username strip.`;
  }
  return `Hindi from the spoken script. Large type, upper-middle, never in the Shorts bottom UI. Channel bug top-left, below the username strip.`;
}

export function getChatGptPrompt(project) {
  const format = getFormatMeta(project.deliveryFormat || project.format);
  const fps = project.fps || 30;
  const seconds = Math.max(8, Math.round(Number(project.voiceover?.durationSeconds || project.script?.lengthSeconds || 60)));
  const frames = Math.max(1, Math.round(seconds * fps));
  const mode = getAnimationMode(project);
  const script = (project.script?.body || "").trim() || "(no script pasted)";
  const story = inferStoryFields(script, project.script);
  const title = story.title;
  const logline = story.logline;
  const notes = (project.stageInstructions || "").trim();
  const packages =
    mode === "3d"
      ? "remotion, @remotion/three, three, @remotion/transitions, @remotion/motion-blur, react, tone, zzfx"
      : "remotion, @remotion/transitions, @remotion/motion-blur, gsap, react, tone, zzfx";
  const bedMood = /myster| रहस्य|thriller|dark/i.test(`${notes}\n${script}`) ? "mystery" : "folk";
  const whoosh = "[0.35, 0, 280, 0.02, 0.06, 0.18, 0, 1.4, -0.45, 0, 0, 0, 0, 0.35]";

  return `Write one Remotion JSX file that IS the finished Timeless Stories video. A human will paste it into our player and press Play. Quality of the film = quality of this file.

You are the animation director + compositor. Style: limited animation / motion-comic for Hindi YouTube folk and mystery — held drawings, living camera, dusk palettes. Not anime. Not a podcast with wallpaper. Not a deck of still cards.

## This job
Title: ${title}
Tagline: ${logline}
Pipeline: ${mode.toUpperCase()}
Format: ${format.label} · ${format.width}×${format.height} · ${format.ratio} · ${fps} fps · ${frames} frames (~${seconds}s, match the voiceover)
${notes ? `Director notes:\n${notes}\n` : ""}
VOICEOVER / SCRIPT (time the picture to this; captions quote it):
${script}

On-screen captions — use THESE lines from the script, not invented English titles:
${story.beats.map((line, index) => `${index + 1}. ${line}`).join("\n")}

A house Template is provided separately. Keep its engine exports, VO <Audio>, ChannelBug, and coded-sound tags. Replace placeholder beats with a full timed cut of THIS script. Title, tagline, and captions must come from the script above.

## File the player will compile
- One file. \`export default function StoryVideo(props)\`
- \`export const fps = ${fps};\`
- \`export const durationInFrames = ${frames};\`  // beats must SUM to this exactly
- \`export const width = ${format.width};\`
- \`export const height = ${format.height};\`
- Voiceover: \`{props.audioSrc ? <Audio src={props.audioSrc} /> : null}\` — never replace, mute, or duck this with a bed that is louder
- Allowed packages only: ${packages}
- Imports are stripped; house tags below are already in scope. No CSS files, no fetch, no remote images/audio/fonts, no libraries not listed.

## Frame
${formatCraft(format)}
useVideoConfig() for width/height. Never a different aspect.

## Picture
${pipelineCraft(mode)}

Shot grammar:
- Split the script into beats whose durations sum to ${frames} frames. One VO thought per beat.
- Transitions: hard cut or 8–12 frame fade/slide/wipe via @remotion/transitions. No 1-second dissolves.
- On every beat, at least two of: camera move, character act, environment change, light shift.
- Readability first: silhouette, contrast, caption not on the face.
- Palette: dusk folk — deep plum/teal/ink, warm lamp gold. Avoid flat white slides.

## Type + channel bug
${captionCraft(format)}
Always-on bug text exactly: Timeless Stories (small broadcast bug, never a giant watermark).

## Sound (coded, original)
- Bed: \`<CodedBed mood="${bedMood}" volume={0.12} />\` — quieter than VO. mood is only "folk" or "mystery".
- One \`<CodedSfx from={cutFrame} patch={${whoosh}} />\` on each cut/whoosh. Vary frequency in the patch; do not spam.
- No song names, no YouTube, no remote mp3/wav URLs. VO is only props.audioSrc.

## Do not
- Markdown fences or any prose before/after the file
- Wrong aspect or a different duration than ${frames}
- ${mode === "3d" ? "2D kits as the world" : "Three.js"}
- English dummy titles, lorem, or captions that are not from this script
- Full-frame type with no picture
- Named commercial music or ripped audio

## Reply
Only the JSX file. No explanation.`;
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

export function copyText(text) {
  return navigator.clipboard?.writeText(text);
}
