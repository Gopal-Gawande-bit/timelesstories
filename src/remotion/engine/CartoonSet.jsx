import { AbsoluteFill } from "remotion";

const LOOKS = {
  folkDusk: { sky: "linear-gradient(180deg,#1b1433 0%,#c45c3e 70%,#f0a36b 100%)", floor: "#3b2618" },
  mistForest: { sky: "linear-gradient(180deg,#07130e 0%,#1a3324 55%,#4a3b2a 100%)", floor: "#10261c" },
  mysteryLane: { sky: "linear-gradient(180deg,#020617 0%,#1e293b 60%,#334155 100%)", floor: "#0f172a" },
  lampRoom: { sky: "linear-gradient(180deg,#3b2618 0%,#6a4128 50%,#1c1610 100%)", floor: "#24160f" },
  marketStreet: { sky: "linear-gradient(180deg,#7dd3fc 0%,#fed7aa 70%,#fdba74 100%)", floor: "#a8a29e" },
  folkMeadow: { sky: "linear-gradient(180deg,#7dd3fc 0%,#bbf7d0 100%)", floor: "#15803d" },
};

export function CartoonSet({ kit, shake = 0 }) {
  const look = LOOKS[kit] ?? LOOKS.folkDusk;

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: look.sky, transform: `translateX(${shake}px)` }}>
      <div
        style={{
          position: "absolute",
          top: 80,
          right: -40 - shake,
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "#fff2a6",
          opacity: 0.35,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 160,
          left: 48,
          width: 220,
          height: 260,
          background: "rgba(255,246,223,0.18)",
          border: "14px solid rgba(255,246,223,0.55)",
          borderRadius: 16,
          boxShadow: "0 10px 0 rgba(0,0,0,0.15)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: "38%",
          background: look.floor,
          borderTop: "10px solid rgba(0,0,0,0.25)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "18%",
          left: "8%",
          width: "84%",
          height: "16%",
          borderRadius: "50%",
          background: "rgba(0,0,0,0.18)",
        }}
      />
    </AbsoluteFill>
  );
}
