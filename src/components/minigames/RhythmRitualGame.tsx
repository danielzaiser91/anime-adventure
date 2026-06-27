import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generateRhythmSequence } from '../../engine/minigameEngine';

interface Props {
  onComplete: (success: boolean) => void;
}

export function RhythmRitualGame({ onComplete }: Props) {
  const { t } = useTranslation();
  const [round, setRound] = useState(0);
  const [sequence] = useState<number[]>(() => generateRhythmSequence(0));
  const [playerSeq, setPlayerSeq] = useState<number[]>([]);
  const [showingIdx, setShowingIdx] = useState<number | null>(null);
  const [phase, setPhase] = useState<'showing' | 'input'>('showing');
  const maxRounds = 3;

  useEffect(() => {
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    function showNext() {
      if (i >= sequence.length) { setTimeout(() => setPhase('input'), 500); return; }
      setShowingIdx(sequence[i] ?? null);
      i++;
      timer = setTimeout(() => { setShowingIdx(null); timer = setTimeout(showNext, 250); }, 500);
    }
    setPhase('showing');
    showNext();
    return () => clearTimeout(timer);
  }, [round]);

  function handleNode(n: number) {
    if (phase !== 'input') return;
    const next = [...playerSeq, n];
    setPlayerSeq(next);
    if (next.length === sequence.length) {
      const correct = next.every((v, i) => v === sequence[i]);
      if (!correct) { onComplete(false); return; }
      if (round + 1 >= maxRounds) { onComplete(true); return; }
      setRound((r) => r + 1);
      setPlayerSeq([]);
    }
  }

  return (
    <div className="fixed inset-0 bg-void flex flex-col items-center justify-center gap-6">
      <h2 className="font-cinzel text-celestial-gold text-xl">{t('ui.minigame.rhythmRitual', 'Rhythm Ritual')}</h2>
      <p className="text-spirit-blue font-noto text-sm">Round {round + 1}/{maxRounds} — {phase === 'showing' ? t('ui.minigame.watch', 'Watch...') : t('ui.minigame.repeat', 'Repeat!')}</p>
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 8 }, (_, n) => (
          <button
            key={n}
            onClick={() => handleNode(n)}
            disabled={phase === 'showing'}
            className={`w-14 h-14 rounded-full border-2 transition-all font-cinzel
              ${showingIdx === n
                ? 'bg-celestial-gold border-celestial-gold text-void scale-110'
                : playerSeq[playerSeq.length - 1] === n && phase === 'input'
                  ? 'bg-spirit-blue border-spirit-blue text-white'
                  : 'bg-deep-night border-spirit-blue text-spirit-blue hover:bg-spirit-blue hover:text-white disabled:opacity-40'
              }`}
          >
            {n + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
