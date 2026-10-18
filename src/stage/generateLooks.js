import { saveLotAsset } from "../domain/lotStore";
import { applyLooksToScenes } from "./applyLooks";

export function inferMood(instructions = "", script = "") {
  const t = `${instructions} ${script}`.toLowerCase();
  if (/mystery|रहस्य|रात|fog|डरा|ghost|night/.test(t)) return "mystery";
  if (/kids|बच्च|gentle|nani|moral/.test(t)) return "kids";
  if (/जंगल|forest|पेड़/.test(t)) return "forest";
  if (/podcast|dialogue|host/.test(t)) return "room";
  return "folk";
}

export function setKitForMood(mood, locationKit) {
  if (mood === "mystery") return "mysteryLane";
  if (mood === "kids") return "folkMeadow";
  if (mood === "forest") return "mistForest";
  if (mood === "room") return "lampRoom";
  if (locationKit === "forest") return "mistForest";
  if (locationKit === "room") return "lampRoom";
  if (locationKit === "street") return "marketStreet";
  if (locationKit === "dusk") return "folkDusk";
  return "folkDusk";
}

export function generateUnlockedLooks(project) {
  const mood = inferMood(project.stageInstructions, project.script?.body);
  const cast = (project.cast ?? []).map((item) =>
    item.locked
      ? item
      : { ...item, kit: item.kit, variant: mood === "mystery" ? 2 : mood === "kids" ? 1 : 0, generated: true },
  );
  const sets = (project.sets ?? []).map((item) =>
    item.locked
      ? item
      : {
          ...item,
          kit: setKitForMood(mood, item.kit),
          variant: mood === "mystery" ? 2 : 0,
          generated: true,
        },
  );
  const scenes = applyLooksToScenes(project.scenes, cast, sets);
  return { ...project, cast, sets, scenes };
}

export async function persistGeneratedToLot(project) {
  const cast = [];
  for (const item of project.cast ?? []) {
    if (item.assetId) {
      cast.push(item);
      continue;
    }
    const asset = await saveLotAsset({
      kind: "character",
      name: `${item.role} · generated`,
      kit: item.kit,
      variant: item.variant,
    });
    cast.push({ ...item, assetId: asset.id, generated: true });
  }
  const sets = [];
  for (const item of project.sets ?? []) {
    if (item.assetId) {
      sets.push(item);
      continue;
    }
    const asset = await saveLotAsset({
      kind: "background",
      name: `${item.location} · generated`,
      kit: item.kit,
      variant: item.variant,
    });
    sets.push({ ...item, assetId: asset.id, generated: true });
  }
  return { ...project, cast, sets, scenes: applyLooksToScenes(project.scenes, cast, sets) };
}
