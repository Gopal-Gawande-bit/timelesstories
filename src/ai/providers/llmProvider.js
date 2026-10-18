// FUTURE: operator-facing LLM setup (Gemini / OpenAI / backend proxy).
// Same Director job will call this instead of localDirectorProvider.
export const llmProvider = {
  id: "hosted-llm",
  label: "Hosted LLM (not wired)",
  enabled: false,

  async compose() {
    throw new Error("FUTURE: hosted LLM provider is not configured yet.");
  },
};

export function getScriptProvider() {
  // FUTURE: read operator provider choice from settings.
  return null;
}
