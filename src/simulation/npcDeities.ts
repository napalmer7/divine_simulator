/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AgeId, Army, Avatar, City, Civilization, Deity, HistoryLogEntry, OrderItem, Race, WorldCell } from '../types/game';
import { AVAILABLE_TECHNOLOGIES, DAWN_OF_WORLDS_COSTS } from './dawnOfWorldsRules';
import { PRESET_RACES } from './races';
import { applyTerrainModification, getAdjacentCellIndices } from './worldGrid';
import { generateCoatOfArms } from './heraldry';

export const CANDIDATE_NPC_DEITIES: Deity[] = [
  {
    id: 'deity_vulcanus',
    name: 'Vulcanus',
    title: 'The Earthforger',
    domain: 'Mountains & Metallurgy',
    symbol: '⚒',
    isPlayer: false,
    power: 12,
    thriftBonus: 0,
    lastRoll: [3, 5],
    personality: {
      aggression: 0.4,
      harmony: 0.6,
      expansion: 0.4,
      curiosity: 0.7,
    },
    color: '#f59e0b', // Amber / Gold
    avatarId: null,
    relationships: {
      deity_player: 15,
      deity_sylvana: 10,
      deity_morvath: -35,
      deity_aurelia: 20,
      deity_thalassor: -15,
      deity_xyrakis: -10,
    },
    myth: 'Awakened from the white-hot primordial core of Meglin, Vulcanus strikes the cosmic anvil to raise impassable mountain fortresses and enrich the earth with veins of gold, silver, and runic ore.',
    historicalGoals: [
      'Uplift impenetrable alpine cordilleras across the continent',
      'Endow dwarven and artisan mortals with invincible metallurgical secrets',
      'Chisel wondrous subterranean vaults that withstand celestial cataclysms',
    ],
    ethos: 'Unyielding Endurance, Master Stonework, and Sacred Smithcraft',
  },
  {
    id: 'deity_sylvana',
    name: 'Sylvana',
    title: 'The Wild Mother',
    domain: 'Canopy & Primal Life',
    symbol: '❧',
    isPlayer: false,
    power: 12,
    thriftBonus: 0,
    lastRoll: [5, 4],
    personality: {
      aggression: 0.2,
      harmony: 0.9,
      expansion: 0.5,
      curiosity: 0.6,
    },
    color: '#10b981', // Emerald
    avatarId: null,
    relationships: {
      deity_player: 25,
      deity_vulcanus: 10,
      deity_morvath: -55,
      deity_aurelia: 35,
      deity_thalassor: 15,
      deity_xyrakis: -40,
    },
    myth: 'Born of the first dewdrop that kissed the primordial soil, Sylvana breathes transpiration rainfall across the continents, weaving deep emerald old-growth canopies and guarding holy groves against defilement.',
    historicalGoals: [
      'Cover all fertile lands in ancient, whispering primeval woodlands',
      'Foster peaceful, long-lived mortal races attuned to arcane nature',
      'Cleanse corrupting blights, volcanic scorch marks, and desecrated soils',
    ],
    ethos: 'Ecological Harmony, Sacred Verdancy, and Preservation of Life',
  },
  {
    id: 'deity_morvath',
    name: 'Morvath',
    title: 'The Shadow Arbiter',
    domain: 'Discord & Ambition',
    symbol: '☠',
    isPlayer: false,
    power: 12,
    thriftBonus: 0,
    lastRoll: [6, 3],
    personality: {
      aggression: 0.85,
      harmony: 0.1,
      expansion: 0.8,
      curiosity: 0.5,
    },
    color: '#ef4444', // Crimson Red
    avatarId: null,
    relationships: {
      deity_player: -10,
      deity_vulcanus: -35,
      deity_sylvana: -55,
      deity_aurelia: -60,
      deity_thalassor: -20,
      deity_xyrakis: 25,
    },
    myth: 'Manifesting from the abyssal rifts and cosmic silence, Morvath believes mortals only achieve true greatness through ruthless adversity, lethal ambition, and conquering survival of the fittest.',
    historicalGoals: [
      'Submerge weak river valleys into treacherous, fog-shrouded swamps and mire',
      'Spawn relentless warrior clans and monstrous legions to conquer rival realms',
      'Overthrow complacent lawful theocracies through cunning subversion',
    ],
    ethos: 'Apex Dominion, Ruthless Ambition, and Darwinian Supremacy',
  },
  {
    id: 'deity_aurelia',
    name: 'Aurelia',
    title: 'Goddess of Radiance & Law',
    domain: 'Order & Enlightenment',
    symbol: '☼',
    isPlayer: false,
    power: 12,
    thriftBonus: 0,
    lastRoll: [5, 5],
    personality: {
      aggression: 0.35,
      harmony: 0.8,
      expansion: 0.7,
      curiosity: 0.85,
    },
    color: '#38bdf8', // Sky Blue
    avatarId: null,
    relationships: {
      deity_player: 30,
      deity_vulcanus: 20,
      deity_sylvana: 35,
      deity_morvath: -60,
      deity_thalassor: 10,
      deity_xyrakis: -30,
    },
    myth: 'Aurelia descended on rays of blinding solar fire, bringing the codex of cosmic justice, architecture, scholastic universities, and mutual trade to mortals adrift in ignorance.',
    historicalGoals: [
      'Cultivate vast arable plains and interconnected trade leagues',
      'Inspire grand marble cities, soaring academies, and knightly orders',
      'Wage righteous holy crusades against discordant and monstrous horrors',
    ],
    ethos: 'Enlightened Reason, Sacred Justice, and Global Prosperity',
  },
  {
    id: 'deity_thalassor',
    name: 'Thalassor',
    title: 'The Abyssal Sovereign',
    domain: 'Oceans & Tempests',
    symbol: '♒',
    isPlayer: false,
    power: 12,
    thriftBonus: 0,
    lastRoll: [4, 5],
    personality: {
      aggression: 0.5,
      harmony: 0.4,
      expansion: 0.6,
      curiosity: 0.7,
    },
    color: '#06b6d4', // Cyan
    avatarId: null,
    relationships: {
      deity_player: 10,
      deity_vulcanus: -20,
      deity_sylvana: 20,
      deity_morvath: -15,
      deity_aurelia: 10,
      deity_xyrakis: 15,
    },
    myth: 'Ruler of the rolling tides and abyssal depths, Thalassor commands monsoon tempests and oceanic leviathans, claiming all coasts and undersea coral realms as eternal divine territory.',
    historicalGoals: [
      'Inundate lowlands into thriving coral shallows and oceanic gulfs',
      'Guide maritime mortal civilizations to dominate transoceanic trade lanes',
      'Unleash tidal maelstroms against arrogant land-bound conquerors',
    ],
    ethos: 'Fluid Adaptability, Oceanic Depths, and Storm Sovereign',
  },
  {
    id: 'deity_xyrakis',
    name: 'Xyrakis',
    title: 'The Void Weaver',
    domain: 'Forbidden Arcana & Secrets',
    symbol: '👁',
    isPlayer: false,
    power: 12,
    thriftBonus: 0,
    lastRoll: [6, 2],
    personality: {
      aggression: 0.6,
      harmony: 0.2,
      expansion: 0.5,
      curiosity: 0.95,
    },
    color: '#a855f7', // Purple
    avatarId: null,
    relationships: {
      deity_player: 0,
      deity_vulcanus: -10,
      deity_sylvana: -40,
      deity_morvath: 25,
      deity_aurelia: -30,
      deity_thalassor: 15,
    },
    myth: 'Existing between the folds of space and stellar rifts, Xyrakis observes the tapestry of mortal destinies, whispering enigmatic secrets and unraveling reality with forbidden leylines.',
    historicalGoals: [
      'Seed esoteric arcane monoliths and reality-bending anomalies',
      'Awaken telepathic hive-minds and occult scholastic cabals',
      'Collect lost artifacts and divine secrets from fallen civilizations',
    ],
    ethos: 'Occult Mastery, Hidden Knowledge, and Transcendent Will',
  },
  {
    id: 'deity_solaria',
    name: 'Solaria',
    title: 'Lady of the Dawning Sun',
    domain: 'Light & Solar Fire',
    symbol: '☼',
    isPlayer: false,
    power: 12,
    thriftBonus: 0,
    lastRoll: [5, 4],
    personality: {
      aggression: 0.45,
      harmony: 0.7,
      expansion: 0.65,
      curiosity: 0.7,
    },
    color: '#eab308', // Yellow
    avatarId: null,
    relationships: {
      deity_player: 20,
      deity_vulcanus: 15,
      deity_sylvana: 25,
      deity_morvath: -50,
      deity_boreas: -60,
    },
    myth: 'Ascending with the first cosmic dawn, Solaria bathes Meglin in thermal warmth, dispersing ancient shadows and empowering solar-worshiping civilizations.',
    historicalGoals: [
      'Disperse eternal blizzards and frostbitten wastelands with glorious solar warmth',
      'Erect grand golden citadels and monumental solar spires',
      'Purge demonic cults and stygian abominations from the daylight realm',
    ],
    ethos: 'Radiant Dawn, Unflinching Honor, and Solar Splendor',
  },
  {
    id: 'deity_boreas',
    name: 'Boreas',
    title: 'The Frost Patriarch',
    domain: 'Glaciers & Winter Wastes',
    symbol: '❄',
    isPlayer: false,
    power: 12,
    thriftBonus: 0,
    lastRoll: [3, 6],
    personality: {
      aggression: 0.55,
      harmony: 0.3,
      expansion: 0.6,
      curiosity: 0.4,
    },
    color: '#93c5fd', // Ice Blue
    avatarId: null,
    relationships: {
      deity_player: -5,
      deity_solaria: -60,
      deity_vulcanus: -20,
      deity_thalassor: 20,
    },
    myth: 'From the frozen rim of the universe, Boreas brings the great hush of winter, freezing oceans into traversable ice shelves and preserving sacred artifacts in permafrost.',
    historicalGoals: [
      'Expand polar ice caps and chill equatorial monsoons into crisp subarctic winds',
      'Guide hardy frost-born warriors to endure and conquer fragile southern kingdoms',
      'Freeze cataclysms in perpetual stasis beneath glacial vaults',
    ],
    ethos: 'Unyielding Chill, Stoic Endurance, and Glacial Majesty',
  },
  {
    id: 'deity_gorgoroth',
    name: 'Gorgoroth',
    title: 'The World-Breaker',
    domain: 'Crags & Volcanic Ruin',
    symbol: '⚒',
    isPlayer: false,
    power: 12,
    thriftBonus: 0,
    lastRoll: [6, 4],
    personality: {
      aggression: 0.9,
      harmony: 0.05,
      expansion: 0.85,
      curiosity: 0.3,
    },
    color: '#b45309', // Dark Bronze / Magma
    avatarId: null,
    relationships: {
      deity_player: -20,
      deity_sylvana: -65,
      deity_aurelia: -50,
      deity_morvath: 30,
    },
    myth: 'Gorgoroth arose from the catastrophic collision of tectonic plates, wielding seismic hammers to shatter tranquil landscapes into jagged badlands and magma rifts.',
    historicalGoals: [
      'Split peaceful continents with impassable volcanic chasms and jagged fault lines',
      'Champion monstrous behemoths and savage subterranean hordes',
      'Level towering ivory cities with devastating earthquakes and volcanic fallout',
    ],
    ethos: 'Tectonic Fury, Raw Primordial Might, and Shattered Strata',
  },
  {
    id: 'deity_elysia',
    name: 'Elysia',
    title: 'The Verdant Maiden',
    domain: 'Flora & Gentle Rains',
    symbol: '❧',
    isPlayer: false,
    power: 12,
    thriftBonus: 0,
    lastRoll: [4, 5],
    personality: {
      aggression: 0.1,
      harmony: 0.95,
      expansion: 0.4,
      curiosity: 0.8,
    },
    color: '#34d399', // Mint / Emerald
    avatarId: null,
    relationships: {
      deity_player: 35,
      deity_sylvana: 45,
      deity_gorgoroth: -70,
      deity_morvath: -50,
    },
    myth: 'Wherever Elysia walks, petrified deserts bloom with fragrant blossoms and polluted marshes clarify into sacred crystalline springs.',
    historicalGoals: [
      'Heal scarred wastelands with enchanted flora and miraculous botanical gardens',
      'Foster peaceful communes and scholastic sanctuaries free from war',
      'Unite the diverse races in a tapestry of mutual benevolence',
    ],
    ethos: 'Unconditional Compassion, Botanical Wonder, and Everlasting Peace',
  },
  {
    id: 'deity_zephyros',
    name: 'Zephyros',
    title: 'Lord of the Roaring Winds',
    domain: 'Tempests & The Sky',
    symbol: '⚡',
    isPlayer: false,
    power: 12,
    thriftBonus: 0,
    lastRoll: [5, 3],
    personality: {
      aggression: 0.5,
      harmony: 0.5,
      expansion: 0.7,
      curiosity: 0.85,
    },
    color: '#0284c7', // Sky Azure
    avatarId: null,
    relationships: {
      deity_player: 15,
      deity_thalassor: 25,
      deity_vulcanus: -15,
    },
    myth: 'Zephyros dances through the atmospheric currents, steering monsoon winds, trade currents, and sudden lightning squalls across the oceans.',
    historicalGoals: [
      'Bless maritime voyages and sky-faring vessels with favoring gale winds',
      'Sculpt dynamic atmospheric vortexes that stir continents into motion',
      'Confound stagnant empires with unpredictable squalls and sudden change',
    ],
    ethos: 'Boundless Freedom, Atmospheric Tempest, and Fleeting Wonder',
  },
  {
    id: 'deity_nyxathor',
    name: 'Nyxathor',
    title: 'The Stygian Sovereign',
    domain: 'Night & Astral Mysteries',
    symbol: '☾',
    isPlayer: false,
    power: 12,
    thriftBonus: 0,
    lastRoll: [4, 4],
    personality: {
      aggression: 0.65,
      harmony: 0.25,
      expansion: 0.5,
      curiosity: 0.9,
    },
    color: '#7c3aed', // Deep Violet
    avatarId: null,
    relationships: {
      deity_player: 5,
      deity_solaria: -55,
      deity_xyrakis: 30,
    },
    myth: 'Dwelling within the starry canopy and obsidian voids, Nyxathor reveals hidden prophetic dreams to mortal visionaries while veiling sinister machinations.',
    historicalGoals: [
      'Veil celestial truths behind esoteric zodiac constellations',
      'Inspire secretive night guilds, phantom assassins, and dream weavers',
      'Erect obsidian observatories to commune with beyond-the-stars entities',
    ],
    ethos: 'Nocturnal Whispers, Astrological Fate, and Shadowed Sovereignty',
  },
];

