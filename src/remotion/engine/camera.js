import { interpolate, random } from "remotion";

function lerp(from, to, t) {
  return from + (to - from) * t;
}

export function getCameraProgress(frame, durationInFrames) {
  const last = Math.max(durationInFrames - 1, 1);
  return interpolate(frame, [0, last], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

export function getCameraTransform(camera, frame, durationInFrames) {
  const t = getCameraProgress(frame, durationInFrames);
  const from = camera.from ?? { x: 0, y: 0, scale: 1, rotate: 0 };
  const to = camera.to ?? { x: 0, y: 0, scale: 1.08, rotate: 0 };
  const intensity = camera.intensity ?? 0.4;

  let x = lerp(from.x, to.x, t);
  let y = lerp(from.y, to.y, t);
  let scale = lerp(from.scale, to.scale, t);
  let rotate = lerp(from.rotate, to.rotate, t);

  if (camera.move === "dolly-shake" || camera.move === "shake") {
    const shakeStarts = durationInFrames * 0.72;
    if (frame >= shakeStarts) {
      const n = random(`shake-${Math.floor(frame / 2)}`);
      const amp = intensity * 10;
      x += (n - 0.5) * amp * 2;
      y += (random(`shake-y-${Math.floor(frame / 2)}`) - 0.5) * amp * 1.4;
    }
  }

  return {
    transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotate}deg)`,
    transformOrigin: "center center",
  };
}

export function getParallaxOffset(camera, frame, durationInFrames, parallax = 0) {
  const t = getCameraProgress(frame, durationInFrames);
  const from = camera.from ?? { x: 0, y: 0 };
  const to = camera.to ?? { x: 0, y: 0 };
  return {
    x: (to.x - from.x) * t * parallax * -0.35,
    y: (to.y - from.y) * t * parallax * -0.35,
  };
}
