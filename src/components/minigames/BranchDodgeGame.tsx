import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createBranchDodgeState, moveLane } from '../../engine/minigameEngine';
import type { BranchDodgeState } from '../../engine/minigameEngine';

interface Props {
  onComplete: (success: boolean) => void;
}

export function BranchDodgeGame({ onComplete }: Props) {
  const { t } = useTranslation();
  const [state, setState] = React.useState<BranchDodgeState>(createBranchDodgeState);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'a' || e.key === 'ArrowLeft') setState((s) => moveLane(s, 'left'));
    if (e.key === 'd' || e.key === 'ArrowRight') setState((s) => moveLane(s, 'right'));
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  useEffect(() => {
    const timer = setInterval(() => {
      setState((prev) => {
        const nextWave = prev.wave + 1;
        if (nextWave >= prev.totalWaves) {
          clearInterval(timer);
          onComplete(prev.lives > 0);
          return prev;
        }
        return { ...prev, wave: nextWave };
      });
    }, 1200);
    return () => clearInterval(timer);
  }, [onComplete]);

  const lanes = ['left', 'center', 'right'] as const;

  return (
    <div className="fixed inset-0 bg-void flex flex-col items-center justify-center gap-4 overflow-hidden">
      <h2 className="font-cinzel text-celestial-gold text-xl">{t('minigame.branchDodge')}</h2>
      <p className="text-spirit-blue font-noto text-sm">{t('minigame.branchDodgeInstr')}</p>
      <p className="text-sakura font-rajdhani text-sm">
        {t('minigame.wave', { current: state.wave, total: state.totalWaves })} | {t('minigame.lives', { count: state.lives })}
      </p>

      <div className="flex gap-6 mt-4">
        {lanes.map((lane) => (
          <div
            key={lane}
            className={`w-20 h-40 rounded border-2 flex items-end justify-center pb-4 transition-all
              ${state.lane === lane
                ? 'border-celestial-gold bg-celestial-gold bg-opacity-10'
                : 'border-deep-night bg-deep-night bg-opacity-40'
              }`}
          >
            <div className={`font-cinzel text-xs capitalize ${state.lane === lane ? 'text-celestial-gold' : 'text-gray-600'}`}>
              {lane}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-4">
        <button
          onClick={() => setState((s) => moveLane(s, 'left'))}
          className="px-6 py-3 bg-deep-night border border-spirit-blue text-white font-rajdhani rounded hover:bg-spirit-blue transition-colors"
        >◀ A</button>
        <button
          onClick={() => setState((s) => moveLane(s, 'right'))}
          className="px-6 py-3 bg-deep-night border border-spirit-blue text-white font-rajdhani rounded hover:bg-spirit-blue transition-colors"
        >D ▶</button>
      </div>
    </div>
  );
}
