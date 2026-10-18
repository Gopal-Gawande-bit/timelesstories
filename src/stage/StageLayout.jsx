import { NavLink, Outlet } from "react-router-dom";

const steps = [
  { to: "/stage", end: true, label: "1 Details" },
  { to: "/stage/play", end: false, label: "2 Animation" },
];

export function StageLayout() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-200 px-6 py-4">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs tracking-[0.2em] text-neutral-500 uppercase">Timeless Stories</p>
          <h1 className="text-xl font-medium">Animation engine</h1>
        </div>
        <nav className="mx-auto mt-4 flex max-w-6xl gap-2">
          {steps.map((step) => (
            <NavLink
              key={step.to}
              to={step.to}
              end={step.end}
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 text-sm ${
                  isActive ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600"
                }`
              }
            >
              {step.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8 lg:max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
}
