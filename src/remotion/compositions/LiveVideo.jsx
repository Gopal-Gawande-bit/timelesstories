import { AbsoluteFill, Audio } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { CartoonShot } from "../engine/CartoonShot";
import { ThreeShot } from "../engine/ThreeShot";

export function clipToShot(clip) {
  return {
    id: clip.id,
    durationFrames: clip.durationFrames,
    voLine: clip.voLine,
    action: clip.action,
    camera: clip.camera,
    captionSize: clip.captionSize,
    captionRotate: clip.captionRotate,
    palette: clip.palette,
    layers: [
      { kind: "bg", kit: clip.bgKit, variant: clip.bgVariant },
      { kind: "character", kit: clip.actorKit, variant: clip.actorVariant },
    ],
  };
}

export function LiveVideo({ program, audioSrc }) {
  const clips = program?.clips ?? [];
  const ShotView = program?.mode === "3d" ? ThreeShot : CartoonShot;

  return (
    <AbsoluteFill style={{ background: program?.background ?? "#111827" }}>
      {audioSrc ? <Audio src={audioSrc} /> : null}
      <TransitionSeries>
        {clips.flatMap((clip, index) => {
          const shot = clipToShot(clip);
          const pieces = [
            <TransitionSeries.Sequence key={clip.id} durationInFrames={Math.max(clip.durationFrames, 10)}>
              <ShotView shot={shot} />
            </TransitionSeries.Sequence>,
          ];
          if (index < clips.length - 1) {
            pieces.push(
              <TransitionSeries.Transition
                key={`${clip.id}-fade`}
                presentation={fade()}
                timing={linearTiming({ durationInFrames: 8 })}
              />,
            );
          }
          return pieces;
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
}
