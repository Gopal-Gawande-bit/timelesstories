import { stripBannedPhrases } from "../jobs/scriptJobTypes";

const HOUSE_BANNED = "dosto, shocking, subscribe, like and share, clickbait";

export async function critiqueAgent(ctx) {
  const notes = [];
  let body = ctx.draft.body;
  const cleaned = stripBannedPhrases(body, HOUSE_BANNED);
  if (cleaned !== body) {
    notes.push("Removed house-banned filler");
    body = cleaned;
  }

  if (ctx.profile.genre === "kids" || ctx.profile.scriptType === "kids") {
    const harsh = /खून|हत्या|डरावना भूत/i;
    if (harsh.test(body)) {
      body = body.replace(harsh, "अजीब सी बात");
      notes.push("Softened kids-unsafe wording");
    }
  }

  ctx.steps.push({
    id: "critique",
    label: "Critique",
    detail: notes.length ? notes.join("; ") : "Voice and safety checks passed",
  });

  return {
    ...ctx,
    draft: { ...ctx.draft, body, wordCount: body.trim().split(/\s+/).filter(Boolean).length },
    critiqueNotes: notes,
  };
}
