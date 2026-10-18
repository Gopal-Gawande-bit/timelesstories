import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { Player } from "@remotion/player";
import { LiveVideo } from "../../remotion/compositions/LiveVideo";
import { getFormatSize } from "../../domain/projectDefaults";
import { getMediaObjectUrl } from "../../domain/mediaStore";
import { listCutVersions, saveCutVersion } from "../../domain/lotStore";
import { useStudioStore } from "../../domain/studioStore";
import {
  applySceneNoteToSource,
  applyVideoNoteToSource,
  compileAnimationSource,
  ensureAnimationSource,
  programDurationFrames,
  projectWithProgram,
} from "../animation/animationProgram";
import { SourceModal } from "../components/SourceModal";
import { finishLooksAndSave } from "../finishLooks";

function shotTimeline(project) {
  let from = 0;
  return (project.scenes ?? []).flatMap((scene, sceneIndex) =>
    (scene.shots ?? []).map((shot, shotIndex) => {
      const start = from;
      from += shot.durationFrames;
      return { scene, shot, start, sceneIndex, shotIndex };
    }),
  );
}

export function EditPage() {
  const project = useStudioStore((state) => state.project);
  const updateProject = useStudioStore((state) => state.updateProject);
  const playerRef = useRef(null);
  const [audioSrc, setAudioSrc] = useState(null);
  const [sceneNotes, setSceneNotes] = useState("");
  const [videoNotes, setVideoNotes] = useState("");
  const [versions, setVersions] = useState([]);
  const [activeStart, setActiveStart] = useState(0);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [sourceError, setSourceError] = useState("");
  const [applyHint, setApplyHint] = useState("");

  useEffect(() => {
    if (!project.scenes.length || project.animationSource?.trim()) return;
    updateProject((current) => ensureAnimationSource(current));
  }, [project.scenes.length, project.animationSource, updateProject]);

  useEffect(() => {
    let url;
    getMediaObjectUrl(project.voiceover.id).then((value) => {
      url = value;
      setAudioSrc(value);
    });
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [project.voiceover.id]);

  useEffect(() => {
    listCutVersions(project.id).then(setVersions);
  }, [project.id, project.updatedAt]);

  useEffect(() => {
    const unlocked =
      project.cast.some((item) => !item.assetId) || project.sets.some((item) => !item.assetId);
    if (unlocked) finishLooksAndSave();
  }, [project.cast, project.sets]);

  const compiled = useMemo(() => {
    try {
      if (!project.animationSource?.trim()) return { program: null, error: "" };
      return { program: compileAnimationSource(project.animationSource), error: "" };
    } catch (err) {
      return { program: null, error: err.message || "Animation code failed" };
    }
  }, [project.animationSource]);

  const size = getFormatSize(project.deliveryFormat || project.format);
  const durationInFrames = Math.max(
    compiled.program ? programDurationFrames(compiled.program) : 1,
    1,
  );
  const inputProps = useMemo(
    () => ({ program: compiled.program, audioSrc }),
    [compiled.program, audioSrc],
  );
  const timeline = useMemo(() => shotTimeline(project), [project]);
  const isPortrait = size.height > size.width;
  const activeItem = timeline.find((item) => item.start === activeStart) ?? timeline[0];

  if (!project.scenes.length) return <Navigate to="/stage" replace />;

  function seek(frame) {
    setActiveStart(frame);
    playerRef.current?.seekTo(frame);
    playerRef.current?.play();
  }

  async function persistCut(next, notes) {
    await updateProject(next);
    await saveCutVersion({
      projectId: next.id,
      notes,
      snapshot: {
        scenes: next.scenes,
        cast: next.cast,
        sets: next.sets,
        deliveryFormat: next.deliveryFormat,
        animationMode: next.animationMode,
        animationSource: next.animationSource,
        scriptBody: next.script.body,
        voiceover: next.voiceover,
      },
    });
    setVersions(await listCutVersions(next.id));
  }

  async function applyScene() {
    if (!sceneNotes.trim() || !activeItem) return;
    const source = applySceneNoteToSource(project.animationSource, activeItem.scene.id, sceneNotes);
    const next = projectWithProgram(project, source);
    await persistCut(next, `scene ${activeItem.sceneIndex + 1}`);
    setSceneNotes("");
    setApplyHint("Scene updated — camera, timing, and captions in the player changed.");
  }

  async function applyVideo() {
    if (!videoNotes.trim()) return;
    const source = applyVideoNoteToSource(project.animationSource, videoNotes);
    const next = projectWithProgram(project, source);
    await persistCut(next, "whole video");
    setVideoNotes("");
    setApplyHint("Whole video rewritten — play from the start to see the new cut.");
    seek(0);
  }

  async function applyPastedSource(source) {
    const next = projectWithProgram(project, source);
    await persistCut(next, "pasted animation code");
    setSourceError("");
    setSourceOpen(false);
    setApplyHint("Your animation code is now what the player is running.");
  }

  async function useVersion(record) {
    const source = record.snapshot.animationSource;
    if (source) {
      await updateProject(projectWithProgram(project, source));
      return;
    }
    await updateProject((current) =>
      ensureAnimationSource({
        ...current,
        scenes: record.snapshot.scenes,
        cast: record.snapshot.cast,
        sets: record.snapshot.sets,
        deliveryFormat: record.snapshot.deliveryFormat,
        animationMode: record.snapshot.animationMode ?? current.animationMode,
        format: record.snapshot.deliveryFormat,
        voiceover: record.snapshot.voiceover ?? current.voiceover,
        script: { ...current.script, body: record.snapshot.scriptBody ?? current.script.body },
      }),
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl">Edit</h2>
          <p className="mt-1 text-sm text-neutral-500">
            {project.script.workingTitle || project.name} · {project.animationMode === "3d" ? "3D" : "2D"} ·{" "}
            {project.deliveryFormat}
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
          onClick={() => setSourceOpen(true)}
        >
          View render code
        </button>
      </div>

      {compiled.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{compiled.error}</p>
      ) : null}
      {applyHint ? <p className="text-sm text-neutral-500">{applyHint}</p> : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.8fr)]">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-950">
          {compiled.program ? (
            <Player
              key={project.updatedAt}
              ref={playerRef}
              component={LiveVideo}
              inputProps={inputProps}
              durationInFrames={durationInFrames}
              fps={project.fps ?? 30}
              compositionWidth={size.width}
              compositionHeight={size.height}
              controls
              style={{
                width: "100%",
                maxHeight: isPortrait ? 720 : undefined,
                aspectRatio: `${size.width} / ${size.height}`,
                margin: "0 auto",
              }}
            />
          ) : (
            <div className="grid aspect-video place-items-center text-sm text-neutral-400">Waiting for animation code…</div>
          )}
        </div>

        <aside className="flex max-h-[720px] flex-col gap-4">
          <section className="min-h-0 flex-1 overflow-auto rounded-2xl border border-neutral-200 p-3">
            <h3 className="mb-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase">Scenes</h3>
            <ul className="space-y-1.5">
              {timeline.map((item) => {
                const selected = item.start === activeStart;
                return (
                  <li key={item.shot.id}>
                    <button
                      type="button"
                      onClick={() => seek(item.start)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                        selected ? "bg-neutral-900 text-white" : "bg-neutral-50 hover:bg-neutral-100"
                      }`}
                    >
                      <span className="block text-xs opacity-70">
                        Scene {item.sceneIndex + 1} · Shot {item.shotIndex + 1} · {item.shot.camera?.move}
                      </span>
                      <span className="line-clamp-2">{item.shot.voLine || item.shot.action}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="space-y-3 rounded-2xl border border-neutral-200 p-3">
            <label className="block text-xs font-semibold tracking-wide text-neutral-500 uppercase">
              Scene improvement
              <span className="mt-1 block font-normal normal-case text-neutral-400">
                Selected scene {activeItem ? activeItem.sceneIndex + 1 : "—"}
              </span>
              <textarea
                className="mt-2 min-h-16 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-normal normal-case text-neutral-900"
                placeholder="e.g. slower camera, closer on the boy, bigger text"
                value={sceneNotes}
                onChange={(event) => setSceneNotes(event.target.value)}
              />
            </label>
            <button
              type="button"
              className="w-full rounded-lg border border-neutral-300 py-2 text-sm"
              onClick={applyScene}
            >
              Apply to this scene
            </button>

            <label className="block text-xs font-semibold tracking-wide text-neutral-500 uppercase">
              Video improvement
              <textarea
                className="mt-2 min-h-16 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-normal normal-case text-neutral-900"
                placeholder="e.g. whole film slower, dusk, less shake"
                value={videoNotes}
                onChange={(event) => setVideoNotes(event.target.value)}
              />
            </label>
            <button
              type="button"
              className="w-full rounded-lg bg-neutral-900 py-2 text-sm text-white"
              onClick={applyVideo}
            >
              Apply to whole video
            </button>
          </section>

          <section className="rounded-2xl border border-neutral-200 p-3">
            <h3 className="mb-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase">Versions</h3>
            <ul className="space-y-1.5">
              {versions.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate text-neutral-600">
                    {new Date(item.createdAt).toLocaleTimeString()}
                    {item.notes ? ` · ${item.notes}` : ""}
                  </span>
                  <button type="button" className="shrink-0 underline" onClick={() => useVersion(item)}>
                    Use
                  </button>
                </li>
              ))}
              {!versions.length ? <li className="text-xs text-neutral-400">None yet</li> : null}
            </ul>
          </section>
        </aside>
      </div>

      <SourceModal
        open={sourceOpen}
        source={project.animationSource}
        error={sourceError}
        onClose={() => setSourceOpen(false)}
        onApply={applyPastedSource}
      />
    </div>
  );
}
