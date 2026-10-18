import { canRenderMediaOnWeb, renderMediaOnWeb } from "@remotion/web-renderer";
import { DynamicHost } from "../remotion/compositions/DynamicHost";

export function fileBase(title, formatId) {
  const safe = String(title || "timeless-stories")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `${safe || "timeless-stories"}-${formatId || "video"}`;
}

export function triggerBlobDownload(blob, filename) {
  if (!blob || blob.size < 256) {
    throw new Error("Export produced an empty file. Play the preview, then try again.");
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 15000);
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function withTimeout(promise, ms, message) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = window.setTimeout(() => reject(new Error(message)), ms);
      }),
    ]);
  } finally {
    window.clearTimeout(timer);
  }
}

async function renderOffline({ inputProps, durationInFrames, fps, width, height, onProgress }) {
  const muted = false;
  const check = await canRenderMediaOnWeb({
    container: "mp4",
    videoCodec: "h264",
    width,
    height,
    muted,
  });
  if (!check.canRender) {
    const first = check.issues?.find((issue) => issue.severity === "error") ?? check.issues?.[0];
    throw new Error(first?.message || "This browser cannot encode MP4.");
  }

  const renderOptions = {
    composition: {
      id: "timeless-download",
      component: DynamicHost,
      width,
      height,
      fps,
      durationInFrames,
      defaultProps: inputProps,
    },
    inputProps,
    container: "mp4",
    videoCodec: check.resolvedVideoCodec ?? "h264",
    muted,
    allowHtmlInCanvas: true,
    delayRenderTimeoutInMilliseconds: 30000,
    onProgress: (progress) => onProgress?.(Number(progress.progress) || 0),
    isProduction: true,
  };
  if (!muted) {
    renderOptions.audioCodec = check.resolvedAudioCodec ?? "aac";
  }

  const result = await withTimeout(
    renderMediaOnWeb(renderOptions),
    25000,
    "MP4 encoder stalled, switching to preview capture.",
  );
  const blob = await result.getBlob();
  if (!blob || blob.size < 256) throw new Error("MP4 encoder returned an empty file.");
  return { blob, extension: "mp4" };
}

function pickRecorderMime() {
  const types = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  return types.find((type) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) || "";
}

async function recordPreview({ playerRef, durationInFrames, fps, onProgress }) {
  const player = playerRef?.current;
  const root = player?.getContainerNode?.();
  if (!player || !root) {
    throw new Error("Preview is not ready. Press Play on the video, then Download video.");
  }

  const mime = pickRecorderMime();
  if (!mime) throw new Error("This browser cannot record WebM.");

  const live = root.querySelector("canvas");
  const dest = document.createElement("canvas");
  dest.width = live?.width || Math.max(root.clientWidth, 640);
  dest.height = live?.height || Math.max(root.clientHeight, 360);
  const ctx = dest.getContext("2d");
  const stream = dest.captureStream(Math.min(fps, 30));
  if (!stream.getVideoTracks().length) {
    throw new Error("Could not capture the preview. Try Chrome or Edge.");
  }

  const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
  const chunks = [];
  recorder.ondataavailable = (event) => {
    if (event.data?.size) chunks.push(event.data);
  };
  const stopped = new Promise((resolve, reject) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
    recorder.onerror = () => reject(new Error("Recording failed"));
  });

  let painting = true;
  const paint = () => {
    if (!painting) return;
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, dest.width, dest.height);
    const canvas = root.querySelector("canvas");
    if (canvas) {
      try {
        ctx.drawImage(canvas, 0, 0, dest.width, dest.height);
      } catch {
        // WebGL canvas may be empty for one frame
      }
    }
    requestAnimationFrame(paint);
  };

  player.seekTo(0);
  await wait(60);
  paint();
  recorder.start(250);
  player.play();

  const totalMs = Math.max(1200, (durationInFrames / Math.max(fps, 1)) * 1000);
  const started = Date.now();
  await new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.clearInterval(tick);
      try {
        player.removeEventListener("ended", finish);
      } catch {
        // ignore
      }
      resolve();
    };
    const tick = window.setInterval(() => {
      onProgress?.(Math.min(0.98, (Date.now() - started) / totalMs));
    }, 200);
    try {
      player.addEventListener("ended", finish);
    } catch {
      // timeout only
    }
    window.setTimeout(finish, totalMs + 500);
  });

  painting = false;
  if (recorder.state !== "inactive") recorder.stop();
  try {
    player.pause();
  } catch {
    // ignore
  }
  const blob = await stopped;
  if (!blob.size) throw new Error("Recording was empty.");
  return { blob, extension: "webm" };
}

export async function exportAnimationVideo({
  inputProps,
  durationInFrames,
  fps,
  width,
  height,
  playerRef,
  onProgress,
}) {
  onProgress?.(0.02);
  const errors = [];

  try {
    return await renderOffline({
      inputProps,
      durationInFrames,
      fps,
      width,
      height,
      onProgress,
    });
  } catch (err) {
    errors.push(err.message || String(err));
  }

  try {
    onProgress?.(0.08);
    return await recordPreview({ playerRef, durationInFrames, fps, onProgress });
  } catch (err) {
    errors.push(err.message || String(err));
  }

  throw new Error(errors.filter(Boolean).join(" — ") || "Could not export the video.");
}
