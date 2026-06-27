import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PuzzleConfig } from '../../types/game.types';
import { encodedVoidMessage, PRE_REVEALED_MAPPINGS, VOID_CIPHER_REVERSE, validateVoidCode } from '../../engine/puzzleEngine';

interface Props {
  puzzle: PuzzleConfig;
  onSuccess: () => void;
  onFail: () => void;
}

export function PuzzleScreen({ puzzle, onSuccess, onFail }: Props) {
  const { t } = useTranslation();

  if (puzzle.type === 'seal_assembly') {
    return <SealAssemblyPuzzle puzzle={puzzle} onSuccess={onSuccess} onFail={onFail} />;
  }
  if (puzzle.type === 'void_code') {
    return <VoidCodePuzzle puzzle={puzzle} onSuccess={onSuccess} onFail={onFail} />;
  }
  if (puzzle.type === 'memory_sequence') {
    return <MemorySequencePuzzle onSuccess={onSuccess} onFail={onFail} />;
  }
  if (puzzle.type === 'weight_balance') {
    return <WeightBalancePuzzle onSuccess={onSuccess} onFail={onFail} />;
  }

  return (
    <div className="fixed inset-0 bg-void flex items-center justify-center">
      <div className="text-celestial-gold font-cinzel">{t('puzzle.unsupported')}</div>
    </div>
  );
}

