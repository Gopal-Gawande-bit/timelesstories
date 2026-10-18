import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getLotAsset, listLotAssets, saveLotAsset } from "../../domain/lotStore";
import { useStudioStore } from "../../domain/studioStore";
import { applyLooksToScenes } from "../applyLooks";
import { LookCard } from "../components/LookCard";
import { finishLooksAndSave } from "../finishLooks";
import { cycleVariant, CHARACTER_VARIANTS } from "../kits/palettes";

export function CastPage() {
  const navigate = useNavigate();
  const project = useStudioStore((state) => state.project);
  const updateProject = useStudioStore((state) => state.updateProject);
  const [lot, setLot] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listLotAssets("character").then(setLot);
  }, [project.cast]);

  if (!project.scenes.length) return <Navigate to="/stage" replace />;

  async function patchCast(id, partial) {
    await updateProject((current) => {
      const cast = current.cast.map((item) => (item.id === id ? { ...item, ...partial } : item));
      return { ...current, cast, scenes: applyLooksToScenes(current.scenes, cast, current.sets) };
    });
  }

  async function lock(item) {
    const asset = await saveLotAsset({
      kind: "character",
      name: item.role,
      kit: item.kit,
      variant: item.variant,
    });
    await patchCast(item.id, { locked: true, assetId: asset.id });
    setLot(await listLotAssets("character"));
  }

  async function useLot(item, assetId) {
    const asset = await getLotAsset(assetId);
    if (!asset) return;
    await patchCast(item.id, {
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
      navigate("/stage/sets");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl">Cast (optional)</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Pick a look if you care. If you continue without locking, the house generates characters
          from the script and your video instructions.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {project.cast.map((item) => (
          <LookCard
            key={item.id}
            kind="character"
            item={item}
            lotItems={lot}
            onCycle={() =>
              patchCast(item.id, {
                variant: cycleVariant(item.variant, CHARACTER_VARIANTS.length),
                locked: false,
              })
            }
            onLock={() => lock(item)}
            onUseLot={(assetId) => useLot(item, assetId)}
          />
        ))}
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
          disabled={busy}
          onClick={continueOn}
        >
          {busy ? "Generating…" : "Continue"}
        </button>
        <Link to="/lot" className="ml-auto text-sm text-neutral-500 underline">
          Open Lot
        </Link>
      </div>
    </div>
  );
}