export interface DeityPair {
  id: string;
  name: string;
  theme: string;
  description: string;
  deityIds: [string, string];
}

export const CANONICAL_DEITY_PAIRS: DeityPair[] = [
  {
    id: 'pair_forge_bloom',
    name: 'Forge & Bloom',
    theme: 'Subterranean Industry vs Primal Wilderness',
    description: 'Vulcanus raises stone forges & iron veins while Sylvana retaliates with untamed primeval groves.',
    deityIds: ['deity_vulcanus', 'deity_sylvana'],
  },
  {
    id: 'pair_light_discord',
    name: 'Radiance & Discord',
    theme: 'Order & Law vs Ruthless Subversion',
    description: 'Aurelia codifies marble empires and justice, while Morvath foments dark conspiracies and survival of the fittest.',
    deityIds: ['deity_aurelia', 'deity_morvath'],
  },
  {
    id: 'pair_ocean_arcana',
    name: 'Tides & Arcana',
    theme: 'Oceanic Depths vs Eldritch Leylines',
    description: 'Thalassor commands monsoon tempests and reefs, while Xyrakis weaves forbidden dimensional secrets.',
    deityIds: ['deity_thalassor', 'deity_xyrakis'],
  },
  {
    id: 'pair_sun_frost',
    name: 'Dawn & Glacial Frost',
    theme: 'Solar Fire vs Polar Permafrost',
    description: 'Solaria bathes continents in thermal light while Boreas locks the oceans in glacial ice packs.',
    deityIds: ['deity_solaria', 'deity_boreas'],
  },
  {
    id: 'pair_crags_night',
    name: 'Cataclysm & Stygian Night',
    theme: 'Tectonic Fracture vs Nocturnal Enigma',
    description: 'Gorgoroth splits mountain roots with volcanic hammers while Nyxathor cloaks mortal minds in astral shadows.',
    deityIds: ['deity_gorgoroth', 'deity_nyxathor'],
  },
  {
    id: 'pair_verdant_tempest',
    name: 'Verdancy & Tempests',
    theme: 'Gentle Blossom vs Roaring Sky Gale',
    description: 'Elysia nurtures fragile botanical meadows while Zephyros guides thunderheads across the horizon.',
    deityIds: ['deity_elysia', 'deity_zephyros'],
  },
];

