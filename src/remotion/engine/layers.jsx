const PALETTES = {
  sky: {
    background:
      "linear-gradient(180deg, #1b1433 0%, #4a2a4a 38%, #c45c3e 72%, #f0a36b 100%)",
  },
  hills: {
    clipPath: "polygon(0 62%, 18% 48%, 34% 56%, 52% 42%, 78% 54%, 100% 46%, 100% 100%, 0 100%)",
    background: "linear-gradient(180deg, #2a3344 0%, #141820 100%)",
  },
  village: {
    clipPath: "polygon(0 70%, 12% 70%, 16% 52%, 28% 52%, 32% 70%, 48% 72%, 52% 58%, 64% 58%, 68% 74%, 100% 78%, 100% 100%, 0 100%)",
    background: "linear-gradient(180deg, #5a3a2a 0%, #24160f 100%)",
  },
  dust: {
    background:
      "radial-gradient(circle at 20% 40%, rgba(255,220,170,0.28) 0 2px, transparent 3px), radial-gradient(circle at 70% 30%, rgba(255,220,170,0.2) 0 2px, transparent 3px), radial-gradient(circle at 40% 70%, rgba(255,220,170,0.16) 0 1px, transparent 2px)",
  },
  wall: {
    background: "linear-gradient(120deg, #3b2618 0%, #6a4128 48%, #2c1b12 100%)",
  },
  door: {
    clipPath: "polygon(28% 18%, 72% 18%, 76% 100%, 24% 100%)",
    background: "radial-gradient(circle at 50% 70%, #f4c56a 0%, #c45c3e 40%, #1a0f0c 78%)",
  },
  teller: {
    clipPath: "polygon(46% 28%, 54% 28%, 58% 40%, 62% 78%, 70% 100%, 30% 100%, 38% 78%, 42% 40%)",
    background: "linear-gradient(180deg, #1c1210 0%, #0b0706 100%)",
  },
  glow: {
    background: "radial-gradient(circle at 50% 72%, rgba(255,186,90,0.35) 0%, transparent 42%)",
  },
  canopy: {
    background: "linear-gradient(180deg, #07130e 0%, #10261c 40%, #0a1812 100%)",
  },
  trees: {
    clipPath:
      "polygon(8% 0, 16% 0, 14% 100%, 6% 100%, 30% 0, 40% 0, 36% 100%, 28% 100%, 62% 0, 72% 0, 68% 100%, 58% 100%, 86% 0, 96% 0, 92% 100%, 80% 100%)",
    background: "linear-gradient(90deg, #06110c, #1a3324 40%, #050d09)",
  },
  path: {
    clipPath: "polygon(18% 100%, 46% 62%, 58% 62%, 86% 100%)",
    background: "linear-gradient(180deg, #4a3b2a, #1c1610)",
  },
  fog: {
    background: "linear-gradient(180deg, transparent 40%, rgba(180,210,200,0.18) 100%)",
  },
};

export function PaintedLayer({ layer, offset }) {
  const paint = PALETTES[layer.palette] ?? PALETTES.sky;

  return (
    <div
      style={{
        position: "absolute",
        inset: "-8%",
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        ...paint,
      }}
    />
  );
}
