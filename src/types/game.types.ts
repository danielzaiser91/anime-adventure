// Core ID types
export type SceneId = string;
export type CharacterId = 'kai' | 'luna' | 'ryu' | 'suki' | 'malachar' | 'vex' | 'narrator';
export type VexExpression = 'neutral' | 'angry' | 'determined' | 'battle_stance';
export type Expression = 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'determined' | 'battle_stance' | 'victory';
export type BackgroundId = string;
export type ItemId = string;
export type AmbienceType =
  | 'village_peaceful'
  | 'forest_night'
  | 'mystical'
  | 'sky_city'
  | 'underground'
  | 'void_dark'
  | 'spirit_realm'
  | 'combat'
  | 'boss_combat'
  | 'ending_peaceful';
export type SfxType =
  | 'dialogue_advance'
  | 'choice_select'
  | 'stat_increase'
  | 'stat_decrease'
  | 'combat_hit_perfect'
  | 'combat_hit_good'
  | 'combat_hit_miss'
  | 'combat_victory'
  | 'combat_defeat'
  | 'puzzle_solved'
  | 'puzzle_hint'
  | 'minigame_success'
  | 'save_complete'
  | 'bond_milestone'
  | 'install_prompt';

export type SceneType = 'dialogue' | 'combat' | 'puzzle' | 'minigame' | 'exploration' | 'cinematic';
export type TextSpeed = 'slow' | 'normal' | 'fast' | 'instant';

// Dialogue
export interface DialogueLine {
  speaker: CharacterId;
  textKey: string;
  expression?: Expression;
  characterPosition?: 'left' | 'right' | 'center' | 'none';
}

// Stats
export interface GameStats {
  courage: number;
  wisdom: number;
  empathy: number;
  strength: number;
  spirit: number;
  luna_bond: number;
  ryu_bond: number;
  suki_bond: number;
  agility_bonus: number;
  [key: string]: number;
}

export interface StatRequirement {
  stat: keyof GameStats;
  minimum: number;
}

export interface GameConsequences {
  statChanges?: Partial<GameStats>;
  itemGains?: ItemId[];
  flagsSet?: string[];
  flagsCleared?: string[];
}

// Choices
export interface Choice {
  id: string;
  textKey: string;
  requires?: StatRequirement[];
  consequences: GameConsequences;
  nextSceneId: SceneId;
  disabled?: boolean;
}

// Items
export interface Item {
  id: ItemId;
  nameKey: string;
  descriptionKey: string;
  usableInCombat: boolean;
  effect: GameConsequences;
}

// Skills
export interface Skill {
  id: string;
  nameKey: string;
  spCost: number;
  damage?: number;
  effect?: 'shield' | 'heal_lowest' | 'poison' | 'reveal_weakness' | 'all_damage' | 'quick_attacks';
}

// Combat
export interface Enemy {
  id: string;
  nameKey: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  attackPatterns: AttackPattern[];
  weakness?: string;
  drops?: ItemId[];
}

export interface AttackPattern {
  id: string;
  damage: number;
  type: 'normal' | 'heavy' | 'all_party' | 'ultimate';
  warningTurns: number;
}

export interface CombatPhase {
  triggerHpPercent: number;
  additionalEnemies?: Enemy[];
  dialogueKey?: string;
  specialEvent?: 'luna_speaks' | 'suki_void_weapon' | 'vex_betrayal' | 'ryu_save';
}

export interface CombatEncounter {
  enemies: Enemy[];
  backgroundId: BackgroundId;
  canFlee?: boolean;
  isTutorial?: boolean;
  phases?: CombatPhase[];
  onVictory: GameConsequences;
  onDefeat?: { retry: true } | { nextSceneId: SceneId };
  easyModeAfterDefeats?: number;
}

// Puzzles
export type PuzzleType = 'seal_assembly' | 'investigation_board' | 'memory_sequence' | 'void_code' | 'weight_balance';

export interface PuzzleConfig {
  type: PuzzleType;
  timeLimitSeconds?: number;
  maxHints?: number;
  hintCost?: Partial<GameStats>;
  onSuccess: GameConsequences;
  onFail?: GameConsequences;
}

// Minigames
export type MinigameType = 'branch_dodge' | 'rhythm_ritual' | 'target_lock' | 'squad_tactics' | 'stealth_section';

export interface MinigameConfig {
  type: MinigameType;
  lives?: number;
  onSuccess: GameConsequences;
  onFail?: GameConsequences;
}

// Exploration
export interface Hotspot {
  id: string;
  xPercent: number;
  yPercent: number;
  textKey: string;
  itemGain?: ItemId;
  consequences?: GameConsequences;
}

export interface ExplorationConfig {
  hotspots: Hotspot[];
}

// Scene
export interface Scene {
  id: SceneId;
  type: SceneType;
  background: BackgroundId;
  ambienceOverride?: AmbienceType;
  dialogue?: DialogueLine[];
  choices?: Choice[];
  combat?: CombatEncounter;
  puzzle?: PuzzleConfig;
  minigame?: MinigameConfig;
  exploration?: ExplorationConfig;
  onEnter?: GameConsequences;
  nextSceneId?: SceneId;
}

// Save data
export interface SaveData {
  slot: 0 | 1 | 2 | 'auto';
  timestamp: number;
  sceneId: SceneId;
  sceneNameKey: string;
  playtime: number;
  stats: GameStats;
  flags: string[];
  inventory: [ItemId, number][];
  activeCompanions: CharacterId[];
  totalDefeats: number;
  screenshotDataUrl?: string | undefined;
}

// Game state
export interface GameState {
  currentSceneId: SceneId;
  currentPhase: 'title' | 'onboarding' | 'playing' | 'paused' | 'settings';
  stats: GameStats;
  flags: Set<string>;
  inventory: Map<ItemId, number>;
  dialogueIndex: number;
  activeCompanions: CharacterId[];
  language: 'en' | 'de';
  textSpeed: 'slow' | 'normal' | 'fast' | 'instant';
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  soundEnabled: boolean;
  totalDefeats: number;
  playtime: number;
  newGamePlus: boolean;
  completedEndings: string[];
  playerName: string;
  advanceDialogue: () => void;
  makeChoice: (choiceId: string) => void;
  goToScene: (sceneId: SceneId) => void;
  applyConsequences: (c: GameConsequences) => void;
  saveGame: (slot: 0 | 1 | 2) => void;
  autoSave: () => void;
  loadGame: (slot: 0 | 1 | 2 | 'auto') => boolean;
  startNewGame: (ng?: boolean) => void;
  checkRequirements: (reqs: StatRequirement[]) => boolean;
  setLanguage: (lang: 'en' | 'de') => void;
  setPlayerName: (name: string) => void;
  setPaused: (paused: boolean) => void;
}

export const DEFAULT_STATS: GameStats = {
  courage: 10,
  wisdom: 10,
  empathy: 10,
  strength: 10,
  spirit: 10,
  luna_bond: 0,
  ryu_bond: 0,
  suki_bond: 0,
  agility_bonus: 0,
};

export const FIRST_SCENE_ID: SceneId = 'scene_1_1';