const RANDOM_NAMES = [
  'Valerius', 'Kaelen', 'Morrigan', 'Theron', 'Zarek', 'Isolde', 'Draxis', 'Althea',
  'Orion', 'Vespera', 'Malakor', 'Astris', 'Rhiannon', 'Kazador', 'Yvaine', 'Balthazar'
];

const RANDOM_TITLES = [
  'The Star-Weaver', 'The Ashen Sentinel', 'Keeper of the Tide', 'The Iron Sovereign',
  'Voice of the Depths', 'The Silver Hand', 'Architect of Ruin', 'The Sun-Crowned',
  'The Rune-Carver', 'Mistress of Whispers', 'The Thunder Caller', 'The Seed-Bearer'
];

const RANDOM_DOMAINS = [
  'Runes & Smithcraft', 'Chrono-Currents & Fate', 'Abyssal Chasm & Leviathans',
  'Wild beasts & Hunters', 'Solar Radiance & Fire', 'Crystalline Caves & Gems',
  'Storms & Lightning', 'Shadows & Stealth', 'Fertility & Harvests', 'Blood & Warfare'
];

const RANDOM_SYMBOLS = ['✧', '⚒', '☼', '☠', '❧', '⚡', '🜂', '🜄', '☾', '👁', '⚜', '⚔', '❂', '✦', '❄', '♒'];
const RANDOM_COLORS = [
  '#f59e0b', '#10b981', '#ef4444', '#38bdf8', '#06b6d4', '#a855f7',
  '#ec4899', '#84cc16', '#eab308', '#6366f1', '#14b8a6', '#f97316'
];

