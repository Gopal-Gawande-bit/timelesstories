import { transform } from "sucrase";
import React from "react";
import * as Remotion from "remotion";
import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { Trail } from "@remotion/motion-blur";
import { ThreeCanvas } from "@remotion/three";
import gsap from "gsap";
import * as THREE from "three";
import { KitSvg } from "../kits/KitSvg";
import { CartoonActor } from "../../remotion/engine/CartoonActor";
import { CartoonSet } from "../../remotion/engine/CartoonSet";
import { CodedBed, CodedSfx, Tone, zzfx } from "../audio/CodedSound";
import { compileAnimationSource, programDurationFrames } from "./animationProgram";

function stripModuleSyntax(source) {
  return String(source)
    .replace(/^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"]\s*;?\s*$/gm, "")
    .replace(/^\s*import\s+['"][^'"]+['"]\s*;?\s*$/gm, "")
    .replace(/^\s*export\s*\{[^}]*\}\s*from\s+['"][^'"]+['"]\s*;?\s*$/gm, "")
    .replace(/export\s+default\s+function\s+(\w+)/g, "function $1")
    .replace(/export\s+default\s+/g, "var __Default = ")
    .replace(/export\s+function\s+(\w+)/g, "function $1")
    .replace(/export\s+const\s+(\w+)/g, "var $1")
    .replace(/export\s+let\s+(\w+)/g, "var $1")
    .replace(/export\s+var\s+(\w+)/g, "var $1");
}

function unwrapMarkdown(source) {
  const text = String(source || "").trim();
  const fenced = text.match(/^```(?:jsx|js|tsx|ts)?\s*([\s\S]*?)```$/);
  return fenced ? fenced[1].trim() : text.replace(/^```(?:jsx|js)?\s*/i, "").replace(/```$/i, "").trim();
}

function compileJsxComponent(source, fallbackDuration, fps) {
  const stripped = stripModuleSyntax(unwrapMarkdown(source));
  const wrapped = `"use strict";
${stripped}
var __Component = (typeof __Default !== "undefined" && __Default)
  || (typeof StoryVideo !== "undefined" && StoryVideo)
  || (typeof MyVideo !== "undefined" && MyVideo)
  || (typeof Animation !== "undefined" && Animation)
  || (typeof Video !== "undefined" && Video)
  || null;
var __duration = (typeof durationInFrames === "number" && durationInFrames)
  || ${fallbackDuration};
var __fps = (typeof fps === "number" && fps) || ${fps};
if (!__Component) throw new Error("Export default function StoryVideo, or name it StoryVideo.");
return { component: __Component, durationInFrames: __duration, fps: __fps };
`;

  const { code } = transform(wrapped, {
    transforms: ["jsx"],
    production: true,
    jsxRuntime: "classic",
    jsxPragma: "React.createElement",
    jsxFragmentPragma: "React.Fragment",
  });

  const runner = new Function(
    "React",
    "Remotion",
    "AbsoluteFill",
    "Audio",
    "Sequence",
    "Series",
    "interpolate",
    "spring",
    "useCurrentFrame",
    "useVideoConfig",
    "Easing",
    "random",
    "Img",
    "OffthreadVideo",
    "TransitionSeries",
    "linearTiming",
    "springTiming",
    "fade",
    "slide",
    "wipe",
    "Trail",
    "ThreeCanvas",
    "gsap",
    "THREE",
    "KitSvg",
    "CartoonActor",
    "CartoonSet",
    "Tone",
    "zzfx",
    "CodedSfx",
    "CodedBed",
    code,
  );

  return runner(
    React,
    Remotion,
    Remotion.AbsoluteFill,
    Remotion.Audio,
    Remotion.Sequence,
    Remotion.Series,
    Remotion.interpolate,
    Remotion.spring,
    Remotion.useCurrentFrame,
    Remotion.useVideoConfig,
    Remotion.Easing,
    Remotion.random,
    Remotion.Img,
    Remotion.OffthreadVideo,
    TransitionSeries,
    linearTiming,
    springTiming,
    fade,
    slide,
    wipe,
    Trail,
    ThreeCanvas,
    gsap,
    THREE,
    KitSvg,
    CartoonActor,
    CartoonSet,
    Tone,
    zzfx,
    CodedSfx,
    CodedBed,
  );
}

export function compileUploadedCode(source, { fps = 30, durationSeconds = 30 } = {}) {
  const text = unwrapMarkdown(source);
  const fallbackDuration = Math.max(30, Math.round(Number(durationSeconds || 30) * fps));

  if (!text.trim()) {
    throw new Error("Paste or upload animation code first.");
  }

  const looksLikeProgram = /function\s+createProgram\s*\(/.test(text) || /^\s*\{/.test(text);
  const looksLikeJsx = /<[A-Za-z]/.test(text) || /AbsoluteFill/.test(text);

  if (looksLikeProgram && !looksLikeJsx) {
    const program = compileAnimationSource(text);
    return {
      kind: "program",
      program,
      durationInFrames: Math.max(programDurationFrames(program), 1),
      fps,
    };
  }

  try {
    const result = compileJsxComponent(text, fallbackDuration, fps);
    return {
      kind: "component",
      component: result.component,
      durationInFrames: Math.max(Number(result.durationInFrames) || fallbackDuration, 1),
      fps: Number(result.fps) || fps,
    };
  } catch (jsxError) {
    if (looksLikeProgram) {
      const program = compileAnimationSource(text);
      return {
        kind: "program",
        program,
        durationInFrames: Math.max(programDurationFrames(program), 1),
        fps,
      };
    }
    throw new Error(jsxError.message || "Could not run this animation code.");
  }
}
