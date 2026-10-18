import { countWords, targetWordCount } from "../jobs/scriptJobTypes";
import { WORDS_PER_MINUTE } from "../../domain/projectDefaults";

const PAD =
  "थोड़ी देर रुकिए। साँस अंदर, साँस बाहर। दृश्य वही रहता है, केवल देखने वाला थोड़ा और पास आ जाता है।";

export async function lengthAgent(ctx) {
  const target = ctx.brief?.targetWords ?? targetWordCount(ctx.draft.lengthSeconds, WORDS_PER_MINUTE);
  let body = ctx.draft.body;
  let words = countWords(body);
  const actions = [];

  while (words < target * 0.9) {
    body = `${body}\n\n${PAD}`;
    words = countWords(body);
    actions.push("padded");
    if (actions.length > 20) break;
  }

  if (words > target * 1.2) {
    const sliced = body.split(/\s+/).slice(0, Math.round(target)).join(" ");
    body = `${sliced}।`;
    words = countWords(body);
    actions.push("trimmed");
  }

  ctx.steps.push({
    id: "length",
    label: "Length",
    detail: `${words} / ${target} words${actions.length ? ` · ${actions.join(", ")}` : ""}`,
  });

  return {
    ...ctx,
    draft: { ...ctx.draft, body, wordCount: words },
  };
}