function VoidCodePuzzle({ puzzle, onSuccess, onFail }: { puzzle: PuzzleConfig; onSuccess: () => void; onFail: () => void }) {
  const { t } = useTranslation();
  const encoded = encodedVoidMessage();
  const nonRevealed = Object.entries(VOID_CIPHER_REVERSE).filter(([sym]) => !(sym in PRE_REVEALED_MAPPINGS));
  const [inputs, setInputs] = useState<Record<string, string>>(() =>
    Object.fromEntries(nonRevealed.map(([sym]) => [sym, '']))
  );
  const [hintsUsed, setHintsUsed] = useState(0);
  const maxHints = puzzle.maxHints ?? 3;

  function handleSubmit() {
    if (validateVoidCode(inputs)) {
      onSuccess();
    } else {
      onFail();
    }
  }

  function handleHint() {
    if (hintsUsed >= maxHints) return;
    const unfilled = nonRevealed.find(([sym]) => !inputs[sym]);
    if (!unfilled) return;
    const [sym, letter] = unfilled;
    setInputs((prev) => ({ ...prev, [sym]: letter }));
    setHintsUsed((h) => h + 1);
  }

  return (
    <div className="fixed inset-0 bg-void bg-opacity-95 flex flex-col items-center justify-center p-6 overflow-auto">
      <h2 className="font-cinzel text-celestial-gold text-xl mb-2">{t('puzzle.voidCode')}</h2>
      <p className="text-spirit-blue font-noto text-sm mb-4 max-w-lg text-center">{encoded}</p>

      <div className="grid grid-cols-4 gap-2 max-w-2xl w-full mb-4">
        {Object.entries(PRE_REVEALED_MAPPINGS).map(([sym, ltr]) => (
          <div key={sym} className="flex items-center gap-1 bg-deep-night rounded p-2">
            <span className="text-jade text-lg w-8 text-center">{sym}</span>
            <span className="text-gray-400">→</span>
            <span className="text-celestial-gold font-rajdhani">{ltr}</span>
          </div>
        ))}
        {nonRevealed.map(([sym]) => (
          <div key={sym} className="flex items-center gap-1 bg-deep-night rounded p-2">
            <span className="text-spirit-blue text-lg w-8 text-center">{sym}</span>
            <span className="text-gray-400">→</span>
            <input
              className="w-8 bg-void border border-spirit-blue text-white font-rajdhani text-center rounded uppercase"
              maxLength={1}
              value={inputs[sym] ?? ''}
              onChange={(e) => setInputs((prev) => ({ ...prev, [sym]: e.target.value.toUpperCase() }))}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleHint}
          disabled={hintsUsed >= maxHints}
          className="px-4 py-2 border border-sakura text-sakura font-rajdhani rounded hover:bg-sakura hover:text-void transition-colors disabled:opacity-40 text-sm"
        >
          {t('puzzle.hint')} ({maxHints - hintsUsed})
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-spirit-blue text-white font-rajdhani rounded hover:bg-blue-700 transition-colors"
        >
          {t('puzzle.submit')}
        </button>
      </div>
    </div>
  );
}

const SEQUENCE_LENGTH = 5;
const NODES = [0, 1, 2, 3, 4, 5, 6, 7];

function MemorySequencePuzzle({ onSuccess, onFail }: { onSuccess: () => void; onFail: () => void }) {
  const { t } = useTranslation();
  const [sequence] = useState<number[]>(() => NODES.sort(() => Math.random() - 0.5).slice(0, SEQUENCE_LENGTH));
  const [showing, setShowing] = useState(true);
  const [playerSeq, setPlayerSeq] = useState<number[]>([]);
  const [activeNode, setActiveNode] = useState<number | null>(null);

  React.useEffect(() => {
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    function showNext() {
      if (i >= sequence.length) {
        setTimeout(() => setShowing(false), 600);
        return;
      }
      setActiveNode(sequence[i] ?? null);
      i++;
      timer = setTimeout(() => { setActiveNode(null); timer = setTimeout(showNext, 300); }, 600);
    }
    showNext();
    return () => clearTimeout(timer);
  }, []);

  function handleNodeClick(node: number) {
    if (showing) return;
    const next = [...playerSeq, node];
    setPlayerSeq(next);
    if (next.length === sequence.length) {
      const correct = next.every((n, i) => n === sequence[i]);
      setTimeout(() => { correct ? onSuccess() : onFail(); }, 400);
    }
  }

  return (
    <div className="fixed inset-0 bg-void flex flex-col items-center justify-center gap-6">
      <h2 className="font-cinzel text-celestial-gold text-xl">{t('puzzle.memorySequence')}</h2>
      {showing && <p className="text-spirit-blue font-noto text-sm">{t('puzzle.watch')}</p>}
      {!showing && <p className="text-sakura font-noto text-sm">{t('puzzle.repeat')} ({playerSeq.length}/{sequence.length})</p>}
      <div className="grid grid-cols-4 gap-4">
        {NODES.map((n) => (
          <button
            key={n}
            onClick={() => handleNodeClick(n)}
            disabled={showing}
            className={`w-16 h-16 rounded-full border-2 transition-all font-cinzel text-lg
              ${activeNode === n
                ? 'bg-celestial-gold border-celestial-gold text-void scale-110'
                : 'bg-deep-night border-spirit-blue text-spirit-blue hover:bg-spirit-blue hover:text-white'
              }`}
          >
            {n + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

const ITEMS = [
  { name: 'Moonstone', weight: 3 },
  { name: 'Spirit Shard', weight: 5 },
  { name: 'Void Crystal', weight: 8 },
  { name: 'Fox Charm', weight: 4 },
];
const TARGET = ITEMS.slice(0, 2).reduce((s, i) => s + i.weight, 0);

function WeightBalancePuzzle({ onSuccess, onFail }: { onSuccess: () => void; onFail: () => void }) {
  const { t } = useTranslation();
  const [leftSide, setLeftSide] = useState<string[]>([]);

  const total = leftSide.reduce((s, name) => {
    const item = ITEMS.find((i) => i.name === name);
    return s + (item?.weight ?? 0);
  }, 0);

  function toggle(name: string) {
    setLeftSide((prev) => prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]);
  }

  function handleSubmit() {
    total === TARGET ? onSuccess() : onFail();
  }

  return (
    <div className="fixed inset-0 bg-void flex flex-col items-center justify-center gap-6 p-6">
      <h2 className="font-cinzel text-celestial-gold text-xl">{t('puzzle.weightBalance')}</h2>
      <p className="text-spirit-blue font-noto text-sm">{t('puzzle.targetWeight', { weight: TARGET })}</p>
      <div className="grid grid-cols-2 gap-3">
        {ITEMS.map((item) => (
          <button
            key={item.name}
            onClick={() => toggle(item.name)}
            className={`px-4 py-3 rounded border transition-all font-rajdhani
              ${leftSide.includes(item.name)
                ? 'bg-spirit-blue border-spirit-blue text-white'
                : 'bg-deep-night border-gray-600 text-gray-300 hover:border-spirit-blue'
              }`}
          >
            {item.name} ({item.weight})
          </button>
        ))}
      </div>
      <div className="text-celestial-gold font-rajdhani">
        {t('puzzle.currentWeight', { current: total, target: TARGET })}
      </div>
      <button
        onClick={handleSubmit}
        className="px-6 py-2 bg-celestial-gold text-void font-rajdhani rounded hover:bg-yellow-400 transition-colors"
      >
        {t('puzzle.submit')}
      </button>
    </div>
  );
}

// Seal Assembly: tap the 4 rune fragments in the correct order (N → E → S → W)
const SEAL_ORDER = ['N', 'E', 'S', 'W'] as const;
type SealRune = typeof SEAL_ORDER[number];

function SealAssemblyPuzzle({ puzzle, onSuccess, onFail }: { puzzle: PuzzleConfig; onSuccess: () => void; onFail: () => void }) {
  const { t } = useTranslation();
  const [activated, setActivated] = useState<SealRune[]>([]);
  const [mistake, setMistake] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const maxHints = puzzle.maxHints ?? 3;

  const runePositions: Record<SealRune, { top: string; left: string }> = {
    N: { top: '10%', left: '42%' },
    E: { top: '42%', left: '74%' },
    S: { top: '74%', left: '42%' },
    W: { top: '42%', left: '10%' },
  };

  function handleRune(rune: SealRune) {
    if (mistake) return;
    const expected = SEAL_ORDER[activated.length];
    if (rune !== expected) {
      setMistake(true);
      setTimeout(() => {
        setActivated([]);
        setMistake(false);
        onFail(); // apply stat penalty but continue
      }, 900);
      return;
    }
    const next = [...activated, rune];
    setActivated(next);
    if (next.length === SEAL_ORDER.length) {
      setTimeout(onSuccess, 600);
    }
  }

  function handleHint() {
    if (hintsUsed >= maxHints) return;
    const next = SEAL_ORDER[activated.length];
    if (next) {
      setHintsUsed((h) => h + 1);
      handleRune(next);
    }
  }

  const sealComplete = activated.length === SEAL_ORDER.length;

  return (
    <div className="fixed inset-0 bg-void bg-opacity-95 flex flex-col items-center justify-center gap-4 p-6">
      <h2 className="font-cinzel text-celestial-gold text-xl">{t('puzzle.sealAssembly', { defaultValue: 'Seal Assembly' })}</h2>
      <p className="text-spirit-blue font-rajdhani text-sm text-center max-w-md">
        {t('puzzle.sealInstr', { defaultValue: 'Activate the four rune fragments in the correct order to restore the ancient seal.' })}
      </p>

      {/* Seal diagram */}
      <div className="relative w-64 h-64 my-4">
        {/* Center circle */}
        <div className={`absolute inset-8 rounded-full border-4 transition-all duration-500
          ${sealComplete ? 'border-celestial-gold bg-celestial-gold bg-opacity-20' : mistake ? 'border-red-500' : 'border-void-purple bg-void-purple bg-opacity-10'}`}
        />
        {/* Cross lines */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-full h-px ${mistake ? 'bg-red-500' : 'bg-void-purple'} opacity-40`} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`h-full w-px ${mistake ? 'bg-red-500' : 'bg-void-purple'} opacity-40`} />
        </div>

        {/* Rune buttons */}
        {(Object.entries(runePositions) as [SealRune, { top: string; left: string }][]).map(([rune, pos]) => {
          const isActive = activated.includes(rune);
          return (
            <button
              key={rune}
              onClick={() => handleRune(rune)}
              disabled={isActive || sealComplete}
              className={`absolute w-14 h-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 font-cinzel text-lg transition-all duration-300 select-none
                ${isActive
                  ? 'bg-celestial-gold border-celestial-gold text-void scale-110'
                  : mistake
                    ? 'bg-red-900 border-red-500 text-red-300'
                    : 'bg-deep-night border-spirit-blue text-spirit-blue hover:border-celestial-gold hover:text-celestial-gold hover:scale-105 active:scale-95'
                }`}
              style={{ top: pos.top, left: pos.left }}
            >
              {rune}
            </button>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="flex gap-2">
        {SEAL_ORDER.map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full transition-all duration-300
            ${i < activated.length ? 'bg-celestial-gold' : 'bg-gray-700'}`}
          />
        ))}
      </div>

      {mistake && <p className="text-red-400 font-rajdhani text-sm animate-pulse">{t('puzzle.wrongOrder', { defaultValue: 'Wrong order — try again' })}</p>}

      <button
        onClick={handleHint}
        disabled={hintsUsed >= maxHints || sealComplete}
        className="px-4 py-2 border border-sakura text-sakura font-rajdhani rounded hover:bg-sakura hover:text-void transition-colors disabled:opacity-40 text-sm mt-2"
      >
        {t('puzzle.hint')} ({maxHints - hintsUsed})
      </button>
    </div>
  );
}
