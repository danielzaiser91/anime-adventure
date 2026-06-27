import { act1Scenes } from '../data/story/act1';
import { act2Scenes } from '../data/story/act2';
import { act3Scenes } from '../data/story/act3';
import type { Scene, SceneId, GameStats, GameConsequences } from '../types/game.types';

const ALL_SCENES: Scene[] = [...act1Scenes, ...act2Scenes, ...act3Scenes];
const SCENE_MAP = new Map<SceneId, Scene>(ALL_SCENES.map((s) => [s.id, s]));

export function getScene(id: SceneId): Scene | undefined {
  return SCENE_MAP.get(id);
}

export function getAllScenes(): Scene[] {
  return ALL_SCENES;
}

export function applyConsequences(stats: GameStats, flags: Set<string>, consequences: GameConsequences): {
  stats: GameStats;
  flags: Set<string>;
  itemsGained: string[];
} {
  const newStats = { ...stats };
  const newFlags = new Set(flags);
  const itemsGained: string[] = [];

  if (consequences.statChanges) {
    for (const [key, delta] of Object.entries(consequences.statChanges)) {
      const current = newStats[key] ?? 0;
      newStats[key] = Math.max(0, Math.min(100, current + (delta ?? 0)));
    }
  }

  if (consequences.flagsSet) {
    for (const flag of consequences.flagsSet) {
      newFlags.add(flag);
    }
  }

  if (consequences.flagsCleared) {
    for (const flag of consequences.flagsCleared) {
      newFlags.delete(flag);
    }
  }

  if (consequences.itemGains) {
    itemsGained.push(...consequences.itemGains);
  }

  return { stats: newStats, flags: newFlags, itemsGained };
}

export function determineEnding(stats: GameStats, flags: Set<string>): SceneId {
  const lunaForgave = flags.has('luna_forgave_malachar');
  const malacharDefeated = flags.has('malachar_defeated');
  const vexFriendly = !flags.has('commander_vex_hostility');

  // Ending A: True End — Celestial Harmony
  if (lunaForgave && stats.luna_bond >= 60 && stats.empathy >= 50 && vexFriendly) {
    return 'scene_ending_celestial_harmony';
  }

  // Ending B: Victory End — Blade of Justice
  if (stats.courage >= 50 && malacharDefeated) {
    return 'scene_ending_blade_of_justice';
  }

  // Ending C: Sacrifice End — The Last Blade (fallback)
  return 'scene_ending_sacrifice';
}

export function checkRequirements(stats: GameStats, reqs: { stat: keyof GameStats; minimum: number }[]): boolean {
  return reqs.every((req) => (stats[req.stat] ?? 0) >= req.minimum);
}
