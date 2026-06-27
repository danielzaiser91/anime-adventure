import React from 'react';
import type { MinigameConfig, GameStats } from '../../types/game.types';
import { BranchDodgeGame } from './BranchDodgeGame';
import { RhythmRitualGame } from './RhythmRitualGame';
import { TargetLockGame } from './TargetLockGame';
import { SquadTacticsGame } from './SquadTacticsGame';
import { StealthSectionGame } from './StealthSectionGame';

interface Props {
  minigame: MinigameConfig;
  stats: GameStats;
  flags: Set<string>;
  onComplete: (success: boolean) => void;
}

export function MinigameRouter({ minigame, stats, flags, onComplete }: Props) {
  if (minigame.type === 'branch_dodge') return <BranchDodgeGame onComplete={onComplete} />;
  if (minigame.type === 'rhythm_ritual') return <RhythmRitualGame onComplete={onComplete} />;
  if (minigame.type === 'target_lock') return <TargetLockGame onComplete={onComplete} />;
  if (minigame.type === 'squad_tactics') return <SquadTacticsGame stats={stats} flags={flags} onComplete={onComplete} />;
  if (minigame.type === 'stealth_section') return <StealthSectionGame onComplete={onComplete} />;
  return null;
}
