import { NavLink, Outlet } from "react-router-dom";
import { motion } from "motion/react";
import { useStudioStore } from "../../domain/studioStore";

const phases = [
  { to: "/script", label: "1 · Script", hint: "Preference, title, versions" },
  { to: "/production", label: "2 · Production", hint: "Scenes, shots, motion-comic" },
  { to: "/publish", label: "3 · Publish", hint: "Title, description, export" },
];

export function StudioLayout() {
  const project = useStudioStore((state) => state.project);
  const ready = useStudioStore((state) => state.ready);

  return (
    <div className="min-h-screen bg-[#09080a] text-[#f3ead8]">
      <header className="border-b border-[#f3ead8]/10 px-6 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.28em] text-[#d4a24a] uppercase">
              Production house
            </p>
            <h1 className="mt-1 text-2xl">Timeless Stories</h1>
            <NavLink to="/stage" className="mt-1 inline-block text-xs text-[#d4a24a]">
              Open Stage →
            </NavLink>
          </div>
          <p className="max-w-md text-sm text-[#f3ead8]/70">
            {ready ? project.name : "Loading studio…"} · {project.format} · {project.genre}
          </p>
        </div>
        <nav className="mx-auto mt-5 flex max-w-6xl gap-2">
          {phases.map((phase) => (
            <NavLink
              key={phase.to}
              to={phase.to}
              className={({ isActive }) =>
                `flex-1 rounded-lg border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-[#d4a24a] bg-[#d4a24a]/10"
                    : "border-[#f3ead8]/10 hover:border-[#f3ead8]/25"
                }`
              }
            >
              <span className="block text-sm">{phase.label}</span>
              <span className="mt-1 block text-xs text-[#f3ead8]/55">{phase.hint}</span>
            </NavLink>
          ))}
        </nav>
      </header>
      <motion.main
        className="mx-auto max-w-6xl px-6 py-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
