import type { GameState, SaveData, GameStats, ItemId } from '../types/game.types';
import { DEFAULT_STATS, FIRST_SCENE_ID } from '../types/game.types';

const SAVE_PREFIX = 'CAB_SAVE_';

export function saveGame(state: GameState, slot: 0 | 1 | 2 | 'auto', screenshotDataUrl?: string): void {
  const currentScene = state.currentSceneId;

  const data: SaveData = {
    slot,
    timestamp: Date.now(),
    sceneId: currentScene,
    sceneNameKey: `${currentScene}_name`,
    playtime: state.playtime,
    stats: { ...state.stats },
    flags: Array.from(state.flags),
    inventory: Array.from(state.inventory.entries()),
    activeCompanions: [...state.activeCompanions],
    totalDefeats: state.totalDefeats,
    screenshotDataUrl,
  };

  try {
    localStorage.setItem(`${SAVE_PREFIX}${slot}`, JSON.stringify(data));
  } catch (e) {
    console.warn('Save failed (localStorage full?)', e);
  }
}

export function loadGame(slot: 0 | 1 | 2 | 'auto'): Partial<GameState> | null {
  const raw = localStorage.getItem(`${SAVE_PREFIX}${slot}`);
  if (!raw) return null;

  try {
    const data: SaveData = JSON.parse(raw) as SaveData;
    return {
      currentSceneId: data.sceneId,
      stats: data.stats,
      flags: new Set(data.flags),
      inventory: new Map(data.inventory as [ItemId, number][]),
      activeCompanions: data.activeCompanions,
      totalDefeats: data.totalDefeats,
      playtime: data.playtime,
    };
  } catch (e) {
    console.warn('Failed to parse save data', e);
    return null;
  }
}

export function getSaveInfo(slot: 0 | 1 | 2 | 'auto'): SaveData | null {
  const raw = localStorage.getItem(`${SAVE_PREFIX}${slot}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SaveData;
  } catch {
    return null;
  }
}

export function captureScreenshot(canvasOrElement?: HTMLElement): string | undefined {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 45;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    if (canvasOrElement instanceof HTMLCanvasElement) {
      ctx.drawImage(canvasOrElement, 0, 0, 80, 45);
    } else {
      ctx.fillStyle = '#1a0a2e';
      ctx.fillRect(0, 0, 80, 45);
    }

    return canvas.toDataURL('image/jpeg', 0.7);
  } catch {
    return undefined;
  }
}

export function getNewGamePlusState(prevState: GameState): Partial<GameState> {
  return {
    currentSceneId: FIRST_SCENE_ID,
    currentPhase: 'playing',
    stats: {
      ...DEFAULT_STATS,
      luna_bond: prevState.stats.luna_bond,
      ryu_bond: prevState.stats.ryu_bond,
      suki_bond: prevState.stats.suki_bond,
    },
    flags: new Set(['ng_bonus']),
    inventory: new Map(),
    dialogueIndex: 0,
    activeCompanions: [],
    totalDefeats: 0,
    playtime: 0,
    newGamePlus: true,
    completedEndings: prevState.completedEndings,
  };
}
