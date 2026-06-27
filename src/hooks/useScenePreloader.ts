import { useMemo } from 'react';
import { getScene } from '../engine/storyEngine';
import { IMAGE_URLS } from '../data/imageUrls';
import { useImagePreloader } from './useImagePreloader';
import type { SceneId } from '../types/game.types';

function getSceneImages(sceneId: SceneId): string[] {
  const scene = getScene(sceneId);
  if (!scene) return [];
  const urls: string[] = [];
  const bgUrl = (IMAGE_URLS as Record<string, string>)[scene.background];
  if (bgUrl) urls.push(bgUrl);
  if (scene.combat?.backgroundId) {
    const combatUrl = (IMAGE_URLS as Record<string, string>)[scene.combat.backgroundId];
    if (combatUrl) urls.push(combatUrl);
  }
  return urls;
}

export function useScenePreloader(currentSceneId: SceneId): { ready: boolean; progress: number } {
  const urls = useMemo(() => {
    const scene = getScene(currentSceneId);
    const ids: SceneId[] = [currentSceneId];

    if (scene?.nextSceneId) ids.push(scene.nextSceneId);
    if (scene?.choices) {
      scene.choices.forEach((c) => ids.push(c.nextSceneId));
    }

    const allUrls: string[] = [];
    for (const id of ids) {
      allUrls.push(...getSceneImages(id));
    }
    return Array.from(new Set(allUrls));
  }, [currentSceneId]);

  return useImagePreloader(urls);
}
