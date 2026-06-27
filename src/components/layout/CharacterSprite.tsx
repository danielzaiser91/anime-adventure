import React from 'react';
import type { CharacterId, Expression } from '../../types/game.types';
import { useImageUrl } from '../../hooks/useImageUrl';

interface Props {
  characterId: CharacterId;
  expression: Expression;
  position: 'left' | 'right';
  active: boolean;
}

export function CharacterSprite({ characterId, expression, position, active }: Props) {
  const key = `${characterId}_${expression}`;
  const url = useImageUrl(key);

  return (
    <div
      className={`absolute bottom-0 transition-all duration-300 pointer-events-none select-none z-10
        ${position === 'left' ? 'left-4' : 'right-4'}
        ${active ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}
      `}
      style={{ height: '70%', aspectRatio: '512 / 800' }}
    >
      <img
        src={url}
        alt={characterId}
        className="h-full w-auto object-contain"
        style={{ filter: active ? 'none' : 'brightness(0.6)' }}
      />
    </div>
  );
}
