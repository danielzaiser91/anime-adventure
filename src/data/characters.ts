import type { CharacterId, Skill } from '../types/game.types';

export const CHARACTER_SKILLS: Record<CharacterId, Skill[]> = {
  kai: [
    { id: 'celestial_strike', nameKey: 'ui.combat.skill', spCost: 15, damage: 2 },
    { id: 'void_sense', nameKey: 'ui.combat.skill', spCost: 10, effect: 'reveal_weakness' },
  ],
  luna: [
    { id: 'star_burst', nameKey: 'ui.combat.skill', spCost: 20, damage: 1, effect: 'all_damage' },
    { id: 'void_shield', nameKey: 'ui.combat.skill', spCost: 15, effect: 'shield' },
  ],
  ryu: [
    { id: 'iron_wall', nameKey: 'ui.combat.skill', spCost: 15, effect: 'shield' },
    { id: 'berserker', nameKey: 'ui.combat.skill', spCost: 20, damage: 1, effect: 'quick_attacks' },
  ],
  suki: [
    { id: 'petal_heal', nameKey: 'ui.combat.skill', spCost: 15, effect: 'heal_lowest' },
    { id: 'natures_wrath', nameKey: 'ui.combat.skill', spCost: 18, effect: 'poison' },
  ],
  malachar: [],
  vex: [],
  narrator: [],
};

export const CHARACTER_THEME_COLORS: Record<CharacterId, string> = {
  kai: '#4169e1',
  luna: '#7b2d8b',
  ryu: '#cc3300',
  suki: '#00a36c',
  malachar: '#0d0618',
  vex: '#cc0000',
  narrator: '#ffb7c5',
};
