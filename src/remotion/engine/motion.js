import { Easing, interpolate, spring } from "remotion";

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
};

export function smooth(frame, a, b) {
  return interpolate(frame, [a, b], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
}

export function pop(frame, fps, start, duration = 12) {
  return spring({
    frame: frame - start,
    fps,
    config: { damping: 14, stiffness: 160, mass: 0.7 },
    durationInFrames: duration,
  });
}

export function cameraShake(frame, camera) {
  const move = camera?.move ?? "";
  if (move !== "dolly-shake" && move !== "shake") return 0;
  return Math.sin(frame * 2.8) * (camera.intensity ?? 0.4) * 10;
}
