import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../store/gameStore';
import { getSaveInfo } from '../../engine/saveEngine';
import type { SaveData } from '../../types/game.types';

const WISPS = [
  { x: 12, y: 18, size: 90,  color: '#4169e1', delay: 0,   duration: 7   },
  { x: 78, y: 12, size: 65,  color: '#7b2d8b', delay: 1.8, duration: 9   },
  { x: 88, y: 58, size: 110, color: '#4169e1', delay: 0.6, duration: 7.5 },
  { x: 8,  y: 72, size: 75,  color: '#7b2d8b', delay: 2.4, duration: 8   },
  { x: 52, y: 82, size: 55,  color: '#ffd700', delay: 1.2, duration: 6.5 },
  { x: 28, y: 42, size: 45,  color: '#4169e1', delay: 3.2, duration: 8.5 },
  { x: 68, y: 32, size: 60,  color: '#7b2d8b', delay: 2.8, duration: 7   },
  { x: 42, y: 10, size: 50,  color: '#4169e1', delay: 4,   duration: 9.5 },
];

export function TitleScreen() {
  const { t } = useTranslation();
  const { loadGame, language, setLanguage } = useGameStore();
  const [showSlots, setShowSlots] = useState(false);

  const slots = ([0, 1, 2, 'auto'] as const).map((slot) => ({
    slot,
    info: getSaveInfo(slot) as SaveData | null,
  }));

  function handleNewGame() {
    useGameStore.setState({ currentPhase: 'onboarding' });
  }

  function handleLoadGame(slot: 0 | 1 | 2 | 'auto') {
    loadGame(slot);
    setShowSlots(false);
  }

  return (
    <div className="fixed inset-0 bg-void flex flex-col items-center justify-center overflow-hidden">

      {/* Animated wisps */}
      {WISPS.map((w, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${w.x}%`,
            top: `${w.y}%`,
            width: w.size,
            height: w.size,
            background: `radial-gradient(circle, ${w.color}55 0%, transparent 70%)`,
            filter: 'blur(18px)',
            animation: `${i % 2 === 0 ? 'wisp-float' : 'wisp-drift'} ${w.duration}s ease-in-out ${w.delay}s infinite`,
          }}
        />
      ))}

      {/* Central radial glow behind title */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 500,
          height: 300,
          background: 'radial-gradient(ellipse, rgba(123,45,139,0.18) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Title */}
      <h1
        className="font-cinzel text-4xl md:text-6xl text-celestial-gold mb-3 text-center tracking-widest z-10 whitespace-pre-line"
        style={{ animation: 'title-pulse 4s ease-in-out infinite' }}
      >
        {t('title')}
      </h1>

      {/* Decorative blade divider */}
      <div className="flex items-center gap-3 mb-10 z-10">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-celestial-gold opacity-60" />
        <span className="text-celestial-gold text-lg opacity-80">⚔</span>
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-celestial-gold opacity-60" />
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-4 w-64 z-10">
        <button
          onClick={handleNewGame}
          className="px-6 py-3 text-white font-rajdhani text-lg rounded transition-all duration-300 border border-spirit-blue hover:border-celestial-gold hover:text-celestial-gold"
          style={{
            background: 'linear-gradient(135deg, #1a0a2e 0%, #2a1a4e 100%)',
            animation: 'blade-glow 3s ease-in-out infinite',
          }}
        >
          {t('menu.newGame')}
        </button>
        <button
          onClick={() => setShowSlots(true)}
          className="px-6 py-3 bg-transparent border border-gray-600 text-gray-400 font-rajdhani text-lg rounded hover:border-spirit-blue hover:text-spirit-blue transition-all duration-300"
        >
          {t('save.load')}
        </button>

        {/* Language switcher */}
        <div className="flex gap-2 justify-center mt-2">
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded text-sm font-rajdhani transition-colors ${language === 'en' ? 'bg-celestial-gold text-void font-semibold' : 'bg-transparent text-gray-500 border border-gray-700 hover:border-gray-500'}`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('de')}
            className={`px-3 py-1 rounded text-sm font-rajdhani transition-colors ${language === 'de' ? 'bg-celestial-gold text-void font-semibold' : 'bg-transparent text-gray-500 border border-gray-700 hover:border-gray-500'}`}
          >
            DE
          </button>
        </div>
      </div>

      {/* Version */}
      <div className="absolute bottom-3 right-4 text-gray-700 font-rajdhani text-xs z-10">
        v{__APP_VERSION__}
      </div>

      {/* Load game modal */}
      {showSlots && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-20">
          <div className="bg-deep-night p-6 rounded-lg w-80 border border-spirit-blue shadow-2xl">
            <h3 className="font-cinzel text-celestial-gold text-lg mb-4">{t('save.load')}</h3>
            {slots.every(({ info }) => !info) ? (
              <p className="text-gray-500 font-rajdhani text-sm text-center py-4">{t('save.noSaves')}</p>
            ) : (
              slots.filter(({ info }) => info).map(({ slot, info }) => (
                <button
                  key={String(slot)}
                  onClick={() => handleLoadGame(slot)}
                  className="w-full mb-2 p-3 text-left rounded bg-void border border-gray-600 hover:border-spirit-blue transition-colors"
                >
                  <div className="text-white font-rajdhani text-sm">{slot === 'auto' ? t('save.autosave') : t('save.slot', { number: Number(slot) + 1 })}</div>
                  <div className="text-sakura text-xs mt-0.5">{Math.round((info as NonNullable<typeof info>).playtime / 60)}m played</div>
                </button>
              ))
            )}
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
