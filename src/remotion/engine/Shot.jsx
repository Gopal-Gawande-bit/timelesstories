import { useCallback, useRef } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useGsapTimeline } from "@remotion/gsap";
import gsap from "gsap";
import { KitSvg } from "../../stage/kits/KitSvg";
import { getCameraTransform, getParallaxOffset } from "./camera";
import { PaintedLayer } from "./layers";

function KitLayer({ layer, offset }) {
  const isCharacter = layer.kind === "character";
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: isCharacter ? "auto" : 0,
        bottom: 0,
        height: isCharacter ? "58%" : "100%",
        transform: `translate(${offset.x}px, ${offset.y}px)`,
      }}
    >
      <KitSvg kit={layer.kit} variant={layer.variant ?? 0} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

export function Shot({ shot }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const captionRef = useRef(null);
  const cameraStyle = getCameraTransform(shot.camera, frame, durationInFrames);
  const captionOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const createCaptionTimeline = useCallback(() => {
    const tl = gsap.timeline();
    if (captionRef.current) {
      tl.fromTo(
        captionRef.current,
        { y: 16 },
        { y: 0, duration: 0.45, ease: "power2.out" },
        0,
      );
    }
    return tl;
  }, []);

  useGsapTimeline(createCaptionTimeline);

  return (
    <AbsoluteFill style={{ background: "#111827", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          ...cameraStyle,
        }}
      >
        {(shot.layers ?? []).map((layer) => {
          const offset = getParallaxOffset(
            shot.camera,
            frame,
            durationInFrames,
            layer.parallax ?? 0,
          );
          if (layer.kit) {
            return <KitLayer key={layer.id} layer={layer} offset={offset} />;
          }
          return <PaintedLayer key={layer.id} layer={layer} offset={offset} />;
        })}
      </div>

      <div
        ref={captionRef}
        style={{
          position: "absolute",
          left: 48,
          right: 48,
          bottom: 40,
          padding: "14px 18px",
          borderRadius: 10,
          background: "rgba(255,255,255,0.88)",
          color: "#171717",
          fontSize: 28,
          lineHeight: 1.35,
          opacity: captionOpacity,
        }}
      >
        {shot.voLine}
      </div>
    </AbsoluteFill>
  );
}
