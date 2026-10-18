import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "./motion";

const COLORS = {
  folkDusk: "#c45c3e",
  mistForest: "#1a3324",
  mysteryLane: "#1e293b",
  lampRoom: "#6a4128",
  marketStreet: "#fdba74",
  folkMeadow: "#4ade80",
};

export function ThreeShot({ shot }) {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const bg = (shot.layers ?? []).find((layer) => layer.kind === "bg");
  const color = COLORS[bg?.kit] ?? "#c45c3e";
  const z = interpolate(frame, [0, durationInFrames], [6.2, 4.6], clamp);
  const x = interpolate(frame, [0, durationInFrames], [-0.4, 0.5], clamp);
  const bob = Math.sin(frame * 0.18) * 0.08;

  return (
    <AbsoluteFill style={{ background: "#0b0a09" }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 50, position: [x, 1.15, z] }}>
        <color attach="background" args={[color]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 8, 6]} intensity={1.2} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, 0]}>
          <planeGeometry args={[18, 18]} />
          <meshStandardMaterial color="#24160f" />
        </mesh>
        <mesh position={[x, -0.15 + bob, 0]}>
          <cylinderGeometry args={[0.42, 0.5, 1.35, 16]} />
          <meshStandardMaterial color="#2F8D79" />
        </mesh>
        <mesh position={[x, 0.95 + bob, 0.05]}>
          <sphereGeometry args={[0.38, 24, 24]} />
          <meshStandardMaterial color="#FFD0A6" />
        </mesh>
      </ThreeCanvas>
      {shot.voLine ? (
        <div
          style={{
            position: "absolute",
            left: 40,
            right: 40,
            bottom: 48,
            padding: "16px 22px",
            borderRadius: 16,
            background: "rgba(255,255,255,0.92)",
            color: "#171717",
            fontSize: shot.captionSize ?? 34,
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          {shot.voLine}
        </div>
      ) : null}
    </AbsoluteFill>
  );
}
