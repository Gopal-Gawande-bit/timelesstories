import { useMemo } from "react";
import { Player } from "@remotion/player";
import { StoryVideo } from "../../remotion/compositions/StoryVideo";
import { getFormatSize, getProjectDurationFrames } from "../../domain/projectDefaults";
import { useStudioStore } from "../../domain/studioStore";

export function ProductionPage() {
  const project = useStudioStore((state) => state.project);
  const loadDemo = useStudioStore((state) => state.loadDemo);
  const size = getFormatSize(project.format);
  const durationInFrames = Math.max(getProjectDurationFrames(project), 1);
  const inputProps = useMemo(() => ({ project }), [project]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl">Phase 2 · Production</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#f3ead8]/70">
            The script becomes a screenplay graph: scenes, shots, camera, layers, licensed SFX
            cues. Remotion plays that graph. This clip is the motion-comic proof — not a slideshow.
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg border border-[#d4a24a] px-4 py-2 text-sm text-[#d4a24a]"
          onClick={() => loadDemo()}
        >
          Load dusk-path demo
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#f3ead8]/10 bg-black">
        <Player
          component={StoryVideo}
          inputProps={inputProps}
          durationInFrames={durationInFrames}
          fps={project.fps ?? 30}
          compositionWidth={size.width}
          compositionHeight={size.height}
          controls
          loop
          style={{ width: "100%", aspectRatio: `${size.width} / ${size.height}` }}
        />
      </div>

      <ol className="space-y-4">
        {(project.scenes ?? []).map((scene, sceneIndex) => (
          <li key={scene.id} className="rounded-xl border border-[#f3ead8]/10 p-4">
            <p className="text-xs tracking-wide text-[#d4a24a] uppercase">
              Scene {sceneIndex + 1} · {scene.location} · {scene.mood}
            </p>
            <p className="mt-1 text-sm text-[#f3ead8]/70">{scene.intent}</p>
            <ul className="mt-3 space-y-2">
              {scene.shots.map((shot, shotIndex) => (
                <li key={shot.id} className="rounded-lg bg-[#120f14] px-3 py-2 text-sm">
                  <span className="text-[#d4a24a]">
                    Shot {shotIndex + 1} · {shot.camera.angle} · {shot.camera.move}
                  </span>
                  <span className="mt-1 block text-[#f3ead8]/75">{shot.action}</span>
                  <span className="mt-1 block text-xs text-[#f3ead8]/45">
                    SFX cue: {shot.sfxCue?.label ?? "none"} ({shot.sfxCue?.licensedSource ?? "—"})
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
