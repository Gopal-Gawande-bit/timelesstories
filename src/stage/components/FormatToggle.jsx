import { STAGE_FORMATS } from "../../domain/projectDefaults";

export function FormatToggle({ value, onChange, name = "deliveryFormat" }) {
  const current = STAGE_FORMATS.some((item) => item.id === value) ? value : "youtube";

  return (
    <fieldset>
      <legend className="text-sm font-medium">Format</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {STAGE_FORMATS.map((format) => (
          <label
            key={format.id}
            className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${
              current === format.id ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200"
            }`}
          >
            <input
              className="sr-only"
              type="radio"
              name={name}
              checked={current === format.id}
              onChange={() => onChange(format.id)}
            />
            {format.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
