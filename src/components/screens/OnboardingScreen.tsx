import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../store/gameStore';

export function OnboardingScreen() {
  const { t } = useTranslation();
  const { setPlayerName, startNewGame } = useGameStore();
  const [name, setName] = useState('');

  function handleStart() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPlayerName(trimmed);
    startNewGame();
  }

  return (
    <div className="fixed inset-0 bg-void flex flex-col items-center justify-center px-8">
      <h2 className="font-cinzel text-celestial-gold text-2xl mb-6 text-center">
        {t('ui.onboarding.title', 'Enter Your Name')}
      </h2>
      <p className="font-noto text-sakura text-sm mb-8 text-center max-w-sm">
        {t('ui.onboarding.desc', 'You are Kai — the last wielder of the Celestial Blade. What shall the world call you?')}
      </p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleStart(); }}
        maxLength={20}
        placeholder="Kai"
        className="bg-deep-night border border-spirit-blue text-white font-rajdhani text-lg rounded px-4 py-2 mb-6 w-64 text-center focus:outline-none focus:border-celestial-gold"
      />
      <button
        onClick={handleStart}
        disabled={!name.trim()}
        className="px-8 py-3 bg-spirit-blue text-white font-rajdhani text-lg rounded hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {t('ui.onboarding.begin', 'Begin Your Journey')}
      </button>
    </div>
  );
}
