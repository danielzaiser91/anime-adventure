import type { Item } from '../types/game.types';

export const ITEMS: Record<string, Item> = {
  health_potion: {
    id: 'health_potion',
    nameKey: 'item_health_potion_name',
    descriptionKey: 'item_health_potion_desc',
    usableInCombat: true,
    effect: { statChanges: { spirit: 30 } },
  },
  spirit_potion: {
    id: 'spirit_potion',
    nameKey: 'item_spirit_potion_name',
    descriptionKey: 'item_spirit_potion_desc',
    usableInCombat: true,
    effect: { statChanges: { spirit: 20 } },
  },
  fox_spirit_charm: {
    id: 'fox_spirit_charm',
    nameKey: 'item_fox_charm_name',
    descriptionKey: 'item_fox_charm_desc',
    usableInCombat: false,
    effect: { flagsSet: ['fox_charm_used'] },
  },
  relic_chest: {
    id: 'relic_chest',
    nameKey: 'item_relic_chest_name',
    descriptionKey: 'item_relic_chest_desc',
    usableInCombat: false,
    effect: { statChanges: { wisdom: 5 } },
  },
  void_crystal: {
    id: 'void_crystal',
    nameKey: 'item_void_crystal_name',
    descriptionKey: 'item_void_crystal_desc',
    usableInCombat: false,
    effect: {},
  },
  lore_scroll: {
    id: 'lore_scroll',
    nameKey: 'item_lore_scroll_name',
    descriptionKey: 'item_lore_scroll_desc',
    usableInCombat: false,
    effect: { statChanges: { wisdom: 2 } },
  },
};
