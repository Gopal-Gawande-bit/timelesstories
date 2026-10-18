import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { readAudioDuration, saveMediaBlob } from "../../domain/mediaStore";
import { useStudioStore } from "../../domain/studioStore";
import { getTemplateCode, inferStoryFields, isHouseTemplate } from "../animation/chatGptKit";
import { FormatToggle } from "../components/FormatToggle";
import { ModeToggle } from "../components/ModeToggle";

export function IngestPage() {
  const navigate = useNavigate();
  const project = useStudioStore((state) => state.project);
  const updateProject = useStudioStore((state) => state.updateProject);
  const [script, setScript] = useState(project.script.body || "");
  const [instructions, setInstructions] = useState(project.stageInstructions || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onAudio(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      const durationSeconds = await readAudioDuration(file);
      const id = await saveMediaBlob({ fileName: file.name, mime: file.type, blob: file });
      await updateProject((current) => ({
        ...current,
        voiceover: { id, fileName: file.name, durationSeconds },
      }));
    } catch (err) {
      setError(err.message || "Could not save voiceover");
    }
  }

  async function onScriptFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setScript(await file.text());
  }

  async function onGenerate(event) {
    event.preventDefault();
    if (!script.trim()) {
      setError("Add a script.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await updateProject((current) => {
        const story = inferStoryFields(script, current.script);
        const next = {
          ...current,
          name: story.title,
          format: current.deliveryFormat,
          deliveryFormat: current.deliveryFormat,
          stageInstructions: instructions,
          animationMode: current.animationMode ?? "2d",
          script: {
            ...current.script,
            body: script,
            workingTitle: story.title,
            logline: story.logline,
          },
        };
        const swap = !current.animationSource || isHouseTemplate(current.animationSource);
        return {
          ...next,
          animationSource: swap ? getTemplateCode(next) : current.animationSource,
        };
      });
      navigate("/stage/play");
    } catch (err) {
      setError(err.message || "Could not generate the kit");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="space-y-8" onSubmit={onGenerate}>
      <div>
        <h2 className="text-2xl">This video</h2>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600">
          Pick format and 2D or 3D here. Generate builds the ChatGPT prompt and the preview for that
          screen. To change them, come back to this page and Generate again.
        </p>
      </div>

      <label className="block">
        <span className="text-sm font-medium">Voiceover</span>
        <input className="mt-2 block w-full text-sm" type="file" accept="audio/*" onChange={onAudio} />
        <p className="mt-1 text-xs text-neutral-500">
          {project.voiceover.fileName
            ? `${project.voiceover.fileName} · ${Math.round(project.voiceover.durationSeconds || 0)}s`
            : "mp3 / wav / m4a — stored in this project"}
        </p>
      </label>

      <label className="block">
        <span className="text-sm font-medium">Script</span>
        <textarea
          className="mt-2 min-h-40 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          value={script}
          onChange={(event) => setScript(event.target.value)}
        />
        <input className="mt-2 block text-sm" type="file" accept=".txt,text/plain" onChange={onScriptFile} />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Instructions for the video</span>
        <textarea
          className="mt-2 min-h-24 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          value={instructions}
          onChange={(event) => setInstructions(event.target.value)}
          placeholder="e.g. slow dusk camera, quiet folk mood, no jump cuts"
        />
      </label>

      <FormatToggle
        value={project.deliveryFormat}
        onChange={(deliveryFormat) =>
          updateProject((current) => ({
            ...current,
            deliveryFormat,
            format: deliveryFormat,
          }))
        }
      />

      <ModeToggle
        value={project.animationMode}
        onChange={(animationMode) => updateProject((current) => ({ ...current, animationMode }))}
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {busy ? "Preparing…" : "Generate"}
      </button>
    </form>
  );
}
