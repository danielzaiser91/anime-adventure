import type { Scene } from '../../types/game.types';

export const act3Scenes: Scene[] = [
  {
    id: 'scene_3_1',
    type: 'exploration',
    background: 'spirit_realm',
    ambienceOverride: 'spirit_realm',
    dialogue: [
      { speaker: 'narrator', textKey: 'scene_3_1_line_0' },
      { speaker: 'narrator', textKey: 'scene_3_1_line_1' },
    ],
    exploration: {
      hotspots: [
        {
          id: 'fox_spirit_guide',
          xPercent: 50,
          yPercent: 30,
          textKey: 'scene_3_1_line_2',
        },
        {
          id: 'memory_fragment',
          xPercent: 20,
          yPercent: 60,
          textKey: 'scene_3_1_line_3',
        },
      ],
    },
    nextSceneId: 'scene_3_1_puzzle_a',
  },
  {
    id: 'scene_3_1_puzzle_a',
    type: 'puzzle',
    background: 'spirit_realm',
    dialogue: [
      { speaker: 'narrator', textKey: 'scene_3_1_line_4' },
    ],
    puzzle: {
      type: 'memory_sequence',
      onSuccess: {},
      onFail: { statChanges: { spirit: -3 } },
    },
    nextSceneId: 'scene_3_1_puzzle_b',
  },
  {
    id: 'scene_3_1_puzzle_b',
    type: 'puzzle',
    background: 'spirit_realm',
    dialogue: [
      { speaker: 'narrator', textKey: 'scene_3_1_line_5' },
    ],
    puzzle: {
      type: 'weight_balance',
      onSuccess: {},
      onFail: { statChanges: { spirit: -3 } },
    },
    nextSceneId: 'scene_3_2',
  },
  {
    id: 'scene_3_2',
    type: 'dialogue',
    background: 'spirit_realm',
    ambienceOverride: 'spirit_realm',
    dialogue: [
      { speaker: 'narrator', textKey: 'scene_3_2_line_0' },
      { speaker: 'narrator', textKey: 'scene_3_2_line_1' },
    ],
    nextSceneId: 'scene_3_2_luna',
  },
  {
    id: 'scene_3_2_luna',
    type: 'dialogue',
    background: 'spirit_realm',
    dialogue: [
      { speaker: 'kai', textKey: 'scene_3_2_line_2', expression: 'neutral', characterPosition: 'left' },
    ],
    choices: [
      {
        id: 'luna_forgive',
        textKey: 'scene_3_2_line_3_forgive',
        consequences: { flagsSet: ['luna_forgave_malachar'], statChanges: { luna_bond: 10 } },
        nextSceneId: 'scene_3_2_ryu',
      },
      {
        id: 'luna_condemn',
        textKey: 'scene_3_2_line_3_condemn',
        consequences: { statChanges: { luna_bond: -5 } },
        nextSceneId: 'scene_3_2_ryu',
      },
    ],
  },
  {
    id: 'scene_3_2_ryu',
    type: 'dialogue',
    background: 'spirit_realm',
    dialogue: [
      { speaker: 'kai', textKey: 'scene_3_2_line_4', expression: 'neutral', characterPosition: 'left' },
    ],
    choices: [
      {
        id: 'ryu_admit',
        textKey: 'scene_3_2_line_5_admit',
        consequences: { statChanges: { ryu_bond: 10 } },
        nextSceneId: 'scene_3_2_suki',
      },
      {
        id: 'ryu_deny',
        textKey: 'scene_3_2_line_5_deny',
        consequences: { statChanges: { ryu_bond: -10 } },
        nextSceneId: 'scene_3_2_suki',
      },
    ],
  },
  {
    id: 'scene_3_2_suki',
    type: 'dialogue',
    background: 'spirit_realm',
    dialogue: [
      { speaker: 'kai', textKey: 'scene_3_2_line_6', expression: 'neutral', characterPosition: 'left' },
    ],
    choices: [
      {
        id: 'suki_embrace',
        textKey: 'scene_3_2_line_7_embrace',
        consequences: { flagsSet: ['suki_embraced_void'], statChanges: { suki_bond: 10 } },
        nextSceneId: 'scene_3_2_kai',
      },
      {
        id: 'suki_reject',
        textKey: 'scene_3_2_line_7_reject',
        consequences: { statChanges: { suki_bond: 5 } },
        nextSceneId: 'scene_3_2_kai',
      },
    ],
  },
  {
    id: 'scene_3_2_kai',
    type: 'dialogue',
    background: 'spirit_realm',
    dialogue: [
      { speaker: 'narrator', textKey: 'scene_3_2_line_8' },
    ],
    choices: [
      {
        id: 'kai_love',
        textKey: 'scene_3_2_choice_0',
        consequences: { flagsSet: ['kai_motivation_love'] },
        nextSceneId: 'scene_3_3',
      },
      {
        id: 'kai_duty',
        textKey: 'scene_3_2_choice_1',
        consequences: { flagsSet: ['kai_motivation_duty'] },
        nextSceneId: 'scene_3_3',
      },
      {
        id: 'kai_understanding',
        textKey: 'scene_3_2_choice_2',
        consequences: { flagsSet: ['kai_motivation_understanding'] },
        nextSceneId: 'scene_3_3',
      },
    ],
  },
  {
    id: 'scene_3_3',
    type: 'dialogue',
    background: 'void_citadel_exterior',
    ambienceOverride: 'void_dark',
    dialogue: [
      { speaker: 'narrator', textKey: 'scene_3_3_line_0' },
      { speaker: 'kai', textKey: 'scene_3_3_line_1', expression: 'determined', characterPosition: 'left' },
      { speaker: 'luna', textKey: 'scene_3_3_line_2', expression: 'determined', characterPosition: 'right' },
      { speaker: 'ryu', textKey: 'scene_3_3_line_3', expression: 'battle_stance', characterPosition: 'left' },
    ],
    nextSceneId: 'scene_3_3_infiltrate',
  },
  {
    id: 'scene_3_3_infiltrate',
    type: 'minigame',
    background: 'void_citadel_exterior',
    dialogue: [],
    minigame: {
      type: 'stealth_section',
      onSuccess: { flagsSet: ['citadel_infiltrated'] },
      onFail: {},
    },
    nextSceneId: 'scene_3_3_door',
  },
  {
    id: 'scene_3_3_door',
    type: 'puzzle',
    background: 'void_citadel_interior',
    ambienceOverride: 'void_dark',
    dialogue: [],
    puzzle: {
      type: 'void_code',
      maxHints: 3,
      hintCost: { wisdom: -2 },
      onSuccess: { statChanges: { wisdom: 8 } },
    },
    nextSceneId: 'scene_3_4',
  },
  {
    id: 'scene_3_4',
    type: 'combat',
    background: 'void_citadel_interior',
    ambienceOverride: 'boss_combat',
    dialogue: [
      { speaker: 'narrator', textKey: 'scene_3_4_line_0' },
      { speaker: 'malachar', textKey: 'scene_3_4_line_1', expression: 'neutral', characterPosition: 'right' },
      { speaker: 'kai', textKey: 'scene_3_4_line_2', expression: 'determined', characterPosition: 'left' },
      { speaker: 'malachar', textKey: 'scene_3_4_line_3', expression: 'neutral', characterPosition: 'right' },
    ],
    combat: {
      enemies: [
        {
          id: 'malachar_phase1',
          nameKey: 'enemy_malachar_1_name',
          hp: 400,
          maxHp: 400,
          attack: 25,
          defense: 15,
          speed: 7,
          attackPatterns: [
            { id: 'void_lance', damage: 25, type: 'normal', warningTurns: 0 },
            { id: 'void_storm', damage: 40, type: 'heavy', warningTurns: 1 },
            { id: 'void_cascade', damage: 30, type: 'all_party', warningTurns: 1 },
          ],
        },
      ],
      backgroundId: 'combat_bg_citadel',
      phases: [
        {
          triggerHpPercent: 60,
          dialogueKey: 'scene_3_4_phase2_line_0',
          specialEvent: 'luna_speaks',
        },
        {
          triggerHpPercent: 30,
          dialogueKey: 'scene_3_4_phase3_line_0',
          specialEvent: 'vex_betrayal',
        },
      ],
      easyModeAfterDefeats: 3,
      onVictory: {
        flagsSet: ['malachar_defeated'],
      },
      onDefeat: { retry: true },
    },
    nextSceneId: 'scene_3_5',
  },
  {
    id: 'scene_3_5',
    type: 'cinematic',
    background: 'celestial_ending',
    ambienceOverride: 'ending_peaceful',
    dialogue: [
      { speaker: 'narrator', textKey: 'scene_3_4_victory_line' },
    ],
    nextSceneId: 'scene_ending_check',
  },
  {
    id: 'scene_ending_check',
    type: 'cinematic',
    background: 'celestial_ending',
    dialogue: [],
    // No nextSceneId — SceneController auto-navigates via determineEnding()
  },
  {
    id: 'scene_ending_celestial_harmony',
    type: 'cinematic',
    background: 'celestial_ending',
    ambienceOverride: 'ending_peaceful',
    dialogue: [
      { speaker: 'narrator', textKey: 'ending_a_line_0' },
      { speaker: 'kai', textKey: 'ending_a_line_1', expression: 'determined', characterPosition: 'left' },
      { speaker: 'luna', textKey: 'ending_a_line_2', expression: 'sad', characterPosition: 'right' },
      { speaker: 'malachar', textKey: 'ending_a_line_3', expression: 'sad', characterPosition: 'right' },
      { speaker: 'narrator', textKey: 'ending_a_line_4' },
      { speaker: 'narrator', textKey: 'ending_a_line_5' },
      { speaker: 'narrator', textKey: 'ending_a_epilogue' },
    ],
    onEnter: { flagsSet: ['completed_ending_celestial_harmony'] },
  },
  {
    id: 'scene_ending_blade_of_justice',
    type: 'cinematic',
    background: 'battle_ending',
    ambienceOverride: 'ending_peaceful',
    dialogue: [
      { speaker: 'narrator', textKey: 'ending_b_line_0' },
      { speaker: 'ryu', textKey: 'ending_b_line_1', expression: 'determined', characterPosition: 'right' },
      { speaker: 'narrator', textKey: 'ending_b_line_2' },
      { speaker: 'narrator', textKey: 'ending_b_line_3' },
      { speaker: 'kai', textKey: 'ending_b_line_4', expression: 'neutral', characterPosition: 'left' },
      { speaker: 'narrator', textKey: 'ending_b_epilogue' },
    ],
    onEnter: { flagsSet: ['completed_ending_blade_of_justice'] },
  },
  {
    id: 'scene_ending_sacrifice',
    type: 'cinematic',
    background: 'sacrifice_ending',
    ambienceOverride: 'ending_peaceful',
    dialogue: [
      { speaker: 'narrator', textKey: 'ending_c_line_0' },
      { speaker: 'luna', textKey: 'ending_c_line_1', expression: 'sad', characterPosition: 'right' },
      { speaker: 'kai', textKey: 'ending_c_line_2', expression: 'determined', characterPosition: 'left' },
      { speaker: 'narrator', textKey: 'ending_c_line_3' },
      { speaker: 'narrator', textKey: 'ending_c_line_4' },
      { speaker: 'narrator', textKey: 'ending_c_epilogue' },
    ],
    onEnter: { flagsSet: ['completed_ending_sacrifice'] },
  },
];