/**
 * Generate a unique random NPC Deity for custom pantheons
 */
export function generateRandomDeity(existingIndex = 1): Deity {
  const randName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
  const randTitle = RANDOM_TITLES[Math.floor(Math.random() * RANDOM_TITLES.length)];
  const randDomain = RANDOM_DOMAINS[Math.floor(Math.random() * RANDOM_DOMAINS.length)];
  const randSymbol = RANDOM_SYMBOLS[Math.floor(Math.random() * RANDOM_SYMBOLS.length)];
  const randColor = RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];

  const aggression = Math.round((0.15 + Math.random() * 0.7) * 100) / 100;
  const harmony = Math.round((0.15 + Math.random() * 0.7) * 100) / 100;
  const expansion = Math.round((0.2 + Math.random() * 0.7) * 100) / 100;
  const curiosity = Math.round((0.3 + Math.random() * 0.6) * 100) / 100;

  return {
    id: `deity_custom_${Date.now()}_${existingIndex}`,
    name: randName,
    title: randTitle,
    domain: randDomain,
    symbol: randSymbol,
    isPlayer: false,
    power: 12,
    thriftBonus: 0,
    lastRoll: [3, 4],
    personality: {
      aggression,
      harmony,
      expansion,
      curiosity,
    },
    color: randColor,
    avatarId: null,
    relationships: {},
    myth: `Conceived in the celestial ether, ${randName} embodies the divine principle of ${randDomain}. Drawing upon ancient currents, this deity seeks to sculpt the world according to their divine ethos.`,
    ethos: `Sacred dominion over ${randDomain.toLowerCase()}, boundless curiosity, and legendary purpose.`,
    historicalGoals: [
      `Uplift mortal followers dedicated to the mysteries of ${randDomain}`,
      `Shape land, climates, and realms that honor their divine lineage`,
      `Forge alliances with like-minded deities while checking aggressive rivals`,
    ],
  };
}

