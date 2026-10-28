/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoatOfArms, Civilization, Race, ShieldShape, HeraldicDivision, HeraldicCharge } from '../types/game';

interface HeraldicArchetype {
  charges: HeraldicCharge[];
  divisions: HeraldicDivision[];
  shapes: ShieldShape[];
  primaryColors: string[];
  secondaryColors: string[];
  metalColors: string[];
  mottoes: string[];
}

const ARCHETYPES: Record<string, HeraldicArchetype> = {
  elven: {
    charges: ['sacred_tree', 'sunburst', 'griffin', 'stag'],
    divisions: ['bend', 'quarterly', 'pale', 'solid'],
    shapes: ['classic', 'heater', 'kite'],
    primaryColors: ['#047857', '#065f46', '#0f766e'], // Emerald & Teal
    secondaryColors: ['#0284c7', '#1e293b', '#0369a1'], // Celest & Deep Azure
    metalColors: ['#fbbf24', '#f1f5f9'], // Gold or Silver
    mottoes: [
      'Semper Virens (Ever Flourishing)',
      'Lumen Silvarum (Light of the Canopies)',
      'Stellis Custodibus (Guarded by Stars)',
      'Aeterna Viriditas (Eternal Verdancy)',
    ],
  },
  dwarven: {
    charges: ['anvil', 'twin_axes', 'tower', 'crown'],
    divisions: ['fess', 'chevron', 'solid', 'quarterly'],
    shapes: ['heater', 'notched', 'gothic'],
    primaryColors: ['#991b1b', '#7f1d1d', '#334155'], // Deep Crimson & Granite
    secondaryColors: ['#78350f', '#0f172a', '#475569'], // Bronze & Obsidian
    metalColors: ['#f59e0b', '#fbbf24', '#e2e8f0'], // Burnished Gold or Iron Silver
    mottoes: [
      'Ferro et Saxo (By Iron and Granite)',
      'Radix Profunda (Deep Roots, Unbroken Stone)',
      'Sub Monte Victoria (Triumph Beneath the Mountain)',
      'Malleo et Ignis (With Hammer and Hearthfire)',
    ],
  },
  human: {
    charges: ['lion', 'eagle', 'crown', 'chalice'],
    divisions: ['quarterly', 'pale', 'fess', 'chevron'],
    shapes: ['heater', 'classic', 'gothic'],
    primaryColors: ['#1d4ed8', '#1e40af', '#b91c1c'], // Royal Azure & Crimson
    secondaryColors: ['#4338ca', '#0f172a', '#0369a1'], // Indigo & Midnight
    metalColors: ['#fbbf24', '#f1f5f9'], // Imperial Gold or Polished Silver
    mottoes: [
      'Ex Nihilo Victoria (From Nothing, Dominion)',
      'Virtus et Imperium (Valor and Empire)',
      'Astra Regit (Sovereigns of Destiny)',
      'Concordia Res Parvae Crescunt (Through Harmony Great Realms Rise)',
    ],
  },
  warlike: {
    charges: ['dragon', 'flame', 'wolf', 'serpent'],
    divisions: ['saltire', 'chevron', 'pale', 'solid'],
    shapes: ['notched', 'gothic', 'round'],
    primaryColors: ['#991b1b', '#7f1d1d', '#b45309'], // Blood Red & Rust
    secondaryColors: ['#0f172a', '#18181b', '#262626'], // Charred Black & Soot
    metalColors: ['#f59e0b', '#e2e8f0'], // Brass or Cold Steel
    mottoes: [
      'Sanguis et Ignis (Blood and Fire)',
      'Domini Belli (Masters of Conquest)',
      'Fera Virtus (Untamed Might)',
      'Spolia Victoribus (To the Strong Belong the Spoils)',
    ],
  },
  shadow: {
    charges: ['serpent', 'crescent', 'flame', 'dragon'],
    divisions: ['saltire', 'quarterly', 'solid', 'bend'],
    shapes: ['gothic', 'notched', 'round'],
    primaryColors: ['#581c87', '#4c1d95', '#0f172a'], // Deep Amethyst & Midnight
    secondaryColors: ['#111827', '#064e3b', '#831843'], // Abyssal Slate & Venom
    metalColors: ['#e2e8f0', '#fbbf24'], // Spectral Silver or Pale Gold
    mottoes: [
      'Ex Tenebris Lux (From Shadows We Rise)',
      'Sub Umbra Vigile (Ever Watchful in the Night)',
      'Abyssi Dominus (Lords of the Rift)',
      'Silentium et Potestas (Silence and Supreme Power)',
    ],
  },
  nomadic: {
    charges: ['stag', 'sunburst', 'sacred_tree', 'chalice'],
    divisions: ['bend', 'fess', 'solid', 'pale'],
    shapes: ['round', 'classic', 'heater'],
    primaryColors: ['#b45309', '#0284c7', '#047857'], // Amber, Sky Blue, Forest
    secondaryColors: ['#78350f', '#0f172a', '#065f46'],
    metalColors: ['#fbbf24', '#f1f5f9'],
    mottoes: [
      'Venti et Tides (Heeding the Winds and Tides)',
      'Terra Alma (The Living Soil Sustains)',
      'Libertas Sine Finibus (Freedom Without Borders)',
      'Semper Fidelis (Loyal to the Pack)',
    ],
  },
};

