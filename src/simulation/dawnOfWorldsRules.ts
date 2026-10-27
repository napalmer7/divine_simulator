/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AgeId } from '../types/game';

export type ActionPowerType =
  | 'shape_land'
  | 'shape_climate'
  | 'create_race'
  | 'create_subrace'
  | 'command_race'
  | 'command_city'
  | 'advance_civ'
  | 'advance_city'
  | 'purify_civ'
  | 'corrupt_civ'
  | 'purify_city'
  | 'corrupt_city'
  | 'event'
  | 'create_order'
  | 'command_order'
  | 'create_avatar'
  | 'command_avatar'
  | 'catastrophe'
  | 'custom_miracle';

/**
 * Dawn of Worlds exact costs table (Page 7 of official rulebook)
 */
export const DAWN_OF_WORLDS_COSTS: Record<ActionPowerType, Record<AgeId, number>> = {
  shape_land: {
    '1st_age_land': 3,
    '2nd_age_races': 5,
    '3rd_age_relations': 8,
  },
  shape_climate: {
    '1st_age_land': 2,
    '2nd_age_races': 4,
    '3rd_age_relations': 6,
  },
  create_race: {
    '1st_age_land': 22,
    '2nd_age_races': 6,
    '3rd_age_relations': 15,
  },
  create_subrace: {
    '1st_age_land': 12,
    '2nd_age_races': 4,
    '3rd_age_relations': 10,
  },
  command_race: {
    '1st_age_land': 8,
    '2nd_age_races': 4,
    '3rd_age_relations': 3,
  },
  command_city: {
    '1st_age_land': 6,
    '2nd_age_races': 4,
    '3rd_age_relations': 2,
  },
  advance_civ: {
    '1st_age_land': 10,
    '2nd_age_races': 5,
    '3rd_age_relations': 6,
  },
  advance_city: {
    '1st_age_land': 8,
    '2nd_age_races': 4,
    '3rd_age_relations': 5,
  },
  purify_civ: {
    '1st_age_land': 5,
    '2nd_age_races': 3,
    '3rd_age_relations': 4,
  },
  corrupt_civ: {
    '1st_age_land': 4,
    '2nd_age_races': 3,
    '3rd_age_relations': 3,
  },
  purify_city: {
    '1st_age_land': 4,
    '2nd_age_races': 3,
    '3rd_age_relations': 3,
  },
  corrupt_city: {
    '1st_age_land': 3,
    '2nd_age_races': 2,
    '3rd_age_relations': 2,
  },
  event: {
    '1st_age_land': 10,
    '2nd_age_races': 7,
    '3rd_age_relations': 9,
  },
  create_order: {
    '1st_age_land': 8,
    '2nd_age_races': 6,
    '3rd_age_relations': 4,
  },
  command_order: {
    '1st_age_land': 4,
    '2nd_age_races': 3,
    '3rd_age_relations': 2,
  },
  create_avatar: {
    '1st_age_land': 10,
    '2nd_age_races': 7,
    '3rd_age_relations': 8,
  },
  command_avatar: {
    '1st_age_land': 2,
    '2nd_age_races': 1,
    '3rd_age_relations': 1,
  },
  catastrophe: {
    '1st_age_land': 10,
    '2nd_age_races': 10,
    '3rd_age_relations': 10,
  },
  custom_miracle: {
    '1st_age_land': 5,
    '2nd_age_races': 5,
    '3rd_age_relations': 5,
  },
};

export const ACTION_DESCRIPTIONS: Record<
  ActionPowerType,
  { label: string; desc: string; category: string }
