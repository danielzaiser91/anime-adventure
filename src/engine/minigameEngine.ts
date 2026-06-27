import type { MinigameType } from '../types/game.types';

export interface MinigameState {
  type: MinigameType;
  lives: number;
  score: number;
  completed: boolean;
  success: boolean;
  easyMode: boolean;
}

export function createMinigameState(type: MinigameType, lives = 3): MinigameState {
  return { type, lives, score: 0, completed: false, success: false, easyMode: false };
}

export function loseLife(state: MinigameState): MinigameState {
  const newLives = state.lives - 1;
  if (newLives <= 0) {
    return { ...state, lives: 0, completed: true, success: false };
  }
  return { ...state, lives: newLives };
}

export function winMinigame(state: MinigameState): MinigameState {
  return { ...state, completed: true, success: true };
}

// Branch Dodge
export interface BranchDodgeState {
  lane: 'left' | 'center' | 'right';
  wave: number;
  totalWaves: number;
  lives: number;
}

export function createBranchDodgeState(): BranchDodgeState {
  return { lane: 'center', wave: 0, totalWaves: 10, lives: 3 };
}

export function moveLane(
  state: BranchDodgeState,
  direction: 'left' | 'right'
): BranchDodgeState {
  const lanes = ['left', 'center', 'right'] as const;
  const currentIdx = lanes.indexOf(state.lane);
  const newIdx = direction === 'left'
    ? Math.max(0, currentIdx - 1)
    : Math.min(2, currentIdx + 1);
  return { ...state, lane: lanes[newIdx] ?? 'center' };
}

// Rhythm Ritual: 8 nodes, sequences
export function generateRhythmSequence(round: number): number[] {
  const length = 4 + round;
  return Array.from({ length }, (_, i) => (i * 3 + round * 2) % 8);
}

// Target Lock: spawn timing
export function isTargetHit(clickTimeMs: number, spawnTimeMs: number): boolean {
  return clickTimeMs - spawnTimeMs <= 800;
}

// Squad Tactics
export type TacticAction = 'attack_gate' | 'defend_rear' | 'use_item';

export interface SquadTacticsState {
  round: number;
  totalRounds: number;
  gateHp: number;
  gateMaxHp: number;
  partyHp: number;
  partyMaxHp: number;
  completed: boolean;
  success: boolean;
}

export function createSquadTacticsState(): SquadTacticsState {
  return {
    round: 0,
    totalRounds: 5,
    gateHp: 100,
    gateMaxHp: 100,
    partyHp: 200,
    partyMaxHp: 200,
    completed: false,
    success: false,
  };
}

export function resolveSquadTurn(
  state: SquadTacticsState,
  actions: TacticAction[],
  flags: Set<string>,
  agilityBonus: number
): SquadTacticsState {
  let { gateHp, partyHp } = state;

  // Round 1 agility auto-dodge
  if (state.round === 0 && agilityBonus >= 5) {
    // skip enemy damage this round
  } else {
    const enemyDamage = state.round === 2 && flags.has('ryu_joined') ? 0 : 15 + state.round * 5;
    const defendCount = actions.filter((a) => a === 'defend_rear').length;
    const actualDamage = Math.max(0, enemyDamage - defendCount * 10);
    partyHp = Math.max(0, partyHp - actualDamage);
  }

  const attackCount = actions.filter((a) => a === 'attack_gate').length;
  gateHp = Math.max(0, gateHp - attackCount * 20);

  const healCount = actions.filter((a) => a === 'use_item').length;
  partyHp = Math.min(state.partyMaxHp, partyHp + healCount * 30);

  const round = state.round + 1;
  const completed = gateHp <= 0 || partyHp <= 0 || round >= state.totalRounds;
  const success = gateHp <= 0 && partyHp > 0;

  return { ...state, gateHp, partyHp, round, completed, success };
}
