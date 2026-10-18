import { useMemo, useState } from "react";
import { runScriptJob } from "../../../ai/director/runScriptJob";
import { mcpClient } from "../../../ai/mcp/client";
import { Field } from "../../features/script/Field";
import { GENRES, LENGTHS, SCRIPT_TYPES } from "../../../domain/projectDefaults";
import { useStudioStore } from "../../../domain/studioStore";

function nextVersionNumber(versions) {
  const max = (versions ?? []).reduce((n, item) => Math.max(n, item.version || 0), 0);
  return max + 1;
}

export function ScriptPage() {
  const profiles = useStudioStore((state) => state.profiles);
  const activeProfileId = useStudioStore((state) => state.activeProfileId);
  const project = useStudioStore((state) => state.project);
  const setActiveProfile = useStudioStore((state) => state.setActiveProfile);
  const createProfile = useStudioStore((state) => state.createProfile);
  const updateProfile = useStudioStore((state) => state.updateProfile);
  const deleteProfile = useStudioStore((state) => state.deleteProfile);
  const applyProfileToProject = useStudioStore((state) => state.applyProfileToProject);
  const updateProject = useStudioStore((state) => state.updateProject);

  const profile = useMemo(
    () => profiles.find((item) => item.id === activeProfileId) ?? profiles[0],
    [profiles, activeProfileId],
  );

  const [title, setTitle] = useState(project.script.workingTitle || "");
  const [reviseNotes, setReviseNotes] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  const versions = project.scriptVersions ?? [];
  const currentVersion = versions.find((item) => item.body === project.script.body)?.version;

  async function saveJob(ctx, notes) {
    const latest = useStudioStore.getState().project;
    const version = nextVersionNumber(latest.scriptVersions);
    const entry = {
      version,
      title: ctx.draft.workingTitle,
      body: ctx.draft.body,
      notes,
      createdAt: Date.now(),
    };
    const nextProject = {
      ...latest,
      name: ctx.draft.workingTitle || latest.name,
      genre: profile.genre,
      script: {
        ...latest.script,
        workingTitle: ctx.draft.workingTitle,
        logline: ctx.draft.logline,
        body: ctx.draft.body,
        language: profile.language,
        type: profile.scriptType,
        lengthId: profile.lengthId,
        lengthSeconds: ctx.draft.lengthSeconds,
        meta: {
          profileId: profile.id,
          profileName: profile.name,
          topic: ctx.draft.workingTitle,
          wordCount: ctx.draft.wordCount,
          steps: ctx.steps,
          generatedAt: Date.now(),
          providerId: ctx.providerId,
          version,
        },
      },
      scriptVersions: [...(latest.scriptVersions ?? []), entry],
    };
    await updateProject(nextProject);
    // FUTURE: persist via backend API
    await mcpClient.tools.saveScript(nextProject);
  }

  async function onGenerate(event) {
    event.preventDefault();
    if (!profile || !title.trim()) {
      setError("Pick a preference and type a title.");
      return;
    }
    setError("");
    setRunning(true);
    try {
      await applyProfileToProject(profile);
      const ctx = await runScriptJob({
        topic: title,
        extraNotes: "",
        profile,
        pastScripts: useStudioStore.getState().project.scriptVersions,
        mode: "generate",
      });
      await saveJob(ctx, "initial");
    } catch (jobError) {
      setError(jobError.message || "Could not generate");
    } finally {
      setRunning(false);
    }
  }

  async function onRevise(event) {
    event.preventDefault();
    if (!project.script.body) {
      setError("Generate version 1 first.");
      return;
    }
    if (!reviseNotes.trim()) {
      setError("Write what to change.");
      return;
    }
    setError("");
    setRunning(true);
    try {
      const ctx = await runScriptJob({
        topic: title || project.script.workingTitle,
        extraNotes: reviseNotes,
        profile,
        pastScripts: project.scriptVersions,
        mode: "revise",
        previousBody: project.script.body,
      });
      await saveJob(ctx, reviseNotes);
      setReviseNotes("");
    } catch (jobError) {
      setError(jobError.message || "Could not revise");
    } finally {
      setRunning(false);
    }
  }

  function useVersion(entry) {
    updateProject((current) => ({
      ...current,
      name: entry.title || current.name,
      script: {
        ...current.script,
        workingTitle: entry.title,
        body: entry.body,
        meta: { ...current.script.meta, version: entry.version },
      },
    }));
    setTitle(entry.title || title);
  }

  if (!profile) return null;

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-xl">Script</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#f3ead8]/70">
          Pick a saved briefing, type a title, generate. Then keep that version and revise until it
          feels right. Hindi comes out even if the title is English.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-[#f3ead8]/10 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm text-[#d4a24a]">Preference</h3>
          <div className="flex gap-2">
            <button
              type="button"
              className="text-xs text-[#f3ead8]/60"
              onClick={() => createProfile({ name: "Untitled preference" })}
            >
              New
            </button>
            {profiles.length > 1 ? (
              <button
                type="button"
                className="text-xs text-red-200/70"
                onClick={() => deleteProfile(profile.id)}
              >
                Delete
              </button>
            ) : null}
          </div>
        </div>
        <select
          className="field mt-0"
          value={profile.id}
          onChange={(event) => setActiveProfile(event.target.value)}
        >
          {profiles.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Name">
            <input
              className="field"
              value={profile.name}
              onChange={(event) => updateProfile(profile.id, { name: event.target.value })}
            />
          </Field>
          <Field label="Genre">
            <select
              className="field"
              value={profile.genre}
              onChange={(event) => updateProfile(profile.id, { genre: event.target.value })}
            >
              {GENRES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Shape">
            <select
              className="field"
              value={profile.scriptType}
              onChange={(event) => updateProfile(profile.id, { scriptType: event.target.value })}
            >
              {SCRIPT_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Voiceover length">
            <select
              className="field"
              value={profile.lengthId}
              onChange={(event) => updateProfile(profile.id, { lengthId: event.target.value })}
            >
              {LENGTHS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Language">
            <input
              className="field"
              value={profile.language}
              onChange={(event) => updateProfile(profile.id, { language: event.target.value })}
            />
          </Field>
        </div>
        <Field label="Instructions (optional — informal is fine)">
          <textarea
            className="field min-h-24"
            value={profile.instructions}
            onChange={(event) => updateProfile(profile.id, { instructions: event.target.value })}
            placeholder="e.g. slow oral village voice, no lecture at the end"
          />
        </Field>
      </div>

      <form className="space-y-4 rounded-xl border border-[#f3ead8]/10 p-4" onSubmit={onGenerate}>
        <h3 className="text-sm text-[#d4a24a]">This video</h3>
        <Field label="Title">
          <input
            className="field"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="shapit tota"
          />
        </Field>
        <button
          type="submit"
          disabled={running}
          className="rounded-lg border border-[#d4a24a] px-4 py-2 text-sm text-[#d4a24a] disabled:opacity-50"
        >
          {running ? "Writing…" : "Generate"}
        </button>
        <p className="text-xs text-[#f3ead8]/40">
          Generate starts a new version 1-style draft. Older versions stay in the list below.
        </p>
      </form>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      {project.script.body ? (
        <div className="space-y-4 rounded-xl border border-[#f3ead8]/10 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm text-[#d4a24a]">
              Current script{currentVersion ? ` · v${currentVersion}` : ""}
            </h3>
            <span className="text-xs text-[#f3ead8]/45">{profile.name}</span>
          </div>
          <h4 className="text-lg">{project.script.workingTitle}</h4>
          <pre className="whitespace-pre-wrap text-sm leading-7 text-[#f3ead8]/90">{project.script.body}</pre>

          <form className="space-y-3 border-t border-[#f3ead8]/10 pt-4" onSubmit={onRevise}>
            <Field label="Change this version">
              <textarea
                className="field min-h-20"
                value={reviseNotes}
                onChange={(event) => setReviseNotes(event.target.value)}
                placeholder="e.g. make the ending sadder, shorter, more dialogue"
              />
            </Field>
            <button
              type="submit"
              disabled={running}
              className="rounded-lg border border-[#f3ead8]/25 px-4 py-2 text-sm disabled:opacity-50"
            >
              {running ? "Revising…" : "Revise — keep previous versions"}
            </button>
          </form>
        </div>
      ) : null}

      {versions.length ? (
        <div className="space-y-2">
          <h3 className="text-sm text-[#d4a24a]">Versions</h3>
          <ul className="space-y-2">
            {[...versions].reverse().map((entry) => (
              <li
                key={`${entry.version}-${entry.createdAt}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#120f14] px-3 py-2 text-sm"
              >
                <span>
                  v{entry.version}
                  {entry.notes && entry.notes !== "initial" ? ` · ${entry.notes}` : " · first draft"}
                </span>
                <button type="button" className="text-[#d4a24a]" onClick={() => useVersion(entry)}>
                  Use this
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
