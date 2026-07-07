import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../store/gameStore';
import { getSaveInfo } from '../../engine/saveEngine';
import type { SaveData } from '../../types/game.types';

interface Props {
  onClose: () => void;
}

export function PauseMenu({ onClose }: Props) {
  const { t } = useTranslation(['ui', 'story']);
  const { saveGame, textSpeed, language, setLanguage, setTextSpeed } = useGameStore();
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-cinzel text-celestial-gold text-xl">{t('pause.title')}</h2>
          <a
            href="https://discord.gg/jVGRFTnJBm"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('settings.joinDiscord')}
            title={t('settings.joinDiscord')}
            className="text-gray-400 hover:text-[#5865F2] transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.317 4.369A19.791 19.791 0 0 0 15.885 3c-.211.375-.457.88-.626 1.282a18.27 18.27 0 0 0-5.518 0A12.76 12.76 0 0 0 9.115 3a19.736 19.736 0 0 0-4.435 1.37C1.578 9.046.838 13.58 1.208 18.058a19.9 19.9 0 0 0 5.993 3.03c.483-.66.913-1.36 1.283-2.098a12.87 12.87 0 0 1-2.021-.97c.17-.124.336-.253.497-.386 3.898 1.8 8.126 1.8 11.977 0 .162.133.328.262.497.386-.641.383-1.32.71-2.023.971.37.738.8 1.437 1.284 2.098a19.834 19.834 0 0 0 6-3.03c.435-5.177-.742-9.673-3.378-13.69ZM8.02 15.331c-1.17 0-2.13-1.075-2.13-2.395 0-1.32.938-2.396 2.13-2.396 1.201 0 2.16 1.086 2.14 2.396 0 1.32-.939 2.395-2.14 2.395Zm7.96 0c-1.17 0-2.13-1.075-2.13-2.395 0-1.32.938-2.396 2.13-2.396 1.201 0 2.16 1.086 2.14 2.396 0 1.32-.928 2.395-2.14 2.395Z" />
            </svg>
          </a>
        </div>

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
                      ? `${t('save.slot', { number: slot + 1 })}: ${t(info.sceneNameKey, { ns: 'story', defaultValue: info.sceneNameKey })}`
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
              <button onClick={() => useGameStore.setState({ currentPhase: 'title' })} className="flex-1 px-3 py-2 bg-red-600 text-white font-rajdhani rounded hover:bg-red-700">{t('save.yes')}</button>
              <button onClick={() => setShowConfirmTitle(false)} className="flex-1 px-3 py-2 bg-void border border-gray-600 text-gray-300 font-rajdhani rounded hover:border-spirit-blue">{t('save.no')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
