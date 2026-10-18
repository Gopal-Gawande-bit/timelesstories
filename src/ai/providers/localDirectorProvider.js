import { LENGTHS, WORDS_PER_MINUTE } from "../../domain/projectDefaults";
import { countWords, stripBannedPhrases, targetWordCount } from "../jobs/scriptJobTypes";
import { getGenrePack } from "../prompts/genrePacks";
import { buildChannelBrief } from "../prompts/channelVoice";

function inferPlace(profile, topic) {
  if (profile.genre === "mystery") return "पुरानी गली";
  if (profile.genre === "kids" || profile.scriptType === "kids") return "छोटा गाँव";
  if (profile.genre === "explanation" || profile.scriptType === "essay") return "रोज़मर्रा का शहर";
  if (profile.genre === "podcast" || profile.scriptType === "podcast") return "एक शांत कमरा";
  return "एक पुराना गाँव";
}

function inferCharacter(profile) {
  if (profile.scriptType === "kids" || profile.genre === "kids") return "छोटा आरव";
  if (profile.genre === "mystery") return "गवाह";
  if (profile.scriptType === "podcast") return "मेज़बान";
  if (profile.scriptType === "essay") return "हम";
  if (profile.scriptType === "dialogue") return "दो आवाज़ें";
  return "कहानीकार";
}

function growToLength(paragraphs, pads, needed) {
  const lines = [...paragraphs];
  let guard = 0;
  while (countWords(lines.join(" ")) < needed && guard < 24) {
    lines.push(pads[guard % pads.length]);
    guard += 1;
  }
  return lines;
}

function trimToLength(text, needed) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= needed + 12) return text;
  return `${words.slice(0, needed).join(" ")}।`;
}

function reviseFromPrevious(previousBody, extra, instructions, needed) {
  const change = extra || instructions || "इसे और साफ़ बोली में कहो।";
  const lead = `इस संस्करण में निर्देश: ${change}\n\n`;
  return trimToLength(`${lead}${previousBody}`, Math.round(needed * 1.05));
}

export const localDirectorProvider = {
  id: "local-director",
  label: "In-repo Director (current LLM role)",

  async compose(ctx) {
    const profile = ctx.profile;
    const topic = ctx.topic.trim() || "एक अधूरी याद";
    const extra = ctx.extraNotes.trim();
    const length = LENGTHS.find((item) => item.id === profile.lengthId) ?? LENGTHS[1];
    const needed = targetWordCount(length.seconds, WORDS_PER_MINUTE);
    void buildChannelBrief(profile);

    if (ctx.mode === "revise" && ctx.previousBody) {
      let body = reviseFromPrevious(ctx.previousBody, extra, profile.instructions, needed);
      body = stripBannedPhrases(body, "dosto, shocking, subscribe");
      return {
        workingTitle: topic,
        logline: extra || "Revised from the previous version.",
        body,
        wordCount: countWords(body),
        targetWords: needed,
        lengthSeconds: length.seconds,
      };
    }

    const pack = getGenrePack(profile.genre);
    const vars = {
      topic,
      place: inferPlace(profile, topic),
      character: inferCharacter(profile),
    };

    let beats = growToLength(pack.beats(vars), pack.pads(vars), needed);
    if (profile.instructions) {
      beats.splice(1, 0, `लेखक का निर्देश: ${profile.instructions}`);
    }
    if (extra) {
      beats.splice(1, 0, `इस बार का निर्देश: ${extra}`);
    }
    if (profile.scriptType === "dialogue") {
      beats.splice(2, 0, "कहानीकार: सुनो।\nदूसरी आवाज़: हाँ, आगे कहो।");
    }

    let body = beats.join("\n\n");
    body = stripBannedPhrases(body, "dosto, shocking, subscribe");
    if (countWords(body) > needed * 1.15) {
      body = trimToLength(body, needed);
    }

    return {
      workingTitle: topic,
      logline: pack.logline(vars),
      body,
      wordCount: countWords(body),
      targetWords: needed,
      lengthSeconds: length.seconds,
    };
  },
};
