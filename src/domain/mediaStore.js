import { db } from "./db";

export async function saveMediaBlob({ fileName, mime, blob }) {
  // FUTURE: upload voiceover to backend object storage
  const id = crypto.randomUUID();
  await db.media.put({ id, fileName, mime, blob });
  return id;
}

export async function getMediaRecord(id) {
  if (!id) return null;
  return db.media.get(id);
}

export async function getMediaObjectUrl(id) {
  const record = await getMediaRecord(id);
  if (!record?.blob) return null;
  return URL.createObjectURL(record.blob);
}

export function readAudioDuration(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.addEventListener("loadedmetadata", () => {
      const duration = audio.duration;
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(duration) ? duration : 0);
    });
    audio.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read audio duration"));
    });
    audio.src = url;
  });
}