export const INITIAL_DEITIES: Deity[] = [
  {
    id: 'deity_player',
    name: 'Aethelgard',
    title: 'The Prime Shaper',
    domain: 'Creation & Will',
    symbol: '✧',
    isPlayer: true,
    power: 12,
    thriftBonus: 0,
    lastRoll: [4, 4],
    personality: {
      aggression: 0.5,
      harmony: 0.5,
      expansion: 0.5,
      curiosity: 0.8,
    },
    color: '#818cf8', // Indigo
    avatarId: null,
    relationships: {
      deity_vulcanus: 15,
      deity_sylvana: 25,
      deity_morvath: -10,
      deity_aurelia: 30,
      deity_thalassor: 10,
      deity_xyrakis: 0,
    },
    myth: 'First to awaken in the celestial expanse, Aethelgard perceives the latent potential within raw matter and calls forth continents, climates, and sentient species through pure divine will.',
    historicalGoals: [
      'Harmonize the raw planetary elements into a thriving, balanced world',
      'Foster enlightened mortal civilizations capable of reaching the stars',
      'Maintain the cosmic balance against cataclysmic extremes',
    ],
    ethos: 'Cosmic Genesis, Free Will, and Creative Transcendence',
  },
  ...CANDIDATE_NPC_DEITIES.slice(0, 4),
];

/**
 * Build a customized pantheon for a new game with a custom player deity and N deities.
 */
export function buildCustomPantheon(
  playerDeity: Deity,
  totalDeityCount: number,
  chosenNpcIds?: string[],
  customNpcs?: Deity[]
): Deity[] {
  const allPool = [...CANDIDATE_NPC_DEITIES, ...(customNpcs || [])];
  let selectedNpcs: Deity[] = [];
  if (chosenNpcIds && chosenNpcIds.length > 0) {
    selectedNpcs = allPool.filter((d) => chosenNpcIds.includes(d.id));
  }

  // If more are needed, fill up to totalDeityCount - 1 (since 1 is player)
  const neededNpcs = Math.max(1, totalDeityCount - 1);
  for (const candidate of allPool) {
    if (selectedNpcs.length >= neededNpcs) break;
    if (!selectedNpcs.find((d) => d.id === candidate.id)) {
      selectedNpcs.push(candidate);
    }
  }

  // Deep copy player deity and selected NPCs, ensuring relationships are mapped
  const fullPantheon: Deity[] = [
    { ...playerDeity, isPlayer: true },
    ...selectedNpcs.map((npc) => ({
      ...npc,
      isPlayer: false,
      power: 12,
      thriftBonus: 0,
      avatarId: null,
      relationships: { ...npc.relationships, [playerDeity.id]: npc.relationships[playerDeity.id] || 0 },
    })),
  ];

  return fullPantheon;
}

export interface NpcActionResult {
  updatedDeity: Deity;
  updatedCells: WorldCell[];
  updatedCities: City[];
  updatedCivilizations: Civilization[];
  updatedRaces: Race[];
  updatedArmies: Army[];
  updatedAvatars: Avatar[];
  updatedOrders: OrderItem[];
  logEntries: HistoryLogEntry[];
}

/**
 * Execute the autonomous AI decision-making turn for an NPC Deity
 */
