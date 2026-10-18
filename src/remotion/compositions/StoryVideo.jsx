import { AbsoluteFill, Audio, Sequence } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Scene } from "../engine/Scene";
import { CartoonShot } from "../engine/CartoonShot";
import { ThreeShot } from "../engine/ThreeShot";
import { demoProject } from "../demo/demoProject";

function flattenShots(project) {
  return (project.scenes ?? []).flatMap((scene) => scene.shots ?? []);
}

export function StoryVideo({ project = demoProject, audioSrc }) {
  const shots = flattenShots(project);
  const hasKits = shots.some((shot) => (shot.layers ?? []).some((layer) => layer.kit));
  const mode = project.animationMode ?? "2d";

  if (!hasKits) {
    let from = 0;
    return (
      <AbsoluteFill style={{ background: "#09080a" }}>
        {audioSrc ? <Audio src={audioSrc} /> : null}
        {(project.scenes ?? []).map((scene) => {
          const durationInFrames = (scene.shots ?? []).reduce((sum, shot) => sum + shot.durationFrames, 0);
          const start = from;
          from += durationInFrames;
          return (
            <Sequence key={scene.id} from={start} durationInFrames={durationInFrames}>
              <Scene scene={scene} />
            </Sequence>
          );
        })}
      </AbsoluteFill>
    );
  }

  const ShotView = mode === "3d" ? ThreeShot : CartoonShot;

  return (
    <AbsoluteFill style={{ background: "#111827" }}>
      {audioSrc ? <Audio src={audioSrc} /> : null}
      <TransitionSeries>
        {shots.flatMap((shot, index) => {
          const pieces = [
            <TransitionSeries.Sequence key={shot.id} durationInFrames={Math.max(shot.durationFrames, 10)}>
              <ShotView shot={shot} />
            </TransitionSeries.Sequence>,
          ];
          if (index < shots.length - 1) {
            pieces.push(
              <TransitionSeries.Transition
                key={`${shot.id}-fade`}
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
