import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ExplorationConfig } from '../../types/game.types';
import { useImageUrl } from '../../hooks/useImageUrl';

interface Props {
  exploration: ExplorationConfig;
  background: string;
  onHotspotActivated: (hotspotId: string) => void;
  onContinue: () => void;
}

export function ExplorationScreen({ exploration, background, onHotspotActivated, onContinue }: Props) {
  const { t: ts } = useTranslation('story');
  const { t } = useTranslation();
  const bgUrl = useImageUrl(background);
  const [activatedIds, setActivatedIds] = useState<Set<string>>(new Set());
  const [activeText, setActiveText] = useState<string | null>(null);

  function handleHotspot(id: string, textKey: string) {
    setActivatedIds((prev) => new Set([...prev, id]));
    setActiveText(ts(textKey, { defaultValue: textKey }));
    onHotspotActivated(id);
  }

  const allActivated = exploration.hotspots.every((h) => activatedIds.has(h.id));

  return (
    <div className="fixed inset-0" style={{ backgroundImage: `url(${bgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-black bg-opacity-30" />

      {exploration.hotspots.map((hotspot) => (
        <button
          key={hotspot.id}
          onClick={() => handleHotspot(hotspot.id, hotspot.textKey)}
          className={`absolute w-8 h-8 rounded-full border-2 transition-all z-10
            ${activatedIds.has(hotspot.id)
              ? 'border-jade bg-jade bg-opacity-30'
              : 'border-celestial-gold bg-celestial-gold bg-opacity-20 animate-pulse hover:bg-opacity-50'
            }`}
          style={{ left: `${hotspot.xPercent}%`, top: `${hotspot.yPercent}%`, transform: 'translate(-50%, -50%)' }}
          title={String(hotspot.id)}
        />
      ))}

      {activeText && (
        <div className="absolute bottom-20 left-4 right-4">
          <div className="max-w-4xl mx-auto bg-void bg-opacity-90 border border-spirit-blue rounded-lg p-4">
            <p className="font-noto text-white text-base">{activeText}</p>
            <button onClick={() => setActiveText(null)} className="mt-2 text-spirit-blue text-xs hover:text-white">
              {t('exploration.close')}
            </button>
          </div>
        </div>
      )}

      {allActivated && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="max-w-4xl mx-auto text-center">
            <button
              onClick={onContinue}
              className="px-8 py-3 bg-spirit-blue text-white font-rajdhani rounded hover:bg-blue-700 transition-colors"
            >
              {t('exploration.continue')} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
