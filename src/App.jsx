import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useStudioStore } from "./domain/studioStore";
import { StudioLayout } from "./studio/layout/StudioLayout";
import { ScriptPage } from "./studio/pages/script/ScriptPage";
import { ProductionPage } from "./studio/pages/ProductionPage";
import { PublishPage } from "./studio/pages/PublishPage";
import { StageLayout } from "./stage/StageLayout";
import { IngestPage } from "./stage/pages/IngestPage";
import { EnginePage } from "./stage/pages/EnginePage";

export default function App() {
  const hydrate = useStudioStore((state) => state.hydrate);
  const ready = useStudioStore((state) => state.ready);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-white text-neutral-600">
        Opening the house…
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<StageLayout />}>
        <Route path="/stage" element={<IngestPage />} />
        <Route path="/stage/play" element={<EnginePage />} />
        <Route path="/stage/edit" element={<Navigate to="/stage/play" replace />} />
        <Route path="/stage/cast" element={<Navigate to="/stage/play" replace />} />
        <Route path="/stage/sets" element={<Navigate to="/stage/play" replace />} />
        <Route path="/lot" element={<Navigate to="/stage" replace />} />
      </Route>
      <Route element={<StudioLayout />}>
        <Route path="/" element={<Navigate to="/stage" replace />} />
        <Route path="/script" element={<ScriptPage />} />
        <Route path="/script/*" element={<Navigate to="/script" replace />} />
        <Route path="/production" element={<ProductionPage />} />
        <Route path="/publish" element={<PublishPage />} />
      </Route>
    </Routes>
  );
}
