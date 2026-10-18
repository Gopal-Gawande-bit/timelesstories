export function applyLooksToScenes(scenes, cast, sets) {
  const castById = Object.fromEntries((cast ?? []).map((item) => [item.id, item]));
  const setById = Object.fromEntries((sets ?? []).map((item) => [item.id, item]));

  return (scenes ?? []).map((scene) => ({
    ...scene,
    shots: (scene.shots ?? []).map((shot) => {
      const set = setById[shot.setId];
      const character = castById[shot.characterIds?.[0]];
      return {
        ...shot,
        layers: (shot.layers ?? []).map((layer) => {
          if (layer.kind === "bg" && set) {
            return { ...layer, kit: set.kit, variant: set.variant };
          }
          if (layer.kind === "character" && character) {
            return { ...layer, kit: character.kit, variant: character.variant };
          }
          return layer;
        }),
      };
    }),
  }));
}
