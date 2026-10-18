export function ModeToggle({ value, onChange }) {
  const mode = value === "3d" ? "3d" : "2d";
  return (
    <fieldset>
      <legend className="text-sm font-medium">Animation</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {[
          { id: "2d", label: "2D cartoon" },
          { id: "3d", label: "3D" },
        ].map((item) => (
          <label
            key={item.id}
            className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${
              mode === item.id ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200"
            }`}
          >
            <input
              className="sr-only"
              type="radio"
              name="animationMode"
              checked={mode === item.id}
              onChange={() => onChange(item.id)}
            />
            {item.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
