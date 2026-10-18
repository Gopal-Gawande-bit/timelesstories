import { AbsoluteFill } from "remotion";
import { useMemo } from "react";
import { LiveVideo } from "./LiveVideo";
import { compileUploadedCode } from "../../stage/animation/compileUserCode";

export function DynamicHost({
  source,
  audioSrc,
  fps = 30,
  durationSeconds = 30,
  script,
  title,
  notes,
  animationMode = "2d",
}) {
  const compiled = useMemo(() => {
    if (!String(source || "").trim()) return { empty: true };
    try {
      return compileUploadedCode(source, { fps, durationSeconds });
    } catch (err) {
      return { error: err.message || "Could not run this animation code." };
    }
  }, [source, fps, durationSeconds]);

  if (compiled.empty) {
    return (
      <AbsoluteFill
        style={{
          background: "#0b0b0c",
          color: "#e7e5e4",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
          fontSize: 36,
          padding: 80,
          textAlign: "center",
        }}
      >
        Paste ChatGPT’s animation file, then play.
      </AbsoluteFill>
    );
  }

  if (compiled.error) {
    return (
      <AbsoluteFill
        style={{
          background: "#1c1010",
          color: "#fecaca",
          padding: 64,
          fontSize: 28,
          whiteSpace: "pre-wrap",
        }}
      >
        {compiled.error}
      </AbsoluteFill>
    );
  }

  if (compiled.kind === "program") {
    return <LiveVideo program={{ ...compiled.program, mode: animationMode }} audioSrc={audioSrc} />;
  }

  const User = compiled.component;
  return (
    <User
      audioSrc={audioSrc}
      script={script}
      title={title}
      notes={notes}
      fps={compiled.fps}
      durationInFrames={compiled.durationInFrames}
      animationMode={animationMode}
    />
  );
}
