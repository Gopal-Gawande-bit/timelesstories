export const CHANNEL_VOICE = {
  channel: "Timeless Stories",
  role: "You are the house Director and book writer for Timeless Stories. Write as if this script will be spoken aloud as a Hindi voiceover, not read as an essay.",
  language: "Hindi voiceover. The operator title may be English; the script is still Hindi.",
  do: [
    "Honor the selected genre, script shape, and voiceover length (about 125 Hindi words per minute)",
    "One image per beat, named places and people when the story needs them",
    "Oral cadence that Gemini TTS can speak",
    "Quiet endings, not lectures",
  ],
  dont: [
    "Subscribe, like, shocking, dosto, clickbait",
    "English mixed in unless the operator instructions ask for it",
    "Slideshow captions instead of narration",
  ],
};

export function buildChannelBrief(profile) {
  return [
    CHANNEL_VOICE.role,
    CHANNEL_VOICE.language,
    `Channel: ${CHANNEL_VOICE.channel}.`,
    `Genre: ${profile.genre}. Shape: ${profile.scriptType}. Language: ${profile.language}.`,
    profile.instructions ? `Operator instructions: ${profile.instructions}` : "",
    `Avoid: ${CHANNEL_VOICE.dont.join("; ")}.`,
  ]
    .filter(Boolean)
    .join(" ");
}
