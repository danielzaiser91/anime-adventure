import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createSquadTacticsState, resolveSquadTurn } from '../../engine/minigameEngine';
import type { SquadTacticsState, TacticAction } from '../../engine/minigameEngine';
import type { GameStats } from '../../types/game.types';

interface Props {
  stats: GameStats;
  flags: Set<string>;
  onComplete: (success: boolean) => void;
}

const ACTION_IDS: { id: TacticAction; key: string; color: string }[] = [
  { id: 'attack_gate', key: 'attackGate', color: 'bg-red-600 hover:bg-red-700' },
  { id: 'defend_rear', key: 'defend', color: 'bg-spirit-blue hover:bg-blue-700' },
  { id: 'use_item', key: 'useItem', color: 'bg-jade hover:bg-green-700' },
];

export function SquadTacticsGame({ stats, flags, onComplete }: Props) {
  const { t } = useTranslation();
  const [state, setState] = useState<SquadTacticsState>(createSquadTacticsState);
  const [selectedActions, setSelectedActions] = useState<TacticAction[]>([]);
  const maxActionsPerRound = 3;

  function toggleAction(action: TacticAction) {
    setSelectedActions((prev) => {
      if (prev.includes(action)) return prev.filter((a) => a !== action);
      if (prev.length >= maxActionsPerRound) return prev;
      return [...prev, action];
    });
  }

  function handleConfirm() {
    const next = resolveSquadTurn(state, selectedActions, flags, stats.agility_bonus ?? 0);
    setState(next);
    setSelectedActions([]);
    if (next.completed) {
      setTimeout(() => onComplete(next.success), 800);
    }
  }

  const gatePercent = (state.gateHp / state.gateMaxHp) * 100;
  const partyPercent = (state.partyHp / state.partyMaxHp) * 100;

  return (
    <div className="fixed inset-0 bg-void flex flex-col items-center justify-center p-6 gap-4">
      <h2 className="font-cinzel text-celestial-gold text-xl">{t('minigame.squadTactics')}</h2>
      <p className="text-spirit-blue font-noto text-sm">
        {t('minigame.round', { current: state.round + 1, total: state.totalRounds })} — {t('minigame.selectActions', { count: maxActionsPerRound })}
      </p>

      <div className="w-80 space-y-2">
        <div>
          <div className="flex justify-between text-xs font-rajdhani mb-1">
            <span className="text-red-400">{t('minigame.voidGate')}</span>
            <span className="text-red-400">{state.gateHp}/{state.gateMaxHp}</span>
          </div>
          <div className="h-3 bg-gray-700 rounded"><div className="h-full bg-red-500 rounded transition-all" style={{ width: `${gatePercent}%` }} /></div>
        </div>
        <div>
          <div className="flex justify-between text-xs font-rajdhani mb-1">
            <span className="text-spirit-blue">{t('minigame.partyHp')}</span>
            <span className="text-spirit-blue">{state.partyHp}/{state.partyMaxHp}</span>
          </div>
          <div className="h-3 bg-gray-700 rounded"><div className="h-full bg-spirit-blue rounded transition-all" style={{ width: `${partyPercent}%` }} /></div>
        </div>
      </div>

      <div className="flex gap-3 mt-2">
        {ACTION_IDS.map((a) => (
          <button
            key={a.id}
            onClick={() => toggleAction(a.id)}
            className={`px-4 py-3 text-white font-rajdhani rounded transition-all text-sm
              ${selectedActions.includes(a.id) ? a.color + ' ring-2 ring-celestial-gold' : 'bg-deep-night border border-gray-600 hover:border-spirit-blue'}`}
          >
            {t(`minigame.${a.key}`)}
            {selectedActions.includes(a.id) && (
              <span className="ml-1 text-celestial-gold">✓{selectedActions.filter((x) => x === a.id).length}</span>
            )}
          </button>
        ))}
      </div>

      <p className="text-gray-400 text-xs font-rajdhani">{t('minigame.selected', { current: selectedActions.length, max: maxActionsPerRound })}</p>

      <button
        onClick={handleConfirm}
        disabled={state.completed}
        className="px-6 py-2 bg-celestial-gold text-void font-rajdhani rounded hover:bg-yellow-400 transition-colors disabled:opacity-40"
      >
        {t('minigame.confirm')}
      </button>
    </div>
  );
}
