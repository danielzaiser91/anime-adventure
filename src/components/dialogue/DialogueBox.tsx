import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { DialogueLine, TextSpeed } from '../../types/game.types';

const CHAR_SPEEDS: Record<TextSpeed, number> = {
  slow: 50,
  normal: 25,
  fast: 10,
  instant: 0,
};

interface Props {
  line: DialogueLine;
  textSpeed: TextSpeed;
  onComplete: () => void;
}

export function DialogueBox({ line, textSpeed, onComplete }: Props) {
  const { t } = useTranslation('story');
  const fullText = t(line.textKey, { defaultValue: line.textKey });
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
            {line.speaker}
          </div>
        )}
        <p className="font-noto text-white text-base leading-relaxed min-h-[3rem]">
          {displayed}
          {!done && <span className="animate-pulse">|</span>}
        </p>
        {done && (
          <div className="text-right text-spirit-blue text-xs mt-1 animate-bounce">▼</div>
        )}
      </div>
    </div>
  );
}