/**
 * Deterministic hash function for consistent procedural generation from strings
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Pick an element from an array deterministically using a seed hash
 */
function pickWithSeed<T>(arr: T[], seed: number, salt = 0): T {
  const index = Math.abs(seed + salt * 31) % arr.length;
  return arr[index];
}

/**
 * Generate a distinctive heraldic Coat of Arms for a civilization
 */
export function generateCoatOfArms(civName: string, race?: Race, deityColor?: string): CoatOfArms {
  const seed = hashString(civName + (race?.name || '') + (race?.id || ''));
  const rName = (race?.name || '').toLowerCase();
  const subType = (race?.subraceType || '').toLowerCase();

  let archetypeKey = 'human';
  if (rName.includes('elf') || rName.includes('elven') || subType.includes('wood') || subType.includes('forest')) {
    archetypeKey = 'elven';
  } else if (rName.includes('dwarf') || rName.includes('dwarven') || subType.includes('mountain') || subType.includes('stone')) {
    archetypeKey = 'dwarven';
  } else if (rName.includes('orc') || rName.includes('goblin') || subType.includes('war') || subType.includes('clan')) {
    archetypeKey = 'warlike';
  } else if (rName.includes('shadow') || rName.includes('undead') || rName.includes('aberration') || race?.category === 'aberration') {
    archetypeKey = 'shadow';
  } else if (rName.includes('halfling') || rName.includes('nomad') || subType.includes('desert')) {
    archetypeKey = 'nomadic';
  }

  const arch = ARCHETYPES[archetypeKey] || ARCHETYPES.human;

  const shieldShape = pickWithSeed(arch.shapes, seed, 1);
  const division = pickWithSeed(arch.divisions, seed, 2);
  const primaryColor = deityColor || race?.color || pickWithSeed(arch.primaryColors, seed, 3);
  const secondaryColor = pickWithSeed(arch.secondaryColors, seed, 4);
  const metalColor = pickWithSeed(arch.metalColors, seed, 5);
  const charge = pickWithSeed(arch.charges, seed, 6);
  const motto = pickWithSeed(arch.mottoes, seed, 7);

  // Generate blazon heraldic description
  const chargeNames: Record<HeraldicCharge, string> = {
    dragon: 'a dragon rampant',
    lion: 'a crowned lion guardant',
    eagle: 'an imperial eagle displayed',
    sacred_tree: 'a sacred tree eradicated',
    crown: 'a sovereign celestial crown',
    anvil: 'an anvil surmounted by crossed warhammers',
    sunburst: 'a radiant solar sunburst',
    twin_axes: 'twin battleaxes saltirewise',
    serpent: 'a serpent coiled regardant',
    chalice: 'a consecrated golden chalice',
    tower: 'a triple-turreted citadel tower',
    griffin: 'a golden griffin rampant',
    wolf: 'a dire wolf statant',
    stag: 'a noble stag trippant',
    flame: 'a primordial sacred flame',
    crescent: 'an increscent silver moon',
  };

  const divisionNames: Record<HeraldicDivision, string> = {
    solid: 'Field undivided',
    pale: 'Party per pale',
    fess: 'Party per fess',
    bend: 'Party per bend',
    quarterly: 'Quarterly',
    chevron: 'Per chevron',
    saltire: 'Per saltire',
  };

  const metalName = metalColor.includes('f5') || metalColor.includes('fb') ? 'Or (Gold)' : 'Argent (Silver)';
  const blazon = `${divisionNames[division]}, bearing ${chargeNames[charge]} trimmed in ${metalName}.`;

  return {
    shieldShape,
    division,
    primaryColor,
    secondaryColor,
    metalColor,
    charge,
    motto,
    blazon,
  };
}

/**
 * Returns the existing coat of arms, or lazily generates and attaches one if missing
 */
export function ensureCivCoatOfArms(civ: Civilization, race?: Race): CoatOfArms {
  if (civ.coatOfArms) {
    return civ.coatOfArms;
  }
  return generateCoatOfArms(civ.name, race, civ.color);
}
