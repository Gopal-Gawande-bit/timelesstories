import { KitSvg } from "../kits/KitSvg";
import { CHARACTER_VARIANTS, SET_VARIANTS } from "../kits/palettes";

export function LookCard({ item, kind, lotItems = [], onCycle, onLock, onUseLot }) {
  const variantCount = kind === "character" ? CHARACTER_VARIANTS.length : SET_VARIANTS.length;
  const title = item.role || item.location || item.name;

  return (
    <article className="rounded-xl border border-neutral-200 p-4">
      <div className="overflow-hidden rounded-lg bg-neutral-50">
        <KitSvg kit={item.kit} variant={item.variant} className="h-40 w-full" />
      </div>
      <h3 className="mt-3 text-sm font-medium capitalize">{title}</h3>
      <p className="text-xs text-neutral-500">
        {item.kit} · look {(item.variant ?? 0) + 1}/{variantCount}
        {item.locked ? " · locked" : ""}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="rounded-lg border border-neutral-200 px-3 py-1 text-sm" onClick={onCycle}>
          Try another
        </button>
        <button
          type="button"
          className="rounded-lg bg-neutral-900 px-3 py-1 text-sm text-white"
          onClick={onLock}
        >
          Lock
        </button>
      </div>
      {lotItems.length ? (
        <label className="mt-3 block text-xs text-neutral-500">
          Use from Lot
          <select
            className="mt-1 w-full rounded-lg border border-neutral-200 px-2 py-1 text-sm text-neutral-800"
            defaultValue=""
            onChange={(event) => {
              if (event.target.value) onUseLot(event.target.value);
              event.target.value = "";
            }}
          >
            <option value="">Choose a saved look</option>
            {lotItems.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </article>
  );
}
