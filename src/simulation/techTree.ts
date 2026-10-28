/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TechCategory = 'combat' | 'agriculture' | 'knowledge' | 'magic' | 'naval_logistics';

export interface TechItem {
  id: string;
  category: TechCategory;
  tier: 1 | 2 | 3 | 4 | 5;
  name: string;
  description: string;
  baseCost: number;
  bonusSummary: string;
  combatMod?: number;
  defenseMod?: number;
  growthMod?: number;
  wealthMod?: number;
  magicMod?: number;
  navalMod?: number;
}

export interface TechCategoryMeta {
  id: TechCategory;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export const TECH_CATEGORIES: Record<TechCategory, TechCategoryMeta> = {
  combat: {
    id: 'combat',
    name: 'Martial & Warfare',
    icon: '⚔️',
    description: 'Weapons, armor, tactics, and siege craft.',
    color: '#ef4444',
  },
  agriculture: {
    id: 'agriculture',
    name: 'Agriculture & Foodways',
    icon: '🌾',
    description: 'Irrigation, harvest storage, crop rotation, and demographic boom.',
    color: '#22c55e',
  },
  knowledge: {
    id: 'knowledge',
    name: 'Philosophy & Knowledge',
    icon: '📜',
    description: 'Writing, scriptoria, printing, and grand academies.',
    color: '#3b82f6',
  },
  magic: {
    id: 'magic',
    name: 'Arcane & Sacred Arts',
    icon: '🔮',
    description: 'Shamanism, elemental runecraft, leyline tapping, and ascension.',
    color: '#a855f7',
  },
  naval_logistics: {
    id: 'naval_logistics',
    name: 'Naval & Logistics',
    icon: '⛵',
    description: 'Maritime vessels, roads, celestial navigation, and trade arteries.',
    color: '#06b6d4',
  },
};

export const DEFAULT_TECH_TREE: Record<TechCategory, TechItem[]> = {
  combat: [
    {
      id: 'combat_t1',
      category: 'combat',
      tier: 1,
      name: 'Stone Weapons & Wooden Clubs',
      description: 'Primitive obsidian and flint blades lashed to hickory hafts.',
      baseCost: 0,
      bonusSummary: 'Base mortal defense',
      combatMod: 0,
      defenseMod: 0,
    },
    {
      id: 'combat_t2',
      category: 'combat',
      tier: 2,
      name: 'Bronze Armaments & Tower Shields',
      description: 'Cast bronze spearheads, cuirasses, and disciplined shield walls.',
      baseCost: 4,
      bonusSummary: '+1 Army Strength & Siege Defense',
      combatMod: 1,
      defenseMod: 1,
    },
    {
      id: 'combat_t3',
      category: 'combat',
      tier: 3,
      name: 'Iron Forging & Heavy Cavalry',
      description: 'Smelted iron broadswords, chainmail coats, and war barded mounts.',
      baseCost: 6,
      bonusSummary: '+2 Army Strength & Field Charge',
      combatMod: 2,
      defenseMod: 1,
    },
    {
      id: 'combat_t4',
      category: 'combat',
      tier: 4,
      name: 'Tempered Steel & Siege Engines',
      description: 'Crucible steel plate, heavy counterweight trebuchets, and crossbows.',
      baseCost: 8,
      bonusSummary: '+3 Army Strength & Wall Sacking',
      combatMod: 3,
      defenseMod: 2,
    },
    {
      id: 'combat_t5',
      category: 'combat',
      tier: 5,
      name: 'Mithril Warblades & Adamantine Armor',
      description: 'Mythic gossamer metals impervious to mundane strikes and spells.',
      baseCost: 10,
      bonusSummary: '+5 Army Strength & Legendary Bastions',
      combatMod: 5,
      defenseMod: 4,
    },
  ],
  agriculture: [
    {
      id: 'agri_t1',
      category: 'agriculture',
      tier: 1,
      name: 'Foraging & Wild Grain Harvesters',
      description: 'Seasonal gathering of native tubers, berries, and riverside grasses.',
      baseCost: 0,
      bonusSummary: 'Subsistence population',
      growthMod: 0,
    },
    {
      id: 'agri_t2',
      category: 'agriculture',
      tier: 2,
      name: 'Terraced Canals & Silos',
      description: 'Stone-lined hillside terraces and dry clay granaries that survive winter.',
      baseCost: 4,
      bonusSummary: '+10% Demographic Growth & Drought Buffer',
      growthMod: 0.1,
    },
    {
      id: 'agri_t3',
      category: 'agriculture',
      tier: 3,
      name: 'Crop Rotation & Heavy Iron Plows',
      description: 'Three-field nitrogen restoration and draft oxen tilling deep clay soil.',
      baseCost: 6,
      bonusSummary: '+20% Demographic Growth & Town Flourishing',
      growthMod: 0.2,
    },
    {
      id: 'agri_t4',
      category: 'agriculture',
      tier: 4,
      name: 'Selective Breeding & Windmills',
      description: 'Prized seed cultivars, high-yield grain mills, and domestic herds.',
      baseCost: 8,
      bonusSummary: '+30% Demographic Growth & Rich Rations',
      growthMod: 0.3,
    },
    {
      id: 'agri_t5',
      category: 'agriculture',
      tier: 5,
      name: 'Enchanted Aqueducts & Cornucopias',
      description: 'Arcane subterranean channels delivering perpetual spring water and eternal bounty.',
      baseCost: 10,
      bonusSummary: '+50% Demographic Growth & Famine Immunity',
      growthMod: 0.5,
    },
  ],
  knowledge: [
    {
      id: 'know_t1',
      category: 'knowledge',
      tier: 1,
      name: 'Oral Traditions & Elder Chants',
      description: 'Genealogies, constellations, and hunting routes passed by fireside songs.',
      baseCost: 0,
      bonusSummary: 'Basic cultural memory',
      wealthMod: 0,
    },
    {
      id: 'know_t2',
      category: 'knowledge',
      tier: 2,
      name: 'Clay Tablets & Pictographic Glyphs',
      description: 'Recorded grain tallies, trade treaties, and architectural blueprints.',
      baseCost: 4,
      bonusSummary: '+5 City Wealth per Round',
      wealthMod: 5,
    },
    {
      id: 'know_t3',
      category: 'knowledge',
      tier: 3,
      name: 'Papyrus Scrolls & Monastic Scriptoria',
      description: 'Copied chronicles, herbal pharmacopoeias, and legal codices.',
      baseCost: 6,
      bonusSummary: '+15 City Wealth & Tech Cost Reduction (-1)',
      wealthMod: 15,
    },
    {
      id: 'know_t4',
      category: 'knowledge',
      tier: 4,
      name: 'Movable Type Printing & Academies',
      description: 'Universal literacy presses, botanical treatises, and municipal colleges.',
      baseCost: 8,
      bonusSummary: '+30 City Wealth & Rapid Innovation',
      wealthMod: 30,
    },
    {
      id: 'know_t5',
      category: 'knowledge',
      tier: 5,
      name: 'Grand Scholomance & Clockwork Orrery',
      description: 'Cosmic libraries charting time, stellar mechanics, and atomic elements.',
      baseCost: 10,
      bonusSummary: '+60 City Wealth & Enlightenment Wonder',
      wealthMod: 60,
    },
  ],
  magic: [
    {
      id: 'mag_t1',
      category: 'magic',
      tier: 1,
      name: 'Animist Totems & Spirit Whispers',
      description: 'Honoring natural beasts, river dryads, and ancestral shades.',
      baseCost: 0,
      bonusSummary: 'Primal spiritual reverence',
      magicMod: 0,
    },
    {
      id: 'mag_t2',
      category: 'magic',
      tier: 2,
      name: 'Elemental Runecraft & Warding Stones',
      description: 'Carving runes into hearthstones to ward against beasts and blight.',
      baseCost: 4,
      bonusSummary: '+1 City Defense & Resistance to Catastrophes',
      magicMod: 1,
      defenseMod: 1,
    },
    {
      id: 'mag_t3',
      category: 'magic',
      tier: 3,
      name: 'Leyline Tapping & Arcanist Spires',
      description: 'Channeling telluric energy currents to power city lanterns and sacred springs.',
      baseCost: 6,
      bonusSummary: '+2 Mana Harvest & Spellcraft Advantage',
      magicMod: 2,
    },
    {
      id: 'mag_t4',
      category: 'magic',
      tier: 4,
      name: 'High Wizardry & Dimensional Abjurations',
      description: 'Teleportation circles, scrying mirrors, and elemental summoning.',
      baseCost: 8,
      bonusSummary: '+3 Army Spell Bonus & Bastion Shields',
      magicMod: 3,
      combatMod: 2,
    },
    {
      id: 'mag_t5',
      category: 'magic',
      tier: 5,
      name: 'Divine Ascension & Astral Conduits',
      description: 'Mortals touching the mantle of godhood, walking between planes.',
      baseCost: 10,
      bonusSummary: 'Immunity to hostile divine curses & +4 Army Strength',
      magicMod: 5,
      combatMod: 4,
    },
  ],
  naval_logistics: [
    {
      id: 'naval_t1',
      category: 'naval_logistics',
      tier: 1,
      name: 'Dugout Canoes & Coastal Rafts',
      description: 'Hollowed logs for crossing gentle rivers and calm inland lagoons.',
      baseCost: 0,
      bonusSummary: 'Shallow water transit',
      navalMod: 0,
    },
    {
      id: 'naval_t2',
      category: 'naval_logistics',
      tier: 2,
      name: 'Oared Biremes & Cobblestone Highways',
      description: 'Sturdy timber galleys and paved military highways linking settlements.',
      baseCost: 4,
      bonusSummary: 'Cross ocean shallows & +1 Army March speed',
      navalMod: 1,
    },
    {
      id: 'naval_t3',
      category: 'naval_logistics',
      tier: 3,
      name: 'Caravels & Magnetic Compass Navigation',
      description: 'Deep keel vessels capable of crossing open oceans through storm and night.',
      baseCost: 6,
      bonusSummary: 'Deep ocean navigation & +50% Trade Route Wealth',
      navalMod: 2,
    },
    {
      id: 'naval_t4',
      category: 'naval_logistics',
      tier: 4,
      name: 'Grand Galleons & Intercontinental Hubs',
      description: 'Three-masted oceanic juggernauts transporting whole legions and goods.',
      baseCost: 8,
      bonusSummary: '+100% Trade Wealth & Global Expeditionary Armies',
      navalMod: 3,
    },
    {
      id: 'naval_t5',
      category: 'naval_logistics',
      tier: 5,
      name: 'Astral Skyships & Dimensional Portals',
      description: 'Levitating vessels gliding on atmospheric currents across land and sea.',
      baseCost: 10,
      bonusSummary: 'Travel anywhere in 1 turn & Flight over mountain ranges',
      navalMod: 5,
    },
  ],
};

/**
 * Calculate the power cost to research a tech item.
 * If the civilization has the immediate lower tier: normal baseCost.
 * If the civilization skips tiers (e.g. going from tier 1 directly to tier 3, skipping tier 2): 1.5x cost!
 */
export function calculateTechCost(
  tech: TechItem,
  existingTechNames: string[],
  techTree: Record<TechCategory, TechItem[]> = DEFAULT_TECH_TREE
): { cost: number; isTierSkip: boolean; skippedTierCount: number } {
  if (tech.tier === 1) {
    return { cost: 0, isTierSkip: false, skippedTierCount: 0 };
  }

  const categoryTechs = techTree[tech.category] || [];
  let highestOwnedTier = 1;

  for (const t of categoryTechs) {
    if (existingTechNames.includes(t.name) && t.tier > highestOwnedTier) {
      highestOwnedTier = t.tier;
    }
  }

  const tierGap = tech.tier - highestOwnedTier;

  if (tierGap <= 1) {
    // Normal linear advancement
    return { cost: tech.baseCost, isTierSkip: false, skippedTierCount: 0 };
  }

  // Tier skip: 1.5x cost for skipping tiers
  const skippedTiers = tierGap - 1;
  const skipCost = Math.ceil(tech.baseCost * 1.5);
  return { cost: skipCost, isTierSkip: true, skippedTierCount: skippedTiers };
}
