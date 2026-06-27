import React from 'react';
import type { GameStats, CharacterId } from '../../types/game.types';

interface Props {
  stats: GameStats;
  companions: CharacterId[];
  onPauseClick: () => void;
}

const STAT_COLORS: Record<string, string> = {
  courage: 'bg-red-500',
  wisdom: 'bg-spirit-blue',
  empathy: 'bg-sakura',
  strength: 'bg-celestial-gold',
  spirit: 'bg-jade',
};

export function StatsHUD({ stats, companions, onPauseClick }: Props) {
  const mainStats = ['courage', 'wisdom', 'empathy', 'strength', 'spirit'] as const;

  return (
    <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-void bg-opacity-80 z-30 border-b border-deep-night">
      <div className="flex gap-3">
        {mainStats.map((stat) => (
          <div key={stat} className="flex flex-col items-center">
            <div className="text-gray-400 text-xs uppercase font-rajdhani tracking-wide">{stat.slice(0, 3)}</div>
            <div className="w-12 h-1.5 bg-gray-800 rounded mt-0.5">
              <div
                className={`h-full rounded transition-all ${STAT_COLORS[stat] ?? 'bg-white'}`}
                style={{ width: `${Math.min(100, stats[stat] ?? 0)}%` }}
              />
            </div>
            <div className="text-white text-xs font-rajdhani">{stats[stat] ?? 0}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {companions.length > 0 && (
          <div className="flex gap-1">
            {companions.map((id) => (
              <div
                key={id}
                className="w-6 h-6 rounded-full border border-spirit-blue bg-deep-night flex items-center justify-center text-xs text-spirit-blue font-cinzel"
                title={id}
              >
                {id[0]?.toUpperCase()}
              </div>
            ))}
          </div>
        )}
        <button
          onClick={onPauseClick}
          className="text-gray-400 hover:text-white font-rajdhani text-sm px-2 py-1 border border-gray-700 rounded hover:border-spirit-blue transition-colors"
        >
          ⏸
        </button>
      </div>
    </div>
  );
}
