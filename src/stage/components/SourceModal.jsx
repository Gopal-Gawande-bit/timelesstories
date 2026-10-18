import { useEffect, useRef, useState } from "react";
import { downloadTextFile, getAnimationPackageJson } from "../animation/animationProgram";

export function SourceModal({ open, source, error, onClose, onApply }) {
  const [tab, setTab] = useState("code");
  const [draft, setDraft] = useState(source ?? "");
  const [paste, setPaste] = useState("");
  const [localError, setLocalError] = useState("");
  const fileRef = useRef(null);
  const pkg = getAnimationPackageJson();

  useEffect(() => {
    if (open) {
      setDraft(source ?? "");
      setPaste("");
      setLocalError("");
      setTab("code");
    }
  }, [open, source]);

  if (!open) return null;

  const working = tab === "paste" ? paste : draft;

  async function applySource(text) {
    try {
      setLocalError("");
      await onApply(text);
    } catch (err) {
      setLocalError(err.message || "Could not run this code");
    }
  }

  async function onUploadFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const text = await file.text();
    setDraft(text);
    setPaste(text);
    setTab("code");
  }

  async function openPasteTab() {
    setTab("paste");
    setLocalError("");
    try {
      const text = await navigator.clipboard?.readText();
      if (text?.trim()) setPaste(text);
    } catch {
      // User can paste by hand if the browser blocks clipboard.
    }
  }

  function copyDraft() {
    navigator.clipboard?.writeText(tab === "packages" ? pkg : working);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex h-[min(88vh,860px)] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 px-4 py-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`rounded-full px-3 py-1 text-sm ${tab === "code" ? "bg-neutral-900 text-white" : "bg-neutral-100"}`}
              onClick={() => setTab("code")}
            >
              Video animation code
            </button>
            <button
              type="button"
              className={`rounded-full px-3 py-1 text-sm ${tab === "paste" ? "bg-neutral-900 text-white" : "bg-neutral-100"}`}
              onClick={openPasteTab}
            >
              Paste code
            </button>
            <button
              type="button"
              className={`rounded-full px-3 py-1 text-sm ${tab === "packages" ? "bg-neutral-900 text-white" : "bg-neutral-100"}`}
              onClick={() => setTab("packages")}
            >
              package.json
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rounded-lg border border-neutral-200 px-3 py-1 text-sm" onClick={copyDraft}>
              Copy
            </button>
            <button
              type="button"
              className="rounded-lg border border-neutral-200 px-3 py-1 text-sm"
              onClick={() => fileRef.current?.click()}
            >
              Upload file
            </button>
            <button
              type="button"
              className="rounded-lg border border-neutral-200 px-3 py-1 text-sm"
              onClick={openPasteTab}
            >
              Paste code
            </button>
            <button
              type="button"
              className="rounded-lg border border-neutral-200 px-3 py-1 text-sm"
              onClick={() =>
                downloadTextFile(tab === "packages" ? "package.json" : "animation.js", tab === "packages" ? pkg : working)
              }
            >
              Download
            </button>
            <button
              type="button"
              className="rounded-lg bg-neutral-900 px-3 py-1 text-sm text-white"
              onClick={() => applySource(working)}
            >
              Apply this code
            </button>
            <button type="button" className="text-sm text-neutral-500" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        <p className="border-b border-neutral-100 px-4 py-2 text-xs text-neutral-500">
          {tab === "paste"
            ? "Paste the LLM’s createProgram() here as text — no file needed — then apply."
            : "This is the live cut. Copy it out, or bring an update back with Upload file or Paste code."}
        </p>

        <input ref={fileRef} type="file" accept=".js,.json,.txt" className="hidden" onChange={onUploadFile} />

        {tab === "packages" ? (
          <pre className="min-h-0 flex-1 overflow-auto p-4 text-xs leading-5 text-neutral-800">{pkg}</pre>
        ) : tab === "paste" ? (
          <textarea
            className="min-h-0 flex-1 resize-none p-4 font-mono text-xs leading-5 text-neutral-800 outline-none"
            value={paste}
            onChange={(event) => setPaste(event.target.value)}
            placeholder={"Paste updated animation code here, then Apply this code.\n\nfunction createProgram() {\n  return { clips: [] };\n}"}
            spellCheck={false}
          />
        ) : (
          <textarea
            className="min-h-0 flex-1 resize-none p-4 font-mono text-xs leading-5 text-neutral-800 outline-none"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            spellCheck={false}
          />
        )}

        {localError || error ? (
          <p className="border-t border-red-100 px-4 py-2 text-sm text-red-600">{localError || error}</p>
        ) : null}
      </div>
    </div>
  );
}
