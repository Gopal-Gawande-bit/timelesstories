export function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="text-[#d4a24a]">{label}</span>
      {children}
    </label>
  );
}
