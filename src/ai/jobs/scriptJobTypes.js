export function countWords(text) {
  return String(text ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function targetWordCount(lengthSeconds, wordsPerMinute = 125) {
  return Math.max(40, Math.round((lengthSeconds / 60) * wordsPerMinute));
}

export function stripBannedPhrases(text, bannedPhrases) {
  const phrases = String(bannedPhrases ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  let next = text;
  for (const phrase of phrases) {
    const pattern = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    next = next.replace(pattern, "");
  }
  return next.replace(/[ ]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}
