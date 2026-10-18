import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getLotAsset, listLotAssets, saveLotAsset } from "../../domain/lotStore";
import { useStudioStore } from "../../domain/studioStore";
import { applyLooksToScenes } from "../applyLooks";
import { LookCard } from "../components/LookCard";
import { finishLooksAndSave } from "../finishLooks";
import { cycleVariant, SET_VARIANTS } from "../kits/palettes";

export function SetsPage() {
  const navigate = useNavigate();
  const project = useStudioStore((state) => state.project);
  const updateProject = useStudioStore((state) => state.updateProject);
  const [lot, setLot] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listLotAssets("background").then(setLot);
  }, [project.sets]);

  if (!project.scenes.length) return <Navigate to="/stage" replace />;

  async function patchSet(id, partial) {
    await updateProject((current) => {
      const sets = current.sets.map((item) => (item.id === id ? { ...item, ...partial } : item));
      return { ...current, sets, scenes: applyLooksToScenes(current.scenes, current.cast, sets) };
    });
  }

  async function lock(item) {
    const asset = await saveLotAsset({
      kind: "background",
      name: item.location,
      kit: item.kit,
      variant: item.variant,
    });
    await patchSet(item.id, { locked: true, assetId: asset.id });
    setLot(await listLotAssets("background"));
  }

  async function useLot(item, assetId) {
    const asset = await getLotAsset(assetId);
    if (!asset) return;
    await patchSet(item.id, {
      kit: asset.kit,
      variant: asset.variant,
      locked: true,
      assetId: asset.id,
    });
  }

  async function continueOn() {
    setBusy(true);
    try {
      await finishLooksAndSave();
      navigate("/stage/edit");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl">Sets (optional)</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Lock a place if you want control. Continue without selecting and we generate backgrounds
          from the script and instructions, then put them in the Lot.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {project.sets.map((item) => (
          <LookCard
            key={item.id}
            kind="background"
            item={item}
            lotItems={lot}
            onCycle={() =>
              patchSet(item.id, { variant: cycleVariant(item.variant, SET_VARIANTS.length), locked: false })
            }
            onLock={() => lock(item)}
            onUseLot={(assetId) => useLot(item, assetId)}
          />
        ))}
      </div>
      <button
        type="button"
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        disabled={busy}
        onClick={continueOn}
      >
        {busy ? "Generating the cut…" : "Generate the video"}
      </button>
    </div>
  );
}
