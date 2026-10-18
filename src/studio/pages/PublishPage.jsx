import { getFormatSize, getProjectDurationFrames } from "../../domain/projectDefaults";
import { useStudioStore } from "../../domain/studioStore";

export function PublishPage() {
  const project = useStudioStore((state) => state.project);
  const updateProject = useStudioStore((state) => state.updateProject);
  const size = getFormatSize(project.format);
  const seconds = (getProjectDurationFrames(project) / (project.fps ?? 30)).toFixed(1);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl">Phase 3 · Publish</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#f3ead8]/70">
          Title, description, and thumbnail copy sit on the same project as the video. SEO agents
          come later. Export is Remotion CLI (`npm run remotion`). YouTube Studio upload stays
          manual in v1.
        </p>
      </div>

      <p className="rounded-lg border border-[#f3ead8]/10 px-4 py-3 text-sm text-[#f3ead8]/65">
        Ready graph: {project.format} {size.width}×{size.height} · {seconds}s ·{" "}
        {(project.scenes ?? []).length} scenes
      </p>

      <label className="block text-sm">
        <span className="text-[#d4a24a]">Title</span>
        <input
          className="mt-2 w-full rounded-lg border border-[#f3ead8]/15 bg-[#120f14] px-3 py-2"
          value={project.publish.title}
          onChange={(event) =>
            updateProject((current) => ({
              ...current,
              publish: { ...current.publish, title: event.target.value },
            }))
          }
        />
      </label>

      <label className="block text-sm">
        <span className="text-[#d4a24a]">Description</span>
        <textarea
          className="mt-2 min-h-36 w-full rounded-lg border border-[#f3ead8]/15 bg-[#120f14] px-3 py-2"
          value={project.publish.description}
          onChange={(event) =>
            updateProject((current) => ({
              ...current,
              publish: { ...current.publish, description: event.target.value },
            }))
          }
        />
      </label>

      <label className="block text-sm">
        <span className="text-[#d4a24a]">Thumbnail prompt</span>
        <textarea
          className="mt-2 min-h-24 w-full rounded-lg border border-[#f3ead8]/15 bg-[#120f14] px-3 py-2"
          value={project.publish.thumbnailPrompt}
          onChange={(event) =>
            updateProject((current) => ({
              ...current,
              publish: { ...current.publish, thumbnailPrompt: event.target.value },
            }))
          }
        />
      </label>
    </section>
  );
}
