import { useMemo } from 'react';
import { getScene } from '../engine/storyEngine';
import { useImagePreloader } from './useImagePreloader';
import type { SceneId } from '../types/game.types';

function sceneImageUrls(sceneId: SceneId): string[] {
  const scene = getScene(sceneId);
  if (!scene) return [];
  const base = import.meta.env.BASE_URL;
  const keys: string[] = [scene.background];
  if (scene.combat?.backgroundId) keys.push(scene.combat.backgroundId);
  return keys.filter(Boolean).map((k) => `${base}assets/${k}.svg`);
}

export function useScenePreloader(currentSceneId: SceneId): { ready: boolean; progress: number } {
  const urls = useMemo(() => {
    const scene = getScene(currentSceneId);
    const ids: SceneId[] = [currentSceneId];
    if (scene?.nextSceneId) ids.push(scene.nextSceneId);
    scene?.choices?.forEach((c) => ids.push(c.nextSceneId));
    return Array.from(new Set(ids.flatMap(sceneImageUrls)));
  }, [currentSceneId]);

  return useImagePreloader(urls);
}
