import { Composition } from "remotion";
import { StoryVideo } from "./compositions/StoryVideo";
import { demoProject } from "./demo/demoProject";
import { getFormatSize, getProjectDurationFrames } from "../domain/projectDefaults";

const youtube = getFormatSize("youtube");
const reels = getFormatSize("reels");
const demoDuration = getProjectDurationFrames(demoProject);

export function Root() {
  return (
    <>
      <Composition
        id="TimelessStoriesYoutube"
        component={StoryVideo}
        durationInFrames={demoDuration}
        fps={demoProject.fps}
        width={youtube.width}
        height={youtube.height}
        defaultProps={{ project: demoProject }}
        calculateMetadata={({ props }) => {
          const project = props.project ?? demoProject;
          const size = getFormatSize(project.format);
          return {
            durationInFrames: Math.max(getProjectDurationFrames(project), 1),
            fps: project.fps ?? 30,
            width: size.width,
            height: size.height,
          };
        }}
      />
      <Composition
        id="TimelessStoriesReels"
        component={StoryVideo}
        durationInFrames={demoDuration}
        fps={demoProject.fps}
        width={reels.width}
        height={reels.height}
        defaultProps={{ project: { ...demoProject, format: "reels" } }}
      />
    </>
  );
}
