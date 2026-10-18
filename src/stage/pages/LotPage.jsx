import { useEffect, useState } from "react";
import { listLotAssets } from "../../domain/lotStore";
import { KitSvg } from "../kits/KitSvg";

export function LotPage() {
  const [kind, setKind] = useState("all");
  const [items, setItems] = useState([]);

  useEffect(() => {
    listLotAssets(kind).then(setItems);
  }, [kind]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl">Lot</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Characters and backgrounds generated on Stage stay here. Use them on the next film so the
          house stays consistent.
        </p>
      </div>
      <div className="flex gap-2">
        {["all", "character", "background"].map((value) => (
          <button
            key={value}
            type="button"
            className={`rounded-full px-3 py-1 text-sm ${
              kind === value ? "bg-neutral-900 text-white" : "bg-neutral-100"
            }`}
            onClick={() => setKind(value)}
          >
            {value}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border border-neutral-200 p-3">
            <KitSvg kit={item.kit} variant={item.variant} className="h-32 w-full rounded-lg bg-neutral-50" />
            <p className="mt-2 text-sm font-medium capitalize">{item.name}</p>
            <p className="text-xs text-neutral-500">
              {item.kind} · {item.kit}
            </p>
          </article>
        ))}
      </div>
      {!items.length ? <p className="text-sm text-neutral-500">Empty lot. Lock a look on Stage first.</p> : null}
    </div>
  );
}
