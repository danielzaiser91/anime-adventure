import { describe, it, expect } from 'vitest';
import { getScene, getAllScenes, applyConsequences, determineEnding, checkRequirements } from '../../src/engine/storyEngine';
import { DEFAULT_STATS } from '../../src/types/game.types';

describe('storyEngine', () => {
  it('all scene IDs referenced in choices resolve to actual scenes', () => {
    const scenes = getAllScenes();
    const ids = new Set(scenes.map((s) => s.id));
    for (const scene of scenes) {
      if (scene.choices) {
        for (const choice of scene.choices) {
          expect(ids.has(choice.nextSceneId), `nextSceneId ${choice.nextSceneId} not found`).toBe(true);
        }
      }
      if (scene.nextSceneId) {
        expect(ids.has(scene.nextSceneId), `nextSceneId ${scene.nextSceneId} not found`).toBe(true);
      }
    }
  });

  it('no story dead ends — every non-ending scene has a path forward', () => {
    const scenes = getAllScenes();
    // scene_ending_check has no nextSceneId by design — ending is determined dynamically
    const dynamicNavIds = new Set([
      'scene_ending_celestial_harmony', 'scene_ending_blade_of_justice',
      'scene_ending_sacrifice', 'scene_ending_check',
    ]);
    for (const scene of scenes) {
      if (dynamicNavIds.has(scene.id)) continue;
      const hasForward = !!scene.nextSceneId || (scene.choices && scene.choices.length > 0)
        || !!scene.puzzle || !!scene.minigame || !!scene.combat;
      expect(hasForward, `Scene ${scene.id} has no path forward`).toBe(true);
    }
  });

  it('stat bounds are enforced to 0-100', () => {
    const stats = { ...DEFAULT_STATS };
    const flags = new Set<string>();
    const result = applyConsequences(stats, flags, { statChanges: { courage: 200 } });
    expect(result.stats['courage']).toBe(100);
    const result2 = applyConsequences(stats, flags, { statChanges: { wisdom: -200 } });
    expect(result2.stats['wisdom']).toBe(0);
  });

  it('applies consequences additively', () => {
    const stats = { ...DEFAULT_STATS };
    const flags = new Set<string>();
    const result = applyConsequences(stats, flags, {
      statChanges: { courage: 5, empathy: 10 },
      flagsSet: ['test_flag'],
    });
    expect(result.stats['courage']).toBe(15);
    expect(result.stats['empathy']).toBe(20);
    expect(result.flags.has('test_flag')).toBe(true);
  });

  it('Ending A requires luna_forgave + high bond + empathy + vex friendly', () => {
    const stats = { ...DEFAULT_STATS, luna_bond: 60, empathy: 50 };
    const flags = new Set(['luna_forgave_malachar', 'malachar_defeated']);
    const ending = determineEnding(stats, flags);
    expect(ending).toBe('scene_ending_celestial_harmony');
  });

  it('Ending B requires courage + malachar_defeated, no vex hostility needed', () => {
    const stats = { ...DEFAULT_STATS, courage: 50 };
    const flags = new Set(['malachar_defeated', 'commander_vex_hostility']);
    const ending = determineEnding(stats, flags);
    expect(ending).toBe('scene_ending_blade_of_justice');
  });

  it('Ending C is fallback', () => {
    const stats = { ...DEFAULT_STATS };
    const flags = new Set<string>();
    const ending = determineEnding(stats, flags);
    expect(ending).toBe('scene_ending_sacrifice');
  });

  it('getScene returns correct scene', () => {
    const scene = getScene('scene_1_1');
    expect(scene).toBeDefined();
    expect(scene?.id).toBe('scene_1_1');
  });

  it('checkRequirements works correctly', () => {
    const stats = { ...DEFAULT_STATS, empathy: 20 };
    expect(checkRequirements(stats, [{ stat: 'empathy', minimum: 15 }])).toBe(true);
    expect(checkRequirements(stats, [{ stat: 'empathy', minimum: 30 }])).toBe(false);
  });
});
