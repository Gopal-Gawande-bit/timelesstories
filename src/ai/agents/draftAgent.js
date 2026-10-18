import { localDirectorProvider } from "../providers/localDirectorProvider";
import { getScriptProvider } from "../providers/llmProvider";

export async function draftAgent(ctx) {
  // FUTURE: getScriptProvider() returns Gemini/OpenAI when operator settings exist.
  const provider = getScriptProvider() ?? localDirectorProvider;
  const draft = await provider.compose(ctx);
  ctx.steps.push({
    id: "draft",
    label: "Draft",
    detail: `${provider.label} · ${draft.wordCount} words`,
  });
  return { ...ctx, draft, providerId: provider.id };
}
