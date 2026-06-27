import { describe, it, expect } from 'vitest';
import {
  getTimingResult,
  calculateDamage,
  calculateDefense,
  clampHp,
  applyTutorialGuard,
} from '../../src/engine/combatEngine';

describe('combatEngine', () => {
  it('timing results are correct', () => {
    expect(getTimingResult(500, 500)).toBe('perfect');
    expect(getTimingResult(530, 500)).toBe('perfect');
    expect(getTimingResult(600, 500)).toBe('good');
    expect(getTimingResult(700, 500)).toBe('miss');
  });

  it('damage formula is correct at all timing levels', () => {
    const perfect = calculateDamage(20, 'perfect', 0);
    const good = calculateDamage(20, 'good', 0);
    const miss = calculateDamage(20, 'miss', 0);
    expect(perfect).toBeGreaterThan(good);
    expect(good).toBeGreaterThan(miss);
    expect(miss).toBeGreaterThan(0);
  });

  it('strength increases damage', () => {
    const lowStr = calculateDamage(20, 'perfect', 0);
    const highStr = calculateDamage(20, 'perfect', 50);
    expect(highStr).toBeGreaterThan(lowStr);
  });

  it('HP never goes negative', () => {
    expect(clampHp(-100)).toBe(0);
    expect(clampHp(0)).toBe(0);
    expect(clampHp(50)).toBe(50);
  });

  it('defense timing reduces damage correctly', () => {
    const perfectDefense = calculateDefense('perfect', 100);
    const goodDefense = calculateDefense('good', 100);
    const missDefense = calculateDefense('miss', 100);
    expect(perfectDefense).toBe(25);
    expect(goodDefense).toBe(60);
    expect(missDefense).toBe(100);
  });

  it('tutorial guard activates after 3 turns', () => {
    const enemy = { hp: 90, maxHp: 100 };
    expect(applyTutorialGuard(enemy.hp, enemy.maxHp, 3)).toBe(90);
    const guarded = applyTutorialGuard(enemy.hp, enemy.maxHp, 4);
    expect(guarded).toBeLessThan(enemy.hp);
    expect(guarded).toBeGreaterThan(0);
  });
});
