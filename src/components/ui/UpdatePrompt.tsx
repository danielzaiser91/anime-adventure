import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  onUpdate: () => void;
  onDismiss: () => void;
}

export function UpdatePrompt({ onUpdate, onDismiss }: Props) {
  const { t } = useTranslation();
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-deep-night border border-celestial-gold rounded-lg p-4 shadow-lg w-72">
      <p className="text-celestial-gold font-cinzel text-sm mb-3">{t('ui.update.available', 'Update Available')}</p>
      <div className="flex gap-2">
        <button
          onClick={onUpdate}
          className="flex-1 px-3 py-2 bg-celestial-gold text-void font-rajdhani rounded hover:bg-yellow-400 transition-colors text-sm"
        >
          {t('ui.update.button', 'Update Now')}
        </button>
        <button
          onClick={onDismiss}
          className="px-3 py-2 border border-gray-600 text-gray-400 font-rajdhani rounded hover:border-spirit-blue text-sm transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
}
