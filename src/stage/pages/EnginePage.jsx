import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { getFormatMeta } from "../../domain/projectDefaults";
import { getMediaObjectUrl } from "../../domain/mediaStore";
import { useStudioStore } from "../../domain/studioStore";
import {
  copyText,
  downloadTextFile,
  getAnimationMode,
  getAnimationPackageJson,
  getChatGptPrompt,
  getTemplateCode,
} from "../animation/chatGptKit";
import { compileUploadedCode } from "../animation/compileUserCode";
import { PreviewTheater } from "../components/PreviewTheater";
import { exportAnimationVideo, fileBase, triggerBlobDownload } from "../exportVideo";

const TABS = [
  { id: "prompt", label: "ChatGPT prompt" },
  { id: "packages", label: "package.json" },
  { id: "template", label: "Template" },
];

export function EnginePage() {
  const project = useStudioStore((state) => state.project);
  const updateProject = useStudioStore((state) => state.updateProject);
  const playerRef = useRef(null);
  const fileRef = useRef(null);
  const [tab, setTab] = useState("prompt");
  const [audioSrc, setAudioSrc] = useState(null);
  const [draft, setDraft] = useState(project.animationSource || "");
  const [pasteOpen, setPasteOpen] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const ready = Boolean((project.script?.body || "").trim());
  const mode = getAnimationMode(project);
  const format = getFormatMeta(project.deliveryFormat || project.format);
  const prompt = useMemo(() => getChatGptPrompt(project), [project]);
  const pkg = useMemo(() => getAnimationPackageJson(project), [project]);
  const template = useMemo(() => getTemplateCode(project), [project]);
  const tabText = tab === "packages" ? pkg : tab === "template" ? template : prompt;

  useEffect(() => {
    setDraft(project.animationSource || "");
  }, [project.animationSource]);

  useEffect(() => {
    let url;
    if (!project.voiceover?.id) {
      setAudioSrc(null);
      return undefined;
    }
    getMediaObjectUrl(project.voiceover.id).then((value) => {
      url = value;
      setAudioSrc(value);
    });
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [project.voiceover?.id]);

  const fps = project.fps || 30;
  const durationSeconds = project.voiceover?.durationSeconds || 30;
  const compiled = useMemo(() => {
    if (!project.animationSource?.trim()) {
      return { durationInFrames: Math.max(30, Math.round(durationSeconds * fps)), error: "" };
    }
    try {
      const result = compileUploadedCode(project.animationSource, { fps, durationSeconds });
      return { durationInFrames: result.durationInFrames, error: "" };
    } catch (err) {
      return {
        durationInFrames: Math.max(30, Math.round(durationSeconds * fps)),
        error: err.message || "Code failed",
      };
    }
  }, [project.animationSource, fps, durationSeconds]);

  const inputProps = useMemo(
    () => ({
      source: project.animationSource || "",
      audioSrc,
      fps,
      durationSeconds,
      script: project.script?.body,
      title: project.script?.workingTitle || project.name,
      notes: project.stageInstructions,
      animationMode: mode,
    }),
    [project, audioSrc, fps, durationSeconds, mode],
  );

  if (!ready) return <Navigate to="/stage" replace />;

  async function markCopied(id) {
    setCopied(id);
    window.setTimeout(() => setCopied(""), 1600);
  }

  async function playCode(text) {
    setError("");
    try {
      compileUploadedCode(text, { fps, durationSeconds });
      await updateProject({ animationSource: text });
      setDraft(text);
      setPasteOpen(false);
    } catch (err) {
      setError(err.message || "Could not run this code");
    }
  }

  async function onUploadFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const text = await file.text();
    setDraft(text);
    setPasteOpen(true);
  }

  async function onDownloadVideo() {
    if (!project.animationSource?.trim()) {
      setError("Play animation code first, then download the video.");
      return;
    }
    setError("");
    const base = fileBase(project.script?.workingTitle || project.name, format.id);
    let fileHandle = null;
    try {
      if (typeof window.showSaveFilePicker === "function") {
        fileHandle = await window.showSaveFilePicker({
          suggestedName: `${base}.mp4`,
          types: [
            {
              description: "Video",
              accept: {
                "video/mp4": [".mp4"],
                "video/webm": [".webm"],
              },
            },
          ],
        });
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
    }

    setDownloading(true);
    setDownloadProgress(0);
    try {
      const file = await exportAnimationVideo({
        inputProps,
        durationInFrames: compiled.durationInFrames,
        fps,
        width: format.width,
        height: format.height,
        playerRef,
        onProgress: setDownloadProgress,
      });
      const filename = `${base}.${file.extension}`;
      if (fileHandle) {
        const writable = await fileHandle.createWritable();
        await writable.write(file.blob);
        await writable.close();
      } else {
        triggerBlobDownload(file.blob, filename);
      }
    } catch (err) {
      setError(err.message || "Could not download the video");
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl">Animation engine</h2>
        <p className="mt-2 max-w-3xl text-sm text-neutral-600">
          Copy the prompt and package.json into ChatGPT, paste the file it returns, play, then download
          the video. 2D/3D and format come from Details.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-neutral-200">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`rounded-full px-3 py-1 text-sm ${
                  tab === item.id ? "bg-neutral-900 text-white" : "bg-neutral-100"
                }`}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-neutral-200 px-3 py-1 text-sm"
              onClick={async () => {
                await copyText(tabText);
                markCopied("tab");
              }}
            >
              {copied === "tab" ? "Copied" : "Copy"}
            </button>
            <button
              type="button"
              className="rounded-lg border border-neutral-200 px-3 py-1 text-sm"
              onClick={() =>
                downloadTextFile(
                  tab === "packages" ? "package.json" : tab === "template" ? "template.jsx" : "chatgpt-prompt.txt",
                  tabText,
                )
              }
            >
              Download text
            </button>
          </div>
        </div>
        <textarea
          readOnly
          className="min-h-[200px] max-h-[360px] w-full resize-y bg-neutral-50 p-4 font-mono text-xs leading-5 text-neutral-800 outline-none"
          value={tabText}
        />
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold tracking-wide text-neutral-500 uppercase">ChatGPT animation file</h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm"
              onClick={() => setPasteOpen((open) => !open)}
            >
              Paste code
            </button>
            <button
              type="button"
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm"
              onClick={() => fileRef.current?.click()}
            >
              Upload file
            </button>
            <button
              type="button"
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm"
              onClick={async () => {
                if (project.animationSource) {
                  await copyText(project.animationSource);
                  markCopied("code");
                }
              }}
              disabled={!project.animationSource}
            >
              {copied === "code" ? "Copied" : "Copy current code"}
            </button>
            <button
              type="button"
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm"
              onClick={() => playCode(template)}
            >
              Play template
            </button>
            <button
              type="button"
              className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm text-white"
              onClick={() => playCode(draft)}
            >
              Play this code
            </button>
          </div>
        </div>
        <input ref={fileRef} type="file" accept=".js,.jsx,.txt,.json" className="hidden" onChange={onUploadFile} />
        {pasteOpen || !project.animationSource ? (
          <textarea
            className="min-h-32 w-full rounded-2xl border border-neutral-200 p-4 font-mono text-xs leading-5"
            placeholder="Paste ChatGPT’s StoryVideo file here, then Play this code."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            spellCheck={false}
          />
        ) : null}
        {error || compiled.error ? <p className="text-sm text-red-600">{error || compiled.error}</p> : null}
      </section>

      <PreviewTheater
        playerRef={playerRef}
        size={format}
        fps={fps}
        durationInFrames={compiled.durationInFrames}
        inputProps={inputProps}
        playerKey={`${project.updatedAt}-${format.id}-${mode}`}
        formatLabel={format.label}
        modeLabel={mode === "3d" ? "3D" : "2D"}
        onDownload={onDownloadVideo}
        downloading={downloading}
        downloadProgress={downloadProgress}
      />
    </div>
  );
}
