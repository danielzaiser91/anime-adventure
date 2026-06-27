import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  onComplete: (success: boolean) => void;
}

type Position = { x: number; y: number };
type GuardZone = { x: number; y: number; radius: number };

const GUARDS: GuardZone[] = [
  { x: 30, y: 40, radius: 15 },
  { x: 60, y: 25, radius: 12 },
  { x: 75, y: 65, radius: 18 },
];

export function StealthSectionGame({ onComplete }: Props) {
  const { t } = useTranslation();
  const [pos, setPos] = useState<Position>({ x: 10, y: 50 });
  const [detected, setDetected] = useState(false);
  const [reached, setReached] = useState(false);

  function move(dx: number, dy: number) {
    if (detected || reached) return;
    setPos((prev) => {
      const nx = Math.max(0, Math.min(90, prev.x + dx));
      const ny = Math.max(0, Math.min(90, prev.y + dy));
      const newPos = { x: nx, y: ny };

      const caught = GUARDS.some((g) => {
        const dist = Math.sqrt((nx - g.x) ** 2 + (ny - g.y) ** 2);
        return dist < g.radius;
      });

      if (caught) { setDetected(true); setTimeout(() => onComplete(false), 800); }
      if (nx >= 85) { setReached(true); setTimeout(() => onComplete(true), 500); }
      return newPos;
    });
  }

  const handleKey = useCallback((e: KeyboardEvent) => {
    const step = 5;
    if (e.key === 'ArrowUp' || e.key === 'w') move(0, -step);
    if (e.key === 'ArrowDown' || e.key === 's') move(0, step);
    if (e.key === 'ArrowLeft' || e.key === 'a') move(-step, 0);
    if (e.key === 'ArrowRight' || e.key === 'd') move(step, 0);
  }, [detected, reached]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <div className="fixed inset-0 bg-void flex flex-col items-center justify-center gap-4">
      <h2 className="font-cinzel text-celestial-gold text-xl">{t('minigame.stealth')}</h2>
      <p className="text-spirit-blue font-noto text-xs">{t('minigame.stealthInstr')}</p>

      <div className="relative w-96 h-64 bg-deep-night border border-spirit-blue rounded overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-jade bg-opacity-30 flex items-center justify-center">
          <span className="text-jade font-cinzel text-xs rotate-90">EXIT</span>
        </div>

        {GUARDS.map((g, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-red-500 bg-opacity-20 border border-red-500 border-opacity-50"
            style={{
              left: `${g.x}%`,
              top: `${g.y}%`,
              width: `${g.radius * 2}%`,
              height: `${g.radius * 2 * (96 / 384)}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}

        <div
          className={`absolute w-4 h-4 rounded-full transition-all ${detected ? 'bg-red-500' : reached ? 'bg-jade' : 'bg-celestial-gold'}`}
          style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-2">
        <div />
        <button onClick={() => move(0, -5)} className="px-4 py-2 bg-deep-night border border-spirit-blue text-white font-rajdhani rounded">↑</button>
        <div />
        <button onClick={() => move(-5, 0)} className="px-4 py-2 bg-deep-night border border-spirit-blue text-white font-rajdhani rounded">←</button>
        <button onClick={() => move(0, 5)} className="px-4 py-2 bg-deep-night border border-spirit-blue text-white font-rajdhani rounded">↓</button>
        <button onClick={() => move(5, 0)} className="px-4 py-2 bg-deep-night border border-spirit-blue text-white font-rajdhani rounded">→</button>
      </div>
    </div>
  );
}
