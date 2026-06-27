import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Choice, StatRequirement, GameStats } from '../../types/game.types';

interface Props {
  choices: Choice[];
  stats: GameStats;
  flags: Set<string>;
  onSelect: (choiceId: string) => void;
}

function requirementsMet(reqs: StatRequirement[] | undefined, stats: GameStats): boolean {
  if (!reqs) return true;
  return reqs.every((r) => (stats[r.stat] ?? 0) >= r.minimum);
}

export function ChoicePanel({ choices, stats, flags, onSelect }: Props) {
  const { t: ts } = useTranslation('story');
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-0 left-0 right-0 px-4 pb-4">
      <div className="max-w-4xl mx-auto bg-void bg-opacity-95 border border-celestial-gold rounded-lg p-4">
        <div className="text-celestial-gold font-cinzel text-sm mb-3">{t('choices.heading')}</div>
        <div className="flex flex-col gap-2">
          {choices.map((choice) => {
            const available = requirementsMet(choice.requires, stats);
            return (
              <button
                key={choice.id}
                disabled={!available}
                onClick={() => onSelect(choice.id)}
                className={`text-left px-4 py-3 rounded border transition-all font-rajdhani text-base
                  ${available
                    ? 'border-spirit-blue text-white hover:bg-spirit-blue hover:bg-opacity-20 hover:border-celestial-gold'
                    : 'border-gray-700 text-gray-600 cursor-not-allowed opacity-50'
                  }`}
              >
                <span className="text-spirit-blue mr-2">▶</span>
                {ts(choice.textKey, { defaultValue: choice.textKey })}
                {choice.requires && !available && (
                  <span className="ml-2 text-xs text-sakura">
                    ({choice.requires.map((r) => `${r.stat} ≥ ${r.minimum}`).join(', ')})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
