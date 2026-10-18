import { indexScript, searchIndex } from "./indexStore";

export async function retrieveScriptContext({ profile, pastScripts, topic }) {
  // FUTURE: replace with embeddings retrieval over past channel scripts.
  indexScript();
  searchIndex();

  const recent = (pastScripts ?? []).slice(-3).map((item) => ({
    title: item.title || item.workingTitle,
    excerpt: String(item.body ?? "").slice(0, 280),
  }));

  return {
    profileName: profile.name,
    topic,
    recent,
    notes: [profile.instructions].filter(Boolean),
  };
}
