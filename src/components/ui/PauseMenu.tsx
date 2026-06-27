import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../store/gameStore';
import { getSaveInfo } from '../../engine/saveEngine';
import type { SaveData } from '../../types/game.types';

interface Props {
  onClose: () => void;
}

export function PauseMenu({ onClose }: Props) {
  const { t } = useTranslation();
  const { saveGame, setPaused, textSpeed, language, setLanguage, setTextSpeed } = useGameStore();
  const [saved, setSaved] = useState<number | null>(null);
  const [showConfirmTitle, setShowConfirmTitle] = useState(false);

  function handleSave(slot: 0 | 1 | 2) {
    saveGame(slot);
    setSaved(slot);
    setTimeout(() => setSaved(null), 2000);
  }

  const slots = ([0, 1, 2] as const).map((s) => ({ slot: s, info: getSaveInfo(s) as SaveData | null }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-deep-night border border-spirit-blue rounded-lg p-6 w-96 max-h-screen overflow-auto">
        <h2 className="font-cinzel text-celestial-gold text-xl mb-4">{t('pause.title')}</h2>

        <div className="space-y-3 mb-4">
          <div>
            <div className="text-sakura font-rajdhani text-sm mb-2">{t('settings.textSpeed')}</div>
            <div className="flex gap-2">
              {(['slow', 'normal', 'fast', 'instant'] as const).map((speed) => (
                <button
                  key={speed}
                  onClick={() => setTextSpeed(speed)}
                  className={`px-2 py-1 rounded text-xs font-rajdhani ${textSpeed === speed ? 'bg-spirit-blue text-white' : 'bg-void text-gray-400 border border-gray-600'}`}
                >
                  {t(`settings.${speed}`)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sakura font-rajdhani text-sm mb-2">{t('settings.language')}</div>
            <div className="flex gap-2">
              <button onClick={() => setLanguage('en')} className={`px-3 py-1 rounded text-sm font-rajdhani ${language === 'en' ? 'bg-celestial-gold text-void' : 'bg-void text-white border border-gray-600'}`}>EN</button>
              <button onClick={() => setLanguage('de')} className={`px-3 py-1 rounded text-sm font-rajdhani ${language === 'de' ? 'bg-celestial-gold text-void' : 'bg-void text-white border border-gray-600'}`}>DE</button>
            </div>
          </div>

          <div>
            <div className="text-sakura font-rajdhani text-sm mb-2">{t('save.save')}</div>
            <div className="flex flex-col gap-2">
              {slots.map(({ slot, info }) => (
                <button
                  key={slot}
                  onClick={() => handleSave(slot)}
                  className="text-left px-3 py-2 bg-void border border-gray-600 rounded hover:border-celestial-gold transition-colors font-rajdhani text-sm text-white"
                >
                  {saved === slot
                    ? <span className="text-jade">✓ {t('save.saved')}</span>
                    : info
                      ? `${t('save.slot', { number: slot + 1 })}: ${info.sceneNameKey}`
                      : `${t('save.slot', { number: slot + 1 })}: ${t('save.empty')}`
                  }
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-spirit-blue text-white font-rajdhani rounded hover:bg-blue-700 transition-colors">
            {t('pause.resume')}
          </button>
          <button
            onClick={() => setShowConfirmTitle(true)}
            className="px-4 py-2 border border-gray-600 text-gray-400 font-rajdhani rounded hover:border-red-500 hover:text-red-400 transition-colors text-sm"
          >
            {t('pause.returnToTitle')}
          </button>
        </div>
      </div>

      {showConfirmTitle && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-60">
          <div className="bg-deep-night border border-red-500 rounded-lg p-6 w-72">
            <p className="text-white font-noto text-sm mb-4">{t('pause.confirmReturn')}</p>
            <div className="flex gap-3">
              <button onClick={() => { useGameStore.setState({ currentPhase: 'title' }); setPaused(false); }} className="flex-1 px-3 py-2 bg-red-600 text-white font-rajdhani rounded hover:bg-red-700">{t('save.yes')}</button>
              <button onClick={() => setShowConfirmTitle(false)} className="flex-1 px-3 py-2 bg-void border border-gray-600 text-gray-300 font-rajdhani rounded hover:border-spirit-blue">{t('save.no')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
