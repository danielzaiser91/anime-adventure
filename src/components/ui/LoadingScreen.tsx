import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  progress: number;
}

export function LoadingScreen({ progress }: Props) {
  const { t } = useTranslation();
  const pct = Math.round(progress * 100);

  return (
    <div className="fixed inset-0 bg-void flex flex-col items-center justify-center z-50">
      <div className="mb-8 text-celestial-gold font-cinzel text-3xl tracking-widest animate-pulse">
        Chronicles of the Celestial Blade
      </div>
      <div className="w-64 h-2 bg-deep-night rounded-full overflow-hidden">
        <div
          className="h-full bg-spirit-blue transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-4 text-sakura font-rajdhani text-sm">
        {pct < 100 ? `${pct}%` : t('ui.loading.complete', 'Loading complete')}
      </div>
    </div>
  );
}
