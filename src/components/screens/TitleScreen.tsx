import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../store/gameStore';
import { getSaveInfo } from '../../engine/saveEngine';
import type { SaveData } from '../../types/game.types';

export function TitleScreen() {
  const { t } = useTranslation();
  const { loadGame, language, setLanguage } = useGameStore();
  const [showSlots, setShowSlots] = useState(false);

  const slots = ([0, 1, 2, 'auto'] as const).map((slot) => ({
    slot,
    info: getSaveInfo(slot) as SaveData | null,
  }));

  function handleNewGame() {
    // Route to onboarding (name entry) before starting
    useGameStore.setState({ currentPhase: 'onboarding' });
  }

  function handleLoadGame(slot: 0 | 1 | 2 | 'auto') {
    loadGame(slot);
    setShowSlots(false);
  }

  return (
    <div className="fixed inset-0 bg-void flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-void-purple to-void opacity-30" />

      <h1 className="font-cinzel text-4xl md:text-6xl text-celestial-gold mb-12 text-center tracking-widest z-10 drop-shadow-lg whitespace-pre-line">
        {t('title')}
      </h1>

      <div className="flex flex-col gap-4 w-64 z-10">
        <button
          onClick={handleNewGame}
          className="px-6 py-3 bg-spirit-blue text-white font-rajdhani text-lg rounded hover:bg-blue-700 transition-colors"
        >
          {t('menu.newGame')}
        </button>
        <button
          onClick={() => setShowSlots(true)}
          className="px-6 py-3 bg-deep-night border border-spirit-blue text-spirit-blue font-rajdhani text-lg rounded hover:bg-spirit-blue hover:text-white transition-colors"
        >
          {t('save.load')}
        </button>
        <div className="flex gap-2 justify-center mt-4">
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded text-sm font-rajdhani transition-colors ${language === 'en' ? 'bg-celestial-gold text-void' : 'bg-deep-night text-white border border-gray-600'}`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('de')}
            className={`px-3 py-1 rounded text-sm font-rajdhani transition-colors ${language === 'de' ? 'bg-celestial-gold text-void' : 'bg-deep-night text-white border border-gray-600'}`}
          >
            DE
          </button>
        </div>
      </div>

      {/* Version */}
      <div className="absolute bottom-3 right-4 text-gray-600 font-rajdhani text-xs z-10">
        v{__APP_VERSION__}
      </div>

      {showSlots && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20">
          <div className="bg-deep-night p-6 rounded-lg w-80 border border-spirit-blue">
            <h3 className="font-cinzel text-celestial-gold text-lg mb-4">{t('save.load')}</h3>
            {slots.map(({ slot, info }) => (
              <button
                key={String(slot)}
                onClick={() => handleLoadGame(slot)}
                disabled={!info}
                className="w-full mb-2 p-3 text-left rounded bg-void border border-deep-night hover:border-spirit-blue disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {info ? (
                  <div>
                    <div className="text-white font-rajdhani text-sm">{slot === 'auto' ? 'Auto Save' : `Slot ${Number(slot) + 1}`}</div>
                    <div className="text-sakura text-xs mt-0.5">{Math.round(info.playtime / 60)}m played</div>
                  </div>
                ) : (
                  <span className="text-gray-600 font-rajdhani text-sm">
                    {slot === 'auto' ? t('save.autosave') : t('save.slot', { number: Number(slot) + 1 })} — {t('save.empty')}
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={() => setShowSlots(false)}
              className="mt-2 w-full text-center text-spirit-blue font-rajdhani text-sm hover:text-white transition-colors"
            >
              {t('dialogue.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
