import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../store/gameStore';
import type { SceneId } from '../../types/game.types';

const ENDING_META: Record<string, { titleKey: string; bgColor: string }> = {
  scene_ending_celestial_harmony: { titleKey: 'ending_a_title', bgColor: 'from-spirit-blue to-void' },
  scene_ending_blade_of_justice: { titleKey: 'ending_b_title', bgColor: 'from-red-900 to-void' },
  scene_ending_sacrifice: { titleKey: 'ending_c_title', bgColor: 'from-void-purple to-void' },
};

interface Props {
  sceneId: SceneId;
}

export function EndingScreen({ sceneId }: Props) {
  const { t: ts } = useTranslation('story');
  const { t } = useTranslation();
  const { startNewGame, completedEndings } = useGameStore();
  const meta = ENDING_META[sceneId] ?? { titleKey: 'ending_a_title', bgColor: 'from-void to-void' };

  const endingKey = sceneId.replace('scene_', '');
  const ngPlusAvailable = completedEndings.length > 0;

  return (
    <div className={`fixed inset-0 bg-gradient-to-b ${meta.bgColor} flex flex-col items-center justify-center p-8`}>
      <div className="font-cinzel text-celestial-gold text-3xl mb-2 text-center">
        {ts(meta.titleKey, { defaultValue: 'The End' })}
      </div>
      <div className="w-24 h-0.5 bg-celestial-gold mb-6" />

      <div className="max-w-lg text-center mb-8">
        <p className="font-noto text-white text-sm leading-relaxed">
          {ts(`${endingKey}_epilogue`, { defaultValue: '' })}
        </p>
      </div>

      <div className="flex flex-col gap-3 w-48">
        <button
          onClick={() => startNewGame()}
          className="px-6 py-3 bg-spirit-blue text-white font-rajdhani rounded hover:bg-blue-700 transition-colors"
        >
          {t('endings.newGame')}
        </button>
        {ngPlusAvailable && (
          <button
            onClick={() => startNewGame(true)}
            className="px-6 py-3 bg-celestial-gold text-void font-rajdhani rounded hover:bg-yellow-400 transition-colors"
          >
            {t('endings.newGamePlus')}
          </button>
        )}
        <button
          onClick={() => useGameStore.setState({ currentPhase: 'title' })}
          className="px-6 py-3 border border-spirit-blue text-spirit-blue font-rajdhani rounded hover:bg-spirit-blue hover:text-white transition-colors"
        >
          {t('endings.titleScreen')}
        </button>
      </div>
    </div>
  );
}
