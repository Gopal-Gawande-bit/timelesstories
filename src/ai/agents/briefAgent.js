import { LENGTHS } from "../../domain/projectDefaults";
import { buildChannelBrief } from "../prompts/channelVoice";
import { targetWordCount } from "../jobs/scriptJobTypes";

export async function briefAgent(ctx) {
  const length = LENGTHS.find((item) => item.id === ctx.profile.lengthId) ?? LENGTHS[1];
  const brief = {
    topic: ctx.topic,
    extraNotes: ctx.extraNotes,
    channel: buildChannelBrief(ctx.profile),
    retrieved: ctx.retrieved,
    targetSeconds: length.seconds,
    targetWords: targetWordCount(length.seconds),
  };
  ctx.steps.push({ id: "brief", label: "Brief", detail: `${brief.topic} · ${brief.targetWords} words` });
  return { ...ctx, brief };
}
