import { describe, it, expect, beforeEach } from 'vitest';
import { saveGame, loadGame, getSaveInfo, getNewGamePlusState } from '../../src/engine/saveEngine';
import { DEFAULT_STATS, FIRST_SCENE_ID } from '../../src/types/game.types';
import type { GameState } from '../../src/types/game.types';

function makeState(overrides?: Partial<GameState>): GameState {
  return {
    currentSceneId: 'scene_1_1',
    currentPhase: 'playing',
    stats: { ...DEFAULT_STATS, courage: 25 },
    flags: new Set(['test_flag']),
    inventory: new Map([['health_potion', 2]]),
    dialogueIndex: 3,
    activeCompanions: ['luna'],
    language: 'en',
    textSpeed: 'normal',
    fontSize: 'medium',
    highContrast: false,
    soundEnabled: false,
    totalDefeats: 1,
    playtime: 120,
    newGamePlus: false,
    completedEndings: [],
    playerName: 'Kai',
    advanceDialogue: () => {},
    makeChoice: () => {},
    goToScene: () => {},
    applyConsequences: () => {},
    saveGame: () => {},
    autoSave: () => {},
    loadGame: () => false,
    startNewGame: () => {},
    checkRequirements: () => true,
    setLanguage: () => {},
    setPlayerName: () => {},
    setPaused: () => {},
    setTextSpeed: () => {},
    ...overrides,
  };
}

describe('saveEngine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('save + load roundtrip preserves all fields', () => {
    const state = makeState();
    saveGame(state, 0);
    const loaded = loadGame(0);
    expect(loaded).not.toBeNull();
    expect(loaded?.currentSceneId).toBe('scene_1_1');
    expect(loaded?.stats?.['courage']).toBe(25);
    expect(loaded?.flags?.has('test_flag')).toBe(true);
    expect(loaded?.inventory?.get('health_potion')).toBe(2);
    expect(loaded?.totalDefeats).toBe(1);
    expect(loaded?.playtime).toBe(120);
  });

  it('auto-save does not overwrite manual slots', () => {
    const state = makeState();
    saveGame(state, 0);
    const autoState = makeState({ currentSceneId: 'scene_2_1' });
    saveGame(autoState, 'auto');
    const slot0 = loadGame(0);
    const auto = loadGame('auto');
    expect(slot0?.currentSceneId).toBe('scene_1_1');
    expect(auto?.currentSceneId).toBe('scene_2_1');
  });

  it('loading a non-existent slot returns null', () => {
    const loaded = loadGame(2);
    expect(loaded).toBeNull();
  });

  it('getSaveInfo returns correct metadata', () => {
    const state = makeState();
    saveGame(state, 1);
    const info = getSaveInfo(1);
    expect(info).not.toBeNull();
    expect(info?.slot).toBe(1);
    expect(info?.sceneId).toBe('scene_1_1');
  });

  it('New Game+ carries bonds and completedEndings only', () => {
    const state = makeState({ stats: { ...DEFAULT_STATS, luna_bond: 60, ryu_bond: 45 }, completedEndings: ['celestial_harmony'] });
    const ngState = getNewGamePlusState(state);
    expect(ngState.stats?.['luna_bond']).toBe(60);
    expect(ngState.stats?.['ryu_bond']).toBe(45);
    expect(ngState.stats?.['courage']).toBe(DEFAULT_STATS.courage);
    expect(ngState.currentSceneId).toBe(FIRST_SCENE_ID);
    expect(ngState.completedEndings).toContain('celestial_harmony');
    expect(ngState.flags?.has('ng_bonus')).toBe(true);
    expect(ngState.playtime).toBe(0);
  });
});
