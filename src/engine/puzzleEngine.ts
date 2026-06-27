import type { PuzzleType } from '../types/game.types';

// Void Code cipher: 26-symbol substitution, fixed table
// Message: "THE GATE OPENS AT MIDNIGHT WHEN THE MOON BLEEDS"
export const VOID_CODE_MESSAGE = 'THE GATE OPENS AT MIDNIGHT WHEN THE MOON BLEEDS';
export const VOID_CIPHER_TABLE: Record<string, string> = {
  A: 'α', B: 'β', C: 'γ', D: 'δ', E: 'ε', F: 'ζ', G: 'η', H: 'θ', I: 'ι', J: 'κ',
  K: 'λ', L: 'μ', M: 'ν', N: 'ξ', O: 'ο', P: 'π', Q: 'ρ', R: 'σ', S: 'τ', T: 'υ',
  U: 'φ', V: 'χ', W: 'ψ', X: 'ω', Y: '꜀', Z: '꜁',
};

export const VOID_CIPHER_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(VOID_CIPHER_TABLE).map(([k, v]) => [v, k])
);

// Pre-revealed mappings (10 of 26)
export const PRE_REVEALED_MAPPINGS: Record<string, string> = {
  α: 'A', ε: 'E', θ: 'H', ι: 'I', ξ: 'N', ο: 'O', τ: 'S', υ: 'T', ψ: 'W', η: 'G',
};

export function encodedVoidMessage(): string {
  return VOID_CODE_MESSAGE
    .split('')
    .map((ch) => (ch === ' ' ? ' ' : (VOID_CIPHER_TABLE[ch] ?? ch)))
    .join('');
}

export function validateVoidCode(inputs: Record<string, string>): boolean {
  const combined = { ...PRE_REVEALED_MAPPINGS, ...inputs };
  for (const [symbol, letter] of Object.entries(VOID_CIPHER_REVERSE)) {
    if (!(symbol in PRE_REVEALED_MAPPINGS) && combined[symbol] !== letter) {
      return false;
    }
  }
  return true;
}

// Weight balance: item weights for the spirit realm puzzle
export const BALANCE_ITEM_WEIGHTS: Record<string, number> = {
  'Moonstone': 3,
  'Spirit Shard': 5,
  'Void Crystal': 8,
  'Fox Charm': 4,
  'Celestial Dust': 2,
  'Iron Ingot': 10,
  'Silver Leaf': 1,
};

export type PuzzleState = {
  type: PuzzleType;
  solved: boolean;
  hintsUsed: number;
};

export function createPuzzleState(type: PuzzleType): PuzzleState {
  return { type, solved: false, hintsUsed: 0 };
}
