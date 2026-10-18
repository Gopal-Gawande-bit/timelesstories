import { useEffect, useMemo, useState } from "react";
import { Audio, Sequence, continueRender, delayRender } from "remotion";
import * as Tone from "tone";
import { ZZFX, zzfx } from "zzfx";

const SAMPLE_RATE = 44100;
const bufferUrls = new Map();

function writeString(view, offset, text) {
  for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i));
}

function samplesToWavUrl(samples, sampleRate = SAMPLE_RATE) {
  const length = samples.length;
  const buffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(buffer);
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, length * 2, true);
  let offset = 44;
  for (let i = 0; i < length; i += 1) {
    const s = Math.max(-1, Math.min(1, samples[i] || 0));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return `data:audio/wav;base64,${btoa(binary)}`;
}

function audioBufferToWavUrl(audioBuffer) {
  const channel = audioBuffer.getChannelData(0);
  const merged = new Float32Array(channel.length);
  merged.set(channel);
  if (audioBuffer.numberOfChannels > 1) {
    const right = audioBuffer.getChannelData(1);
    for (let i = 0; i < merged.length; i += 1) merged[i] = (merged[i] + right[i]) * 0.5;
  }
  return samplesToWavUrl(merged, audioBuffer.sampleRate || SAMPLE_RATE);
}

function cachedUrl(key, factory) {
  if (bufferUrls.has(key)) return bufferUrls.get(key);
  const pending = Promise.resolve()
    .then(factory)
    .then((url) => {
      bufferUrls.set(key, Promise.resolve(url));
      return url;
    });
  bufferUrls.set(key, pending);
  return pending;
}

function normalizePatch(patch) {
  if (Array.isArray(patch) && patch.length) return patch;
  return [0.35, 0, 280, 0.02, 0.06, 0.18, 0, 1.4, -0.45, 0, 0, 0, 0, 0.35];
}

async function bakeZzfxPatch(patch) {
  const params = [...normalizePatch(patch)];
  if (params.length > 1) params[1] = 0;
  const previousRandom = Math.random;
  Math.random = () => 0.5;
  let samples;
  try {
    samples = ZZFX.buildSamples(...params);
  } finally {
    Math.random = previousRandom;
  }
  return samplesToWavUrl(samples, ZZFX.sampleRate || SAMPLE_RATE);
}

async function bakeToneBed(mood) {
  const seconds = 6;
  const toneBuffer = await Tone.Offline(() => {
    if (mood === "mystery") {
      const drone = new Tone.Oscillator({ frequency: 65.4, type: "sine" }).toDestination();
      drone.volume.value = -26;
      drone.start(0);
      const fifth = new Tone.Oscillator({ frequency: 98, type: "triangle" }).toDestination();
      fifth.volume.value = -34;
      fifth.start(0);
      const ping = new Tone.Oscillator({ frequency: 784, type: "sine" }).toDestination();
      ping.volume.value = -42;
      ping.start(1.4).stop(1.85);
      ping.start(3.8).stop(4.2);
      return;
    }
    const root = new Tone.Oscillator({ frequency: 73.4, type: "sine" }).toDestination();
    root.volume.value = -27;
    root.start(0);
    const fifth = new Tone.Oscillator({ frequency: 110, type: "triangle" }).toDestination();
    fifth.volume.value = -33;
    fifth.start(0);
    const air = new Tone.Noise("brown");
    const filter = new Tone.Filter(320, "lowpass").toDestination();
    air.connect(filter);
    air.volume.value = -42;
    air.start(0);
  }, seconds);
  const native = toneBuffer.get ? toneBuffer.get() : toneBuffer;
  return audioBufferToWavUrl(native);
}

function useBakedSrc(cacheKey, factory) {
  const [handle] = useState(() => delayRender(`coded-sound-${cacheKey}`));
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let cancelled = false;
    cachedUrl(cacheKey, factory)
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch((error) => {
        console.warn("Coded sound bake failed", error);
      })
      .finally(() => {
        continueRender(handle);
      });
    return () => {
      cancelled = true;
    };
  }, [cacheKey, factory, handle]);

  return src;
}

export function CodedSfx({ from = 0, durationInFrames, patch, volume = 0.4 }) {
  const key = `sfx:${JSON.stringify(normalizePatch(patch))}`;
  const factory = useMemo(() => () => bakeZzfxPatch(JSON.parse(key.slice(4))), [key]);
  const src = useBakedSrc(key, factory);
  if (!src) return null;
  return (
    <Sequence from={Math.max(0, Math.round(from))} durationInFrames={durationInFrames} name="CodedSfx">
      <Audio src={src} volume={volume} />
    </Sequence>
  );
}

export function CodedBed({ mood = "folk", volume = 0.12 }) {
  const kind = mood === "mystery" ? "mystery" : "folk";
  const key = `bed:${kind}`;
  const factory = useMemo(() => () => bakeToneBed(kind), [kind]);
  const src = useBakedSrc(key, factory);
  if (!src) return null;
  return <Audio src={src} volume={volume} loop />;
}

export { Tone, zzfx, ZZFX };
