import { retrieveScriptContext } from "../rag/retrieve";
import { briefAgent } from "../agents/briefAgent";
import { draftAgent } from "../agents/draftAgent";
import { critiqueAgent } from "../agents/critiqueAgent";
import { lengthAgent } from "../agents/lengthAgent";
import { mcpClient } from "../mcp/client";

export async function runScriptJob({
  topic,
  extraNotes = "",
  profile,
  pastScripts = [],
  mode = "generate",
  previousBody = "",
}) {
  const retrieved = await retrieveScriptContext({ profile, pastScripts, topic });
  let ctx = {
    topic: String(topic ?? "").trim(),
    extraNotes: String(extraNotes ?? "").trim(),
    profile,
    retrieved,
    mode,
    previousBody: String(previousBody ?? ""),
    steps: [],
  };

  ctx = await briefAgent(ctx);
  ctx = await draftAgent(ctx);
  ctx = await critiqueAgent(ctx);
  ctx = await lengthAgent(ctx);

  // FUTURE: MCP server records the job; today this is a local no-op aside from tool availability.
  void mcpClient.connected;

  return ctx;
}
