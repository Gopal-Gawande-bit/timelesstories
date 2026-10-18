import { Player } from "@remotion/player";
import { DynamicHost } from "../../remotion/compositions/DynamicHost";

export function PreviewTheater({
  playerRef,
  size,
  fps,
  durationInFrames,
  inputProps,
  playerKey,
  formatLabel,
  modeLabel,
  onDownload,
  downloading,
  downloadProgress,
}) {
  const isPortrait = size.height > size.width;

  return (
    <section className="rounded-3xl bg-neutral-950 p-4 text-white sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-neutral-400">
          {formatLabel} · {size.width}×{size.height} · {modeLabel}
        </p>
        <button
          type="button"
          onClick={onDownload}
          disabled={downloading}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-neutral-950 disabled:opacity-50"
        >
          {downloading
            ? `Downloading video… ${Math.round((downloadProgress || 0) * 100)}%`
            : "Download video"}
        </button>
      </div>
      <div className="grid place-items-center">
        <div
          className={`overflow-hidden bg-black shadow-2xl ring-1 ring-white/10 ${
            isPortrait ? "w-[min(100%,340px)] rounded-[28px]" : "w-full max-w-4xl rounded-xl"
          }`}
          style={{ aspectRatio: `${size.width} / ${size.height}` }}
        >
          <Player
            key={playerKey}
            ref={playerRef}
            component={DynamicHost}
            inputProps={inputProps}
            durationInFrames={durationInFrames}
            fps={fps}
            compositionWidth={size.width}
            compositionHeight={size.height}
            controls
            alwaysShowControls
            clickToPlay
            delayRenderTimeoutInMilliseconds={30000}
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        </div>
      </div>
    </section>
  );
}