export function executeNpcTurn(
  npc: Deity,
  age: AgeId,
  round: number,
  year: number,
  cells: WorldCell[],
  cities: City[],
  civilizations: Civilization[],
  races: Race[],
  armies: Army[],
  avatars: Avatar[],
  orders: OrderItem[]
): NpcActionResult {
  let power = npc.power;
  let currentCells = [...cells];
  let currentCities = [...cities];
  let currentCivs = [...civilizations];
  let currentRaces = [...races];
  let currentArmies = [...armies];
  let currentAvatars = [...avatars];
  let currentOrders = [...orders];
  const logs: HistoryLogEntry[] = [];

  const costs = DAWN_OF_WORLDS_COSTS;

  // Find land cells for geographical actions
  const landCells = currentCells.filter((c) => c.elevation > 0);
  const myCiv = currentCivs.find((c) => c.creatorDeityId === npc.id);
  const myRace = currentRaces.find((r) => r.creatorDeityId === npc.id);

  // DECISION LOGIC BY AGE:
  if (age === '1st_age_land') {
    // In Age 1: Land is very cheap (Shape Land: 3, Climate: 2).
    // Vulcanus raises mountains and volcanic peaks
    if (npc.id === 'deity_vulcanus' && power >= costs.shape_land[age] && landCells.length > 0) {
      const targetCell = landCells[Math.floor(Math.random() * landCells.length)];
      currentCells = applyTerrainModification(currentCells, targetCell.index, 'mountains', 1);
      power -= costs.shape_land[age];
      logs.push({
        id: `log_${Date.now()}_${Math.random()}`,
        age,
        round,
        year,
        deityId: npc.id,
        deityName: npc.name,
        deityColor: npc.color,
        actionType: 'Shape Land',
        cost: costs.shape_land[age],
        title: `${npc.name} Raised the Iron Crags`,
        description: `Vulcanus channeled deep earth currents, raising jagged volcanic and granite mountain chains at [Lat: ${targetCell.lat.toFixed(0)}°, Lon: ${targetCell.lon.toFixed(0)}°].`,
        impact: 'Created mineral-rich high ground for future mountain fortresses.',
        category: 'creation',
      });
    } else if (npc.id === 'deity_sylvana' && power >= costs.shape_land[age] && landCells.length > 0) {
      const targetCell = landCells[Math.floor(Math.random() * landCells.length)];
      currentCells = applyTerrainModification(currentCells, targetCell.index, 'forest', 1);
      power -= costs.shape_land[age];
      logs.push({
        id: `log_${Date.now()}_${Math.random()}`,
        age,
        round,
        year,
        deityId: npc.id,
        deityName: npc.name,
        deityColor: npc.color,
        actionType: 'Shape Land',
        cost: costs.shape_land[age],
        title: `${npc.name} Blossomed Primeval Woodlands`,
        description: `Sylvana summoned ancient rains and seeded deep emerald old-growth forests brimming with fertile life.`,
        impact: 'Increased regional moisture and future civilization fertility.',
        category: 'creation',
      });
    } else if (npc.id === 'deity_morvath' && power >= costs.shape_land[age] && landCells.length > 0) {
      const targetCell = landCells[Math.floor(Math.random() * landCells.length)];
      currentCells = applyTerrainModification(currentCells, targetCell.index, 'swamp', 1);
      power -= costs.shape_land[age];
      logs.push({
        id: `log_${Date.now()}_${Math.random()}`,
        age,
        round,
        year,
        deityId: npc.id,
        deityName: npc.name,
        deityColor: npc.color,
        actionType: 'Shape Land',
        cost: costs.shape_land[age],
        title: `${npc.name} Blighted the Mirelands`,
        description: `Morvath sank the lowlands into treacherous, fog-shrouded swamps steeped in primordial perils.`,
        impact: 'Formed hazardous defensive terrain and fertile breeding grounds for resilient beasts.',
        category: 'creation',
      });
    } else if (npc.id === 'deity_aurelia' && power >= costs.shape_land[age] && landCells.length > 0) {
      const targetCell = landCells[Math.floor(Math.random() * landCells.length)];
      currentCells = applyTerrainModification(currentCells, targetCell.index, 'plains', 1);
      power -= costs.shape_land[age];
      logs.push({
        id: `log_${Date.now()}_${Math.random()}`,
        age,
        round,
        year,
        deityId: npc.id,
        deityName: npc.name,
        deityColor: npc.color,
        actionType: 'Shape Land',
        cost: costs.shape_land[age],
        title: `${npc.name} Cultivated the Sunlit Plains`,
        description: `Aurelia bathed the open continent in golden solar warmth, smoothing jagged rocks into fertile, arable grasslands.`,
        impact: 'Prepared ideal ground for expansive mortal cities and road networks.',
        category: 'creation',
      });
    }
  } else if (age === '2nd_age_races') {
    // In Age 2: Races cost only 6 power!
    if (!myRace && power >= costs.create_race[age] && landCells.length > 0) {
      // Find matching preset race for this deity
      let preset = PRESET_RACES.find((r) => r.creatorDeityId === npc.id);
      if (!preset) {
        preset = PRESET_RACES.find((r) => !currentRaces.some((cr) => cr.name === r.name));
      }
      if (preset) {
        const candidateCell = landCells.find((c) => preset?.favoredBiomes.includes(c.terrain)) || landCells[0];
        const newRace: Race = {
          ...preset,
          id: `race_${npc.id}_${Date.now()}`,
          creatorDeityId: npc.id,
        };
        currentRaces.push(newRace);

        // Found the first city and civilization for this race
        const cityId = `city_${npc.id}_cap`;
        const civId = `civ_${npc.id}`;
        const newCity: City = {
          id: cityId,
          name: `${newRace.name} Cradle`,
          civilizationId: civId,
          raceId: newRace.id,
          creatorDeityId: npc.id,
          cellIndex: candidateCell.index,
          lat: candidateCell.lat,
          lon: candidateCell.lon,
          population: 150,
          defense: 1,
          wonders: [],
          armiesStationed: 0,
          alignment: newRace.baseAlignment,
          wealth: 30,
          status: 'prospering',
        };

        const newCiv: Civilization = {
          id: civId,
          name: `Empire of the ${newRace.demonym}`,
          raceId: newRace.id,
          creatorDeityId: npc.id,
          capitalCityId: cityId,
          cityIds: [cityId],
          technologies: [AVAILABLE_TECHNOLOGIES[Math.floor(Math.random() * AVAILABLE_TECHNOLOGIES.length)].name],
          orders: [],
          alignment: newRace.baseAlignment,
          diplomacy: {},
          color: newRace.color,
          coatOfArms: generateCoatOfArms(`Empire of the ${newRace.demonym}`, newRace, npc.color),
        };

        currentCities.push(newCity);
        currentCivs.push(newCiv);

        candidateCell.cityId = cityId;
        candidateCell.civilizationId = civId;
        candidateCell.population = 150;

        power -= costs.create_race[age];
        logs.push({
          id: `log_${Date.now()}_${Math.random()}`,
          age,
          round,
          year,
          deityId: npc.id,
          deityName: npc.name,
          deityColor: npc.color,
          actionType: 'Create Race',
          cost: costs.create_race[age],
          title: `${npc.name} Awakened the ${newRace.name}`,
          description: `Bestowed the breath of sentience upon the ${newRace.name}, founding their ancestral hearthstone at ${newCity.name}.`,
          impact: `Awakened mortal civilization with traits: ${newRace.traits.join(', ')}.`,
          category: 'life',
        });
      }
    } else if (myCiv && power >= costs.advance_civ[age]) {
      // Advance Civilization with knowledge
      const unresearched = AVAILABLE_TECHNOLOGIES.filter((t) => !myCiv.technologies.includes(t.name));
      if (unresearched.length > 0) {
        const tech = unresearched[0];
        myCiv.technologies.push(tech.name);
        power -= costs.advance_civ[age];
        logs.push({
          id: `log_${Date.now()}_${Math.random()}`,
          age,
          round,
          year,
          deityId: npc.id,
          deityName: npc.name,
          deityColor: npc.color,
          actionType: 'Advance Civilization',
          cost: costs.advance_civ[age],
          title: `${npc.name} Bestowed ${tech.name}`,
          description: `Gifted the scholars and master smiths of ${myCiv.name} profound secrets of ${tech.name}.`,
          impact: tech.desc,
          category: 'civilization',
        });
      }
    } else if (myCiv && power >= costs.command_race[age]) {
      // Command race to expand and found a second settlement
      const capCity = currentCities.find((c) => c.id === myCiv.capitalCityId);
      if (capCity) {
        const neighbors = getAdjacentCellIndices(capCity.cellIndex, 2);
        const freeCell = neighbors.map((idx: number) => currentCells[idx]).find((c: WorldCell | undefined) => Boolean(c && c.elevation > 0 && !c.cityId));
        if (freeCell) {
          const newCityId = `city_${npc.id}_${Date.now()}`;
          const newCity: City = {
            id: newCityId,
            name: `${npc.name}'s Bastion`,
            civilizationId: myCiv.id,
            raceId: myCiv.raceId,
            creatorDeityId: npc.id,
            cellIndex: freeCell.index,
            lat: freeCell.lat,
            lon: freeCell.lon,
            population: 100,
            defense: 1,
            wonders: [],
            armiesStationed: 0,
            alignment: myCiv.alignment,
            wealth: 20,
            status: 'prospering',
          };
          currentCities.push(newCity);
          myCiv.cityIds.push(newCityId);
          freeCell.cityId = newCityId;
          freeCell.civilizationId = myCiv.id;
          freeCell.population = 100;

          power -= costs.command_race[age];
          logs.push({
            id: `log_${Date.now()}_${Math.random()}`,
            age,
            round,
            year,
            deityId: npc.id,
            deityName: npc.name,
            deityColor: npc.color,
            actionType: 'Command Race',
            cost: costs.command_race[age],
            title: `${myCiv.name} Founded ${newCity.name}`,
            description: `Guided mortal pioneers into fertile frontier valleys, constructing the bastions of ${newCity.name}.`,
            impact: 'Expanded territory and demographic influence.',
            category: 'civilization',
          });
        }
      }
    }
  } else if (age === '3rd_age_relations') {
    // In Age 3: Politics, Armies, Avatars, Orders, Rivalries, Catastrophes!
    const rivalCivs = currentCivs.filter((c) => c.creatorDeityId !== npc.id);

    // Check if aggressive deity wants to muster an army
    if (myCiv && power >= costs.command_city[age] && currentArmies.filter((a) => a.civilizationId === myCiv.id).length < 2) {
      const city = currentCities.find((c) => c.civilizationId === myCiv.id);
      if (city) {
        const newArmy: Army = {
          id: `army_${npc.id}_${Date.now()}`,
          name: `${npc.name}'s Iron Legion`,
          civilizationId: myCiv.id,
          creatorDeityId: npc.id,
          cityOriginId: city.id,
          cellIndex: city.cellIndex,
          lat: city.lat,
          lon: city.lon,
          targetCellIndex: null,
          targetCityId: null,
          strength: 4,
          consecutiveBattles: 0,
        };

        // If hostile to another civ, target their city
        if (rivalCivs.length > 0 && npc.personality.aggression > 0.4) {
          const targetCiv = rivalCivs[0];
          const targetCity = currentCities.find((c) => c.civilizationId === targetCiv.id);
          if (targetCity) {
            newArmy.targetCellIndex = targetCity.cellIndex;
            newArmy.targetCityId = targetCity.id;
            myCiv.diplomacy[targetCiv.id] = 'war';
            targetCiv.diplomacy[myCiv.id] = 'war';
          }
        }

        currentArmies.push(newArmy);
        power -= costs.command_city[age];

        logs.push({
          id: `log_${Date.now()}_${Math.random()}`,
          age,
          round,
          year,
          deityId: npc.id,
          deityName: npc.name,
          deityColor: npc.color,
          actionType: 'Command City',
          cost: costs.command_city[age],
          title: `${city.name} Mustered a Grand Host`,
          description: `Drums of war resounded across the ramparts as ${city.name} raised ${newArmy.name}.`,
          impact: newArmy.targetCityId ? `Marched toward rival borders with hostile intent!` : 'Stationed for defense.',
          category: 'conflict',
        });
      }
    } else if (!npc.avatarId && power >= costs.create_avatar[age]) {
      // Manifest Divine Avatar
      const avatarName =
        npc.id === 'deity_vulcanus'
          ? 'Colossus of Living Granite'
          : npc.id === 'deity_sylvana'
          ? 'Ancient Treant Avatar'
          : npc.id === 'deity_morvath'
          ? 'Abyssal Shadow Wyrm'
          : 'Arch-Seraph of the Sun';

      const homeCity = currentCities.find((c) => c.creatorDeityId === npc.id) || currentCities[0];
      const avatarCell = homeCity ? currentCells[homeCity.cellIndex] : landCells[0];

      if (avatarCell) {
        const newAvatar: Avatar = {
          id: `avatar_${npc.id}`,
          name: avatarName,
          title: `Incarnation of ${npc.name}`,
          deityId: npc.id,
          cellIndex: avatarCell.index,
          lat: avatarCell.lat,
          lon: avatarCell.lon,
          isAlive: true,
          actionsThisTurn: 1,
          description: `A towering mythic manifestation of ${npc.name}'s divine essence walking upon mortal soil.`,
        };
        currentAvatars.push(newAvatar);
        npc.avatarId = newAvatar.id;
        power -= costs.create_avatar[age];

        logs.push({
          id: `log_${Date.now()}_${Math.random()}`,
          age,
          round,
          year,
          deityId: npc.id,
          deityName: npc.name,
          deityColor: npc.color,
          actionType: 'Create Avatar',
          cost: costs.create_avatar[age],
          title: `${npc.name} Manifested ${avatarName}`,
          description: `The sky cracked open as ${avatarName} descended upon the world to lead armies and perform immortal feats.`,
          impact: 'Can perform two commands per turn or lead military campaigns in battle.',
          category: 'avatar',
        });
      }
    } else if (npc.personality.aggression > 0.7 && power >= costs.catastrophe[age] && rivalCivs.length > 0) {
      // Cast a Catastrophe on a hated rival
      const hatedCiv = rivalCivs[Math.floor(Math.random() * rivalCivs.length)];
      const targetCity = currentCities.find((c) => c.civilizationId === hatedCiv.id);
      if (targetCity) {
        targetCity.population = Math.max(20, Math.floor(targetCity.population * 0.6));
        targetCity.defense = Math.max(0, targetCity.defense - 1);
        targetCity.status = 'under_siege';
        power -= costs.catastrophe[age];

        logs.push({
          id: `log_${Date.now()}_${Math.random()}`,
          age,
          round,
          year,
          deityId: npc.id,
          deityName: npc.name,
          deityColor: npc.color,
          actionType: 'Catastrophe',
          cost: costs.catastrophe[age],
          title: `${npc.name} Unleashed Wrath Upon ${targetCity.name}`,
          description: `Raining meteors and pestilent plagues decried ruin upon ${targetCity.name}, crumbling walls and decimating the populace.`,
          impact: 'City defense reduced, 40% casualties inflicted.',
          category: 'conflict',
        });
      }
    }
  }

  // Calculate thrift bonus for next turn if power ended <= 5
  let nextBonus = npc.thriftBonus;
  if (power <= 5) {
    nextBonus = Math.min(3, npc.thriftBonus + 1);
  } else {
    nextBonus = 0;
  }

  const updatedDeity: Deity = {
    ...npc,
    power,
    thriftBonus: nextBonus,
  };

  return {
    updatedDeity,
    updatedCells: currentCells,
    updatedCities: currentCities,
    updatedCivilizations: currentCivs,
    updatedRaces: currentRaces,
    updatedArmies: currentArmies,
    updatedAvatars: currentAvatars,
    updatedOrders: currentOrders,
    logEntries: logs,
  };
}
