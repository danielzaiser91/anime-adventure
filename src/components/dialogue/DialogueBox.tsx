import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { DialogueLine, TextSpeed } from '../../types/game.types';
import { useGameStore } from '../../store/gameStore';
import { GLOSSARY, type GlossaryTerm } from '../../data/glossary';

const CHAR_SPEEDS: Record<TextSpeed, number> = {
  slow: 50,
  normal: 25,
  fast: 10,
  instant: 0,
};

function Keyword({ term, word }: { term: GlossaryTerm; word: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <span
      className="text-celestial-gold underline decoration-dotted cursor-help relative inline"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onTouchStart={(e) => { e.preventDefault(); setVisible((v) => !v); }}
    >
      {word}
      {visible && (
        <span className="absolute bottom-full left-0 z-50 mb-2 bg-deep-night border border-spirit-blue rounded px-3 py-2 text-xs text-white pointer-events-none w-56 shadow-lg">
          <span className="text-celestial-gold font-cinzel font-semibold block mb-1">{term.label}</span>
          {term.description}
        </span>
      )}
    </span>
  );
}

function renderWithHighlights(text: string, terms: GlossaryTerm[]): React.ReactNode {
  if (!text || !terms.length) return text;

  type Match = { start: number; end: number; word: string; term: GlossaryTerm };
  const matches: Match[] = [];

  for (const term of terms) {
    const re = new RegExp(term.pattern.source, term.pattern.flags.replace('g', '') + 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      matches.push({ start: m.index, end: m.index + m[0].length, word: m[0], term });
    }
  }

  matches.sort((a, b) => a.start - b.start);

  const nodes: React.ReactNode[] = [];
  let pos = 0;
  for (const match of matches) {
    if (match.start < pos) continue;
    if (match.start > pos) nodes.push(text.slice(pos, match.start));
    nodes.push(<Keyword key={match.start} term={match.term} word={match.word} />);
    pos = match.end;
  }
  if (pos < text.length) nodes.push(text.slice(pos));

  return <>{nodes}</>;
}

interface Props {
  line: DialogueLine;
  textSpeed: TextSpeed;
  onComplete: () => void;
}

export function DialogueBox({ line, textSpeed, onComplete }: Props) {
  const { t } = useTranslation('story');
  const { playerName, language } = useGameStore();
  const resolvedName = playerName || 'Kai';
  const fullText = t(line.textKey, { playerName: resolvedName, defaultValue: line.textKey });

  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    indexRef.current = 0;

    if (textSpeed === 'instant') {
      setDisplayed(fullText);
      setDone(true);
      return;
    }

    const delay = CHAR_SPEEDS[textSpeed];
    const interval = setInterval(() => {
      indexRef.current += 1;
      setDisplayed(fullText.slice(0, indexRef.current));
      if (indexRef.current >= fullText.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, delay);

    return () => clearInterval(interval);
  }, [fullText, textSpeed]);

  function handleClick() {
    if (!done) {
      setDisplayed(fullText);
      setDone(true);
    } else {
      onComplete();
    }
  }

  const terms: GlossaryTerm[] = GLOSSARY[language] ?? GLOSSARY.en ?? [];
  const speakerDisplay = line.speaker === 'kai' ? resolvedName : line.speaker;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 px-4 pb-4 cursor-pointer select-none"
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') handleClick(); }}
      tabIndex={0}
      role="button"
    >
      <div className="max-w-4xl mx-auto bg-void bg-opacity-90 border border-spirit-blue rounded-lg p-4">
        {line.speaker !== 'narrator' && (
          <div className="text-celestial-gold font-cinzel text-sm mb-1 capitalize">
            {speakerDisplay}
          </div>
        )}
        <p className="font-noto text-white text-base leading-relaxed min-h-[3rem]">
          {done
            ? renderWithHighlights(displayed, terms)
            : <>{displayed}<span className="animate-pulse">|</span></>
          }
        </p>
        {done && (
          <div className="text-right text-spirit-blue text-xs mt-1 animate-bounce">▼</div>
        )}
      </div>
    </div>
  );
}
