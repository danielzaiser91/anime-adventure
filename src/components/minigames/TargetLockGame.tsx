import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isTargetHit } from '../../engine/minigameEngine';

interface Target {
  id: number;
  x: number;
  y: number;
  spawnTime: number;
  hit: boolean;
}

interface Props {
  onComplete: (success: boolean) => void;
}

export function TargetLockGame({ onComplete }: Props) {
  const { t } = useTranslation();
  const [targets, setTargets] = useState<Target[]>([]);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [wave, setWave] = useState(0);
  const totalTargets = 8;
  const maxMisses = 3;

  useEffect(() => {
    if (wave >= totalTargets) return;
    const delay = 800 + Math.random() * 600;
    const timer = setTimeout(() => {
      setTargets((prev) => [
        ...prev,
        {
          id: Date.now(),
          x: 10 + Math.random() * 80,
          y: 10 + Math.random() * 70,
          spawnTime: performance.now(),
          hit: false,
        },
      ]);
      setWave((w) => w + 1);
    }, delay);
    return () => clearTimeout(timer);
  }, [wave]);

  useEffect(() => {
    const expiry = setInterval(() => {
      setTargets((prev) => {
        const now = performance.now();
        const expired = prev.filter((t) => !t.hit && now - t.spawnTime > 1000);
        if (expired.length > 0) {
          setMisses((m) => {
            const nm = m + expired.length;
            if (nm >= maxMisses) onComplete(false);
            return nm;
          });
        }
        return prev.filter((t) => t.hit || now - t.spawnTime <= 1000);
      });
    }, 100);
    return () => clearInterval(expiry);
  }, [onComplete]);

  function handleClick(target: Target) {
    const hit = isTargetHit(performance.now(), target.spawnTime);
    if (hit) {
      setTargets((prev) => prev.map((t) => t.id === target.id ? { ...t, hit: true } : t));
      setHits((h) => {
        const nh = h + 1;
        if (nh >= totalTargets) onComplete(true);
        return nh;
      });
    } else {
      setMisses((m) => {
        const nm = m + 1;
        if (nm >= maxMisses) onComplete(false);
        return nm;
      });
    }
  }

  return (
    <div className="fixed inset-0 bg-void overflow-hidden">
      <div className="absolute top-4 left-0 right-0 flex justify-center gap-8 z-10">
        <span className="font-cinzel text-celestial-gold">{t('ui.minigame.targetLock', 'Target Lock')}</span>
        <span className="font-rajdhani text-jade">Hits: {hits}/{totalTargets}</span>
        <span className="font-rajdhani text-red-400">Misses: {misses}/{maxMisses}</span>
      </div>

      <div className="absolute inset-0 mt-12">
        {targets.filter((t) => !t.hit).map((target) => (
          <button
            key={target.id}
            onClick={() => handleClick(target)}
            className="absolute w-12 h-12 rounded-full border-2 border-sakura bg-sakura bg-opacity-20 hover:bg-opacity-50 transition-all animate-ping-once"
            style={{ left: `${target.x}%`, top: `${target.y}%`, transform: 'translate(-50%, -50%)' }}
          />
        ))}
      </div>
    </div>
  );
}