> = {
  shape_land: {
    label: 'Shape Land',
    desc: 'Raise continents, erect mountain spires, sculpt rivers, islands, or valleys.',
    category: 'Geography',
  },
  shape_climate: {
    label: 'Shape Climate',
    desc: 'Alter atmospheric currents, bringing tropical warmth, freezing blizzards, or temperate rains.',
    category: 'Geography',
  },
  create_race: {
    label: 'Create Race',
    desc: 'Breath life into a sentient species and establish their primeval cradle.',
    category: 'Life',
  },
  create_subrace: {
    label: 'Create Subrace',
    desc: 'Splinter an existing mortal race into an adapted or culturally distinct offshoot.',
    category: 'Life',
  },
  command_race: {
    label: 'Command Race',
    desc: 'Direct a mortal species to found a new city, declare war, or forge grand alliances.',
    category: 'Civilization',
  },
  command_city: {
    label: 'Command City',
    desc: 'Command a settlement to raise an army, construct great walls, or erect a wonder.',
    category: 'Civilization',
  },
  advance_civ: {
    label: 'Advance Civilization',
    desc: 'Gift an empire profound knowledge of smithing, arcana, navigation, or architecture.',
    category: 'Advancement',
  },
  advance_city: {
    label: 'Advance City',
    desc: 'Bestow an individual metropolis with unmatched mastery in an art or science.',
    category: 'Advancement',
  },
  purify_civ: {
    label: 'Purify Civ (+1 Align)',
    desc: 'Guide a civilization toward divine virtue, justice, and celestial light.',
    category: 'Alignment',
  },
  corrupt_civ: {
    label: 'Corrupt Civ (-1 Align)',
    desc: 'Lure an empire toward shadow, ruthless ambition, and demonic taint.',
    category: 'Alignment',
  },
  purify_city: {
    label: 'Purify City (+1 Align)',
    desc: 'Cleanse corruption and instill pious devotion in a single city.',
    category: 'Alignment',
  },
  corrupt_city: {
    label: 'Corrupt City (-1 Align)',
    desc: 'Sow decadence, greed, and dark sorcery within a metropolis.',
    category: 'Alignment',
  },
  event: {
    label: 'Divine Event',
    desc: 'Unleash sudden winds of fortune: gold rush, miraculous harvest, or arcane surge.',
    category: 'Fortune',
  },
  create_order: {
    label: 'Create Order',
    desc: 'Found a prestigious chivalric brotherhood, arcane conclave, or thieves guild.',
    category: 'Organizations',
  },
  command_order: {
    label: 'Command Order',
    desc: 'Dispatch an order to embark on crusades, unearth secrets, or spearhead trade.',
    category: 'Organizations',
  },
  create_avatar: {
    label: 'Create Avatar',
    desc: 'Manifest your divine presence in mortal form: an ancient dragon, high priest, or demigod.',
    category: 'Avatars',
  },
  command_avatar: {
    label: 'Command Avatar',
    desc: 'Direct your avatar to lead legions, purge abominations, or found holy sanctuaries.',
    category: 'Avatars',
  },
  catastrophe: {
    label: 'Catastrophe',
    desc: 'Unleash apocalyptic wrath: meteor strikes, volcanic eruptions, or devastating plagues.',
    category: 'Wrath',
  },
  custom_miracle: {
    label: 'Weave Custom Miracle',
    desc: 'Synthesize custom divine miracles altering terrain, biomes, and mortal destinies.',
    category: 'Miracles',
  },
};

/**
 * Rolls two 6-sided dice (2d6)
 */
export function roll2d6(): [number, number] {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  return [d1, d2];
}

/**
 * Calculate power gained at the start of a round:
 * 2d6 + Thrift Bonus (up to +3 if previously ending turn with <= 5 points)
 */
export function calculateRoundPower(lastTurnPowerEnding: number, currentBonus: number): {
  roll: [number, number];
  rollTotal: number;
  newThriftBonus: number;
  totalGained: number;
} {
  const roll = roll2d6();
  const rollTotal = roll[0] + roll[1];

  let nextBonus = currentBonus;
  if (lastTurnPowerEnding <= 5) {
    nextBonus = Math.min(3, currentBonus + 1);
  } else {
    nextBonus = 0;
  }

  const totalGained = rollTotal + currentBonus;
  return {
    roll,
    rollTotal,
    newThriftBonus: nextBonus,
    totalGained,
  };
}

/**
 * Available technology advances for civilizations & cities
 */
export const AVAILABLE_TECHNOLOGIES = [
  { name: 'Bronze & Iron Smithing', martial: true, desc: '+1 battle combat bonus to melee infantry' },
  { name: 'High Agriculture & Granaries', martial: false, desc: 'Increases city growth rate by 40%' },
  { name: 'Fortress Masonry & Ramparts', martial: true, desc: 'Enhances city defense walls by +2' },
  { name: 'Deep Shaft Mining', martial: false, desc: 'Unlocks rare mineral veins & wealth' },
  { name: 'Ocean Caravels & Navigation', martial: false, desc: 'Establishes overseas sea trade routes' },
  { name: 'War Magic & Pyromancy', martial: true, desc: '+1 battle combat bonus with arcane artillery' },
  { name: 'Equestrian Warfare & Chariots', martial: true, desc: '+1 battle bonus on flat open terrain' },
  { name: 'Philosophical Academies', martial: false, desc: 'Accelerates technology discovery & civ harmony' },
  { name: 'Aqueducts & Hydrology', martial: false, desc: 'Prevents drought plagues & expands population capacity' },
  { name: 'Runecraft & Ward Enchants', martial: true, desc: '+1 battle defense bonus against catastrophes' },
];
