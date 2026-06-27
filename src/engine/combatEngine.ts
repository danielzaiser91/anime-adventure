import type { Enemy, Skill, GameStats, GameConsequences } from '../types/game.types';

export type TimingResult = 'perfect' | 'good' | 'miss';

export function getTimingResult(elapsedMs: number, targetMs: number): TimingResult {
  const diff = Math.abs(elapsedMs - targetMs);
  if (diff <= 50) return 'perfect';
  if (diff <= 150) return 'good';
  return 'miss';
}

export function calculateDamage(
  baseDamage: number,
  timing: TimingResult,
  strengthStat: number
): number {
  const timingMultiplier = timing === 'perfect' ? 1.5 : timing === 'good' ? 1.0 : 0.3;
  const raw = baseDamage * timingMultiplier * (1 + strengthStat / 100);
  return Math.max(0, Math.round(raw));
}

export function calculateDefense(timing: TimingResult, incomingDamage: number): number {
  const reduction = timing === 'perfect' ? 0.75 : timing === 'good' ? 0.40 : 0;
  return Math.round(incomingDamage * (1 - reduction));
}

export function applySkill(
  skill: Skill,
  targets: Enemy[],
  partyHp: number,
  partyMaxHp: number
): { damageDealt: number[]; healAmount: number; shieldActive: boolean; poisoned: boolean } {
  const damageDealt: number[] = targets.map(() => 0);
  let healAmount = 0;
  let shieldActive = false;
  let poisoned = false;

  if (skill.effect === 'all_damage') {
    targets.forEach((_, i) => { damageDealt[i] = Math.round((skill.damage ?? 1) * 20); });
  } else if (skill.effect === 'heal_lowest') {
    healAmount = Math.round(partyMaxHp * 0.3);
  } else if (skill.effect === 'shield') {
    shieldActive = true;
  } else if (skill.effect === 'poison') {
    poisoned = true;
  } else if (skill.effect === 'quick_attacks') {
    damageDealt[0] = Math.round((skill.damage ?? 1) * 15);
    if (damageDealt.length > 0) damageDealt[0] += Math.round((skill.damage ?? 1) * 10);
    if (damageDealt.length > 0) damageDealt[0] += Math.round((skill.damage ?? 1) * 8);
  } else if (skill.damage !== undefined) {
    damageDealt[0] = Math.round((skill.damage ?? 1) * 22);
  }

  return { damageDealt, healAmount, shieldActive, poisoned };
}

export function clampHp(hp: number): number {
  return Math.max(0, hp);
}

export function applyTutorialGuard(
  enemyHp: number,
  enemyMaxHp: number,
  turnCount: number
): number {
  if (turnCount > 3) {
    return Math.max(1, Math.round(enemyMaxHp * 0.1));
  }
  return enemyHp;
}

export function buildVictoryConsequences(baseConsequences: GameConsequences): GameConsequences {
  return { ...baseConsequences };
}
