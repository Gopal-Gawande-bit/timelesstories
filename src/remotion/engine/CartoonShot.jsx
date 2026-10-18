import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Trail } from "@remotion/motion-blur";
import { KitSvg } from "../../stage/kits/KitSvg";
import { CartoonActor } from "./CartoonActor";
import { CartoonSet } from "./CartoonSet";
import { cameraShake, clamp, pop, smooth } from "./motion";
import { getCameraTransform } from "./camera";

export function CartoonShot({ shot }) {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const shake = cameraShake(frame, shot.camera);
  const cameraStyle = getCameraTransform(shot.camera, frame, durationInFrames);
  const bg = (shot.layers ?? []).find((layer) => layer.kind === "bg");
  const actor = (shot.layers ?? []).find((layer) => layer.kind === "character");
  const bubble = pop(frame, fps, 4);
  const opacity = smooth(frame, 0, 8);
  const actorX = interpolate(frame, [0, durationInFrames], [0, shot.camera?.move === "pan" ? -40 : 12], clamp);
  const sky = shot.palette?.sky ?? "#1b1433";
  const bubbleFill = shot.palette?.bubble ?? "#FFF18A";
  const ink = shot.palette?.ink ?? "#28213B";
  const captionSize = shot.captionSize ?? 42;
  const captionRotate = shot.captionRotate ?? -1.5;

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: sky }}>
      <div style={{ position: "absolute", inset: 0, ...cameraStyle }}>
        <CartoonSet kit={bg?.kit} shake={shake} />
        <div style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
          {bg?.kit ? <KitSvg kit={bg.kit} variant={bg.variant} style={{ width: "100%", height: "100%" }} /> : null}
        </div>
        <Trail layers={4} lagInFrames={0.45} trailOpacity={0.35}>
          <div
            style={{
              position: "absolute",
              left: "18%",
              bottom: "-4%",
              width: "64%",
              height: "72%",
              transform: `translateX(${actorX + shake}px)`,
            }}
          >
            <CartoonActor kit={actor?.kit ?? "boy"} variant={actor?.variant ?? 0} frame={frame} />
          </div>
        </Trail>
      </div>

      {shot.voLine ? (
        <div
          style={{
            position: "absolute",
            left: 48,
            right: 48,
            top: 72,
            zIndex: 8,
            padding: "20px 28px",
            borderRadius: 28,
            border: `6px solid ${ink}`,
            background: bubbleFill,
            color: ink,
            fontWeight: 800,
            fontSize: captionSize,
            lineHeight: 1.2,
            textAlign: "center",
            boxShadow: `0 10px 0 ${ink}`,
            opacity,
            transform: `scale(${0.92 + bubble * 0.08}) rotate(${captionRotate}deg)`,
          }}
        >
          {shot.voLine}
        </div>
      ) : null}
    </AbsoluteFill>
  );
}
