import { generateUnlockedLooks, persistGeneratedToLot } from "./generateLooks";
import { useStudioStore } from "../domain/studioStore";
import { ensureAnimationSource } from "./animation/animationProgram";

export async function finishLooksAndSave({ rebuildProgram = false } = {}) {
  const current = useStudioStore.getState().project;
  const generated = generateUnlockedLooks(current);
  const withLot = await persistGeneratedToLot(generated);
  const withProgram = ensureAnimationSource({
    ...withLot,
    animationSource: rebuildProgram ? "" : withLot.animationSource,
  });
  await useStudioStore.getState().updateProject(withProgram);
  return withProgram;
}
