import { db } from "./db";

export async function saveLotAsset(asset) {
  // FUTURE: persist Lot assets via backend
  const record = {
    id: asset.id ?? crypto.randomUUID(),
    kind: asset.kind,
    name: asset.name,
    kit: asset.kit,
    variant: asset.variant ?? 0,
    createdAt: asset.createdAt ?? Date.now(),
  };
  await db.assets.put(record);
  return record;
}

export async function listLotAssets(kind) {
  const all = await db.assets.orderBy("createdAt").reverse().toArray();
  if (!kind || kind === "all") return all;
  return all.filter((item) => item.kind === kind);
}

export async function getLotAsset(id) {
  return db.assets.get(id);
}

export async function saveCutVersion(version) {
  // FUTURE: Remotion CLI / export MP4 per version
  const record = {
    id: version.id ?? crypto.randomUUID(),
    projectId: version.projectId,
    notes: version.notes ?? "",
    createdAt: version.createdAt ?? Date.now(),
    snapshot: version.snapshot,
  };
  await db.cutVersions.put(record);
  return record;
}

export async function listCutVersions(projectId) {
  const rows = await db.cutVersions.where("projectId").equals(projectId).toArray();
  return rows.sort((a, b) => b.createdAt - a.createdAt);
}
