import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../i18n/index';
import type { GameState, GameConsequences, SceneId, StatRequirement } from '../types/game.types';
import { DEFAULT_STATS, FIRST_SCENE_ID } from '../types/game.types';
import { applyConsequences, determineEnding, getScene, checkRequirements as engineCheckRequirements } from '../engine/storyEngine';
import { saveGame, loadGame as engineLoadGame, getNewGamePlusState } from '../engine/saveEngine';

const AUTOSAVE_INTERVAL_MS = 5 * 60 * 1000;

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentSceneId: FIRST_SCENE_ID,
      currentPhase: 'title',
      stats: { ...DEFAULT_STATS },
      flags: new Set<string>(),
      inventory: new Map(),
      dialogueIndex: 0,
      activeCompanions: [],
      language: 'en',
      textSpeed: 'normal',
      fontSize: 'medium',
      highContrast: false,
      soundEnabled: true,
      totalDefeats: 0,
      playtime: 0,
      newGamePlus: false,
      completedEndings: [],
      playerName: '',

      advanceDialogue: () =>
        set((state) => ({ dialogueIndex: state.dialogueIndex + 1 })),

      makeChoice: (choiceId: string) => {
        const state = get();
        const scene = getScene(state.currentSceneId);
        if (!scene?.choices) return;
        const choice = scene.choices.find((c) => c.id === choiceId);
        if (!choice) return;
        const { stats, flags, itemsGained } = applyConsequences(
          state.stats,
          state.flags,
          choice.consequences ?? {}
        );
        const newInventory = new Map(state.inventory);
        for (const itemId of itemsGained) {
          newInventory.set(itemId, (newInventory.get(itemId) ?? 0) + 1);
        }
        set({
          stats,
          flags,
          inventory: newInventory,
          currentSceneId: choice.nextSceneId,
          dialogueIndex: 0,
        });
      },

      goToScene: (sceneId: SceneId) =>
        set({ currentSceneId: sceneId, dialogueIndex: 0 }),

      applyConsequences: (consequences: GameConsequences) => {
        const state = get();
        const result = applyConsequences(state.stats, state.flags, consequences);
        const newInventory = new Map(state.inventory);
        for (const itemId of result.itemsGained) {
          newInventory.set(itemId, (newInventory.get(itemId) ?? 0) + 1);
        }
        set({ stats: result.stats, flags: result.flags, inventory: newInventory });
      },

      saveGame: (slot: 0 | 1 | 2) => {
        const state = get();
        saveGame(state, slot);
      },

      autoSave: () => {
        const state = get();
        saveGame(state, 'auto');
      },

      loadGame: (slot: 0 | 1 | 2 | 'auto') => {
        const loaded = engineLoadGame(slot);
        if (!loaded) return false;
        set({
          currentSceneId: loaded.currentSceneId ?? FIRST_SCENE_ID,
          stats: loaded.stats ?? { ...DEFAULT_STATS },
          flags: loaded.flags ?? new Set(),
          inventory: loaded.inventory ?? new Map(),
          activeCompanions: loaded.activeCompanions ?? [],
          totalDefeats: loaded.totalDefeats ?? 0,
          playtime: loaded.playtime ?? 0,
          dialogueIndex: 0,
          currentPhase: 'playing',
        });
        return true;
      },

      startNewGame: (ng?: boolean) => {
        const state = get();
        if (ng) {
          const ngState = getNewGamePlusState(state);
          set({ ...ngState, currentPhase: 'playing' });
        } else {
          set({
            currentSceneId: FIRST_SCENE_ID,
            currentPhase: 'playing',
            stats: { ...DEFAULT_STATS },
            flags: new Set(),
            inventory: new Map(),
            dialogueIndex: 0,
            activeCompanions: [],
            totalDefeats: 0,
            playtime: 0,
            newGamePlus: false,
          });
        }
      },

      checkRequirements: (reqs: StatRequirement[]) => {
        const state = get();
        return engineCheckRequirements(state.stats, reqs);
      },

      setLanguage: (lang: 'en' | 'de') => {
        set({ language: lang });
        void i18n.changeLanguage(lang);
      },
      setPlayerName: (name: string) => set({ playerName: name }),
      setPaused: (paused: boolean) =>
        set({ currentPhase: paused ? 'paused' : 'playing' }),
      setTextSpeed: (speed) => set({ textSpeed: speed }),
    }),
    {
      name: 'CAB_GAME_STATE',
      storage: {
        getItem: (name) => {
          const raw = localStorage.getItem(name);
          if (!raw) return null;
          const parsed = JSON.parse(raw) as { state: Record<string, unknown> };
          if (parsed.state) {
            const s = parsed.state;
            if (Array.isArray(s['flags'])) s['flags'] = new Set(s['flags'] as string[]);
            if (Array.isArray(s['inventory'])) s['inventory'] = new Map(s['inventory'] as [string, number][]);
          }
          return parsed;
        },
        setItem: (name, value) => {
          const v = value as { state: Record<string, unknown> };
          const copy = { ...v, state: { ...v.state } };
          if (copy.state['flags'] instanceof Set) copy.state['flags'] = Array.from(copy.state['flags'] as Set<string>);
          if (copy.state['inventory'] instanceof Map) copy.state['inventory'] = Array.from((copy.state['inventory'] as Map<string, number>).entries());
          localStorage.setItem(name, JSON.stringify(copy));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
      partialize: (state) => ({
        language: state.language,
        textSpeed: state.textSpeed,
        fontSize: state.fontSize,
        highContrast: state.highContrast,
        soundEnabled: state.soundEnabled,
        completedEndings: state.completedEndings,
        playerName: state.playerName,
      }),
    }
  )
);

let autosaveTimer: ReturnType<typeof setInterval> | null = null;

export function startAutosave(): void {
  if (autosaveTimer) clearInterval(autosaveTimer);
  autosaveTimer = setInterval(() => {
    useGameStore.getState().autoSave();
  }, AUTOSAVE_INTERVAL_MS);
}

export function stopAutosave(): void {
  if (autosaveTimer) {
    clearInterval(autosaveTimer);
    autosaveTimer = null;
  }
}

export function selectEndingScene(flags: Set<string>, stats: import('../types/game.types').GameStats): SceneId {
  return determineEnding(stats, flags);
}
