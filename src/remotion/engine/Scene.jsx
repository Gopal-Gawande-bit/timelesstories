import { AbsoluteFill, Sequence } from "remotion";
import { Shot } from "./Shot";

export function Scene({ scene }) {
  let localFrom = 0;

  return (
    <AbsoluteFill>
      {scene.shots.map((shot) => {
        const from = localFrom;
        localFrom += shot.durationFrames;
        return (
          <Sequence key={shot.id} from={from} durationInFrames={shot.durationFrames}>
            <Shot shot={shot} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
