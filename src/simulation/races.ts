/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  IntelligenceLevel,
  Race,
  RaceCategory,
  SocietalBehavior,
  TerrainType,
  WorldCell,
} from '../types/game';

export const PRESET_RACES: Race[] = [
  {
    id: 'race_humans',
    name: 'Humans',
    demonym: 'Humanity',
    creatorDeityId: 'deity_player',
    parentRaceId: null,
    category: 'civilized',
    description:
      'Highly adaptable, ambitious, and prolific mortals known for establishing vast kingdoms and rapid technological innovation.',
    traits: ['Adaptable', 'Ambitious', 'Organized'],
    physiology: {
      carapaceOrSkin: 'Normal Humanoid Skin (Standard Epidermis)',
      locomotion: 'Normal Bipedal Gait',
      sensory: 'Normal Trichromatic Vision',
      lifespanYears: 80,
      metabolism: 'Omnivorous Organic',
    },
    intelligenceLevel: 'scholastic',
    societalBehavior: 'mercantile',
    favoredBiomes: ['plains', 'hills', 'forest'],
    baseAlignment: 0,
    militaryBonus: 1,
    fertilityMultiplier: 1.2,
    techAffinity: 1.25,
    color: '#60a5fa', // Blue
  },
  {
    id: 'race_elves',
    name: 'High Elves',
    demonym: 'Elvenkind',
    creatorDeityId: 'deity_sylvana',
    parentRaceId: null,
    category: 'civilized',
    description:
      'Graceful, long-lived scholars deeply intertwined with primordial forests, possessing innate arcane sensitivities.',
    traits: ['Arcane Affinity', 'Immortal Memory', 'Forest Dwellers'],
    physiology: {
      carapaceOrSkin: 'Fair / Silken Epidermis',
      locomotion: 'Agile Bipedal (Graceful Stride)',
      sensory: 'Low-Light / Twilight Vision',
      lifespanYears: 450,
      metabolism: 'Vegetarian Photosensitive',
    },
    intelligenceLevel: 'arcane_network',
    societalBehavior: 'scholarly',
    favoredBiomes: ['forest', 'hills'],
    baseAlignment: 1,
    militaryBonus: 1,
    fertilityMultiplier: 0.8,
    techAffinity: 1.4,
    color: '#34d399', // Emerald
  },
  {
    id: 'race_dwarves',
    name: 'Mountain Dwarves',
    demonym: 'Dwarvenfolk',
    creatorDeityId: 'deity_vulcanus',
    parentRaceId: null,
    category: 'civilized',
    description:
      'Stout, relentless subterranean architects and master metalsmiths who chisel magnificent fortress cities into mountain roots.',
    traits: ['Master Smiths', 'Stonebound', 'Magic Resistant'],
    physiology: {
      carapaceOrSkin: 'Weathered Leathery Hide',
      locomotion: 'Dense Stocky Bipedal',
      sensory: 'Infrared Darkvision',
      lifespanYears: 250,
      metabolism: 'High-Density Caloric',
    },
    intelligenceLevel: 'scholastic',
    societalBehavior: 'monastic',
    favoredBiomes: ['mountains', 'hills', 'volcanic'],
    baseAlignment: 1,
    militaryBonus: 2,
    fertilityMultiplier: 0.9,
    techAffinity: 1.3,
    color: '#fbbf24', // Amber Gold
  },
  {
    id: 'race_halflings',
    name: 'Meadow Halflings',
    demonym: 'Halflings',
    creatorDeityId: 'deity_player',
    parentRaceId: null,
    category: 'civilized',
    description:
      'Cheerful, peaceful agriculturalists blessed with uncanny good fortune, thriving in quiet riverside shires and bountiful orchards.',
    traits: ['Bountiful Harvest', 'Lucky & Elusive', 'Hospitality'],
    physiology: {
      carapaceOrSkin: 'Normal Humanoid Skin (Standard Epidermis)',
      locomotion: 'Normal Bipedal Gait',
      sensory: 'Normal Trichromatic Vision',
      lifespanYears: 110,
      metabolism: 'High Frequency Caloric',
    },
    intelligenceLevel: 'scholastic',
    societalBehavior: 'communal_democracy',
    favoredBiomes: ['plains', 'hills'],
    baseAlignment: 1,
    militaryBonus: 0,
    fertilityMultiplier: 1.45,
    techAffinity: 1.1,
    color: '#a78bfa', // Lavender
  },
  {
    id: 'race_orcs',
    name: 'Steppe Orcs',
    demonym: 'Orcish Clans',
    creatorDeityId: 'deity_morvath',
    parentRaceId: null,
    category: 'monstrous',
    description:
      'Imposing, ferocious warrior clans endowed with savage physical might, blood fury, and uncompromising martial honor.',
    traits: ['Blood Fury', 'Iron Constitution', 'Honor Bound'],
    physiology: {
      carapaceOrSkin: 'Thick Scaled Reptilian Plates',
      locomotion: 'Dense Stocky Bipedal',
      sensory: 'Keen Predatory Senses & Olfactory',
      lifespanYears: 65,
      metabolism: 'Carnivorous High-Protein',
    },
    intelligenceLevel: 'cunning',
    societalBehavior: 'militaristic',
    favoredBiomes: ['plains', 'hills', 'desert'],
    baseAlignment: -1,
    militaryBonus: 3,
    fertilityMultiplier: 1.3,
    techAffinity: 0.8,
    color: '#f87171', // Crimson
  },
  {
    id: 'race_goblins',
    name: 'Deep Goblins',
    demonym: 'Goblinkind',
    creatorDeityId: 'deity_morvath',
    parentRaceId: null,
    category: 'monstrous',
    description:
      'Prolific, eccentric subterranean tricksters and scavengers who craft erratic clockwork contraptions and thrive in sunken caverns.',
    traits: ['Prolific Breeders', 'Cunning Tinkerers', 'Subterranean'],
    physiology: {
      carapaceOrSkin: 'Weathered Leathery Hide',
      locomotion: 'Normal Bipedal Gait',
      sensory: 'Infrared Darkvision',
      lifespanYears: 45,
      metabolism: 'Scavenger Omnivore',
    },
    intelligenceLevel: 'cunning',
    societalBehavior: 'tribal',
    favoredBiomes: ['swamp', 'mountains', 'hills'],
    baseAlignment: -1,
    militaryBonus: 0,
    fertilityMultiplier: 1.7,
    techAffinity: 1.15,
    color: '#a3e635', // Lime
  },
  {
    id: 'race_kobolds',
    name: 'Cavern Kobolds',
    demonym: 'Kobolds',
    creatorDeityId: 'deity_vulcanus',
    parentRaceId: null,
    category: 'monstrous',
    description:
      'Nimble, dragon-worshipping cave dwellers proficient in deadly tunnels, labyrinthine spring traps, and tight pack ambushes.',
    traits: ['Draconic Blood', 'Trap Masters', 'Hive Mindset'],
    physiology: {
      carapaceOrSkin: 'Thick Scaled Reptilian Plates',
      locomotion: 'Agile Bipedal (Graceful Stride)',
      sensory: 'Thermal Pit Organs',
      lifespanYears: 60,
      metabolism: 'Poikilothermic Reptilian',
    },
    intelligenceLevel: 'cunning',
    societalBehavior: 'tribal',
    favoredBiomes: ['mountains', 'volcanic', 'desert'],
    baseAlignment: 0,
    militaryBonus: 1,
    fertilityMultiplier: 1.4,
    techAffinity: 0.95,
    color: '#fb923c', // Orange
  },
  {
    id: 'race_troglodytes',
    name: 'Marsh Troglodytes',
    demonym: 'Troglodytes',
    creatorDeityId: 'deity_morvath',
    parentRaceId: null,
    category: 'monstrous',
    description:
      'Sunken swamp carnivores steeped in poisonous secretions and noxious stench, waging ruthless guerrilla warfare from misty bayous.',
    traits: ['Stench Aura', 'Venomous Strike', 'Bog Camouflage'],
    physiology: {
      carapaceOrSkin: 'Slime-Coated Amphibious Skin',
      locomotion: 'Normal Bipedal Gait',
      sensory: 'Subterranean Tremorsense',
      lifespanYears: 50,
      metabolism: 'Carnivorous Scavenger',
    },
    intelligenceLevel: 'instinctual',
    societalBehavior: 'anarchic_survivalist',
    favoredBiomes: ['swamp', 'forest'],
    baseAlignment: -1,
    militaryBonus: 2,
    fertilityMultiplier: 1.35,
    techAffinity: 0.7,
    color: '#84cc16', // Olive Green
  },
  {
    id: 'race_revenants',
    name: 'Graveborn Revenants',
    demonym: 'The Undying',
    creatorDeityId: 'deity_morvath',
    parentRaceId: null,
    category: 'aberration',
    description:
      'Relentless undead warriors bound by necrotic will. Immune to starvation, cold, or terror, marching tirelessly under eternal banners.',
    traits: ['Fearless Undead', 'Immune to Morale Break', 'Pain Agnosia'],
    physiology: {
      carapaceOrSkin: 'Decaying / Necrotic Flesh',
      locomotion: 'Normal Bipedal Gait',
      sensory: 'Blind / Blindsight (Life Aura)',
      lifespanYears: 999,
      metabolism: 'Necromantic Essence',
    },
    intelligenceLevel: 'arcane_network',
    societalBehavior: 'necrocracy',
    favoredBiomes: ['swamp', 'desert', 'tundra'],
    baseAlignment: -1,
    militaryBonus: 3,
    fertilityMultiplier: 0.6,
    techAffinity: 1.1,
    color: '#cbd5e1', // Slate White
  },
  {
    id: 'race_stygian_swarm',
    name: 'Stygian Chitin-Brood',
    demonym: 'The Brood-Swarm',
    creatorDeityId: 'deity_morvath',
    parentRaceId: null,
    category: 'aberration',
    description:
      'Chittering insectoid horrors guided by a relentless hive intelligence, burrowing beneath mountain roots to devour civilization.',
    traits: ['Hive Solidarity', 'Burrowing Assault', 'Acid Mandibles'],
    physiology: {
      carapaceOrSkin: 'Chitinous Exoskeleton / Carapace',
      locomotion: 'Six-Legged Arachnid Scuttler',
      sensory: 'Compound Faceted Eyes',
      lifespanYears: 40,
      metabolism: 'Devourer Biomass',
    },
    intelligenceLevel: 'arcane_network',
    societalBehavior: 'hive_collective',
    favoredBiomes: ['volcanic', 'mountains', 'desert'],
    baseAlignment: -1,
    militaryBonus: 3,
    fertilityMultiplier: 1.6,
    techAffinity: 0.85,
    color: '#e11d48', // Blood Red
  },
];

export const GENETIC_TRAIT_OPTIONS = {
  carapaceOrSkin: [
    {
      label: 'Normal Humanoid Skin (Standard Epidermis)',
      bonus: 'Balanced, versatile climate tolerance',
      desc: 'Standard flexible organic skin suited for diverse environments and general manual tool use.',
    },
    {
      label: 'Fair / Silken Epidermis',
      bonus: '+0.2 Arcane Affinity, -0.1 Sun Defense',
      desc: 'Graceful, soft skin sensitive to subtle ambient magic, traditional among high elves and forest folk.',
    },
    {
      label: 'Weathered Leathery Hide',
      bonus: '+1 Physical Defense, Sun & Wind Resilience',
      desc: 'Tough, resilient hide resistant to abrasions, thorns, and scorching sun.',
    },
    {
      label: 'Dense Fur & Subcutaneous Fat',
      bonus: 'Cold Resilience, +0.2 Military in Snow',
      desc: 'Thick insulating pelt and blubber allowing effortless endurance in freezing tundra and snowy peaks.',
    },
    {
      label: 'Thick Scaled Reptilian Plates',
      bonus: '+1 Defense, Heat & Poison Resistance',
      desc: 'Overlapping keratin scales that repel cuts, venom, and blistering heatwaves.',
    },
    {
      label: 'Chitinous Exoskeleton / Carapace',
      bonus: '+2 Military Defense, -0.2 Fertility',
      desc: 'Hardened armor plates impervious to light piercing blades and claws.',
    },
    {
      label: 'Slime-Coated Amphibious Skin',
      bonus: '+1 Swamp/Water Mobility, Retains Moisture',
      desc: 'Permeable dermal layer lubricated for submerged swimming and wetland breathing.',
    },
    {
      label: 'Basalt / Magma-Crusted Hide',
      bonus: '+2 Fire & Heat Immunity, Heavy Mass',
      desc: 'Mineralized stony skin infused with obsidian flakes and cooled lava cracks.',
    },
    {
      label: 'Silicate Crystalline Shell',
      bonus: '+1 Tech Affinity, +1 Magic Defense',
      desc: 'Resonant gem-like body capable of refracting sunlight and focusing ambient arcane currents.',
    },
    {
      label: 'Photosynthetic Epidermis',
      bonus: '+0.4 Fertility, -0.2 Military',
      desc: 'Chlorophyll-infused skin that absorbs solar radiation directly, reducing the burden for agriculture.',
    },
    {
      label: 'Bioluminescent Scales & Skin',
      bonus: '+1 Nocturnal Coordination, Glow Display',
      desc: 'Glowing organic photophores used for optical signalling, cave exploration, and intimidating predators.',
    },
    {
      label: 'Decaying / Necrotic Flesh',
      bonus: 'Immune to Bleeding, Intimidating Presence',
      desc: 'Undead desiccated tissue that feels no mortal agony, rot-resistant and ghastly to behold.',
    },
  ],
  locomotion: [
    { label: 'Normal Bipedal Gait', bonus: 'Balanced, versatile tool manipulation & endurance walking' },
    { label: 'Agile Bipedal (Graceful Stride)', bonus: '+1 Forest & Mountain Traversing, high acrobatics' },
    { label: 'Dense Stocky Bipedal', bonus: 'Low center of gravity, +1 Underground / High Ground stability' },
    { label: 'Four-Armed Polybrachial', bonus: '+1 Crafting & Mining speed, simultaneous dual weapons' },
    { label: 'Centauroid Quadruped', bonus: '+2 Overland Movement, +1 Military charge on Plains' },
    { label: 'Winged Avian / Draconic Flight', bonus: 'Airborne flight, ignores mountain and chasm travel barriers' },
    { label: 'Subterranean Burrowing Claws', bonus: '+2 Subterranean Fortification, tunnel sapping mastery' },
    { label: 'Serpentine Naga Slither', bonus: '+1 Swamp, Marsh, and River Mobility, silent movement' },
    { label: 'Six-Legged Arachnid Scuttler', bonus: 'Vertical wall-climbing, subterranean sprints across rubble' },
  ],
  sensory: [
    { label: 'Normal Trichromatic Vision', bonus: 'Standard daylight human vision, balanced depth perception' },
    { label: 'Low-Light / Twilight Vision', bonus: 'Clear sight in moonlight and dense forest canopies' },
    { label: 'Infrared Darkvision', bonus: 'Sees thermal signatures in lightless caverns and catacombs' },
    { label: 'Keen Predatory Senses & Olfactory', bonus: '+1 Wilderness tracking, detects ambushes and game' },
    { label: 'Echocrystal Sonar Resonance', bonus: 'Flawless blind echolocation, maps cave layouts by sound' },
    { label: 'Compound Faceted Eyes', bonus: '360° panoramic field of view, immune to flank ambushes' },
    { label: 'Arcane Aether-Sight', bonus: '+0.4 Tech Affinity, sees magical leylines and divine auras' },
    { label: 'Thermal Pit Organs', bonus: 'Detects prey through smoke, blizzard whiteouts, and sandstorms' },
    { label: 'Subterranean Tremorsense', bonus: 'Feels footsteps and tunnel collapses miles away through bedrock' },
    { label: 'Blind / Blindsight (Life Aura)', bonus: 'Senses living soul heat, immune to illusions and flash-blindness' },
  ],
  intelligence: [
    { id: 'scholastic', label: 'Methodical Scholastic (Normal / Academic)', bonus: '+0.4 Tech Affinity, organized statehood & academies' },
    { id: 'cunning', label: 'Shrewd Survival Cunning', bonus: '+0.3 Fertility, trap mastery & guerrilla ambushes' },
    { id: 'instinctual', label: 'Primal Instinctual Thoughts', bonus: '+2 Military Bravery, pack ferocity, -0.3 Tech' },
    { id: 'arcane_network', label: 'Telepathic Network / Hive Thoughts', bonus: '+0.5 Tech, unified civilization, zero crime' },
    { id: 'transcendent', label: 'Cosmic Transcendent Thoughts', bonus: '+0.8 Tech, +2 Alignment purity, detached from mundane fear' },
    { id: 'feral_madness', label: 'Insatiable Bloodlust (Monstrous Frenzy)', bonus: '+3 Attack, terror in battle, -0.4 Tech' },
  ] as { id: IntelligenceLevel; label: string; bonus: string }[],
  societal: [
    { id: 'feudal_monarchy', label: 'Feudal Monarchy & Chivalry', desc: 'Noble lords, royal bloodlines, knightly orders, and serfdom levies.' },
    { id: 'mercantile', label: 'Mercantile Guilds & Trade Leagues', desc: 'Powerful trade cartels, gold-backed treaties, and widespread commerce.' },
    { id: 'militaristic', label: 'Militaristic Hegemony', desc: 'Standing legions, Spartan drill discipline, and expansionist conquest.' },
    { id: 'scholarly', label: 'Arcane Academies & Magocracy', desc: 'Philosopher councils, wizard academies, and continuous scientific breakthrough.' },
    { id: 'monastic', label: 'Monastic Craft Enclaves', desc: 'Contemplative orders, monumental stonemasonry, and master metallurgy.' },
    { id: 'tribal', label: 'Totemic Clans & Chieftaincies', desc: 'Kinship ties, veneration of ancestral spirits, and fierce territorial defense.' },
    { id: 'nomadic', label: 'Nomadic Steppe Herders', desc: 'Seasonal migrations, beast taming, and lightning-fast mounted cavalry.' },
    { id: 'theocracy', label: 'Holy Theocracy & Priesthood', desc: 'Direct divine rule, grand temples, pious pilgrimages, and holy edicts.' },
    { id: 'communal_democracy', label: 'Communal Council / Direct Democracy', desc: 'Citizen assemblies, collective ownership, and egalitarian governance.' },
    { id: 'hive_collective', label: 'Brood Hive Collective', desc: 'Unified single consciousness, selfless worker castes, and brood protection.' },
    { id: 'raider_plunderers', label: 'Reaver & Corsair Enclaves', desc: 'Coastal piracy, plunder economy, and terror on the trade lanes.' },
    { id: 'anarchic_survivalist', label: 'Anarchic Wildling Packs', desc: 'Law of the claw and fang, decentralized hunting packs, and feral pride.' },
    { id: 'necrocracy', label: 'Undead Necrocracy', desc: 'Immortal lich-lords ruling obedient skeletal thralls and bone monuments.' },
    { id: 'zealous_inquisition', label: 'Zealous Crusade', desc: 'Purging rival deity cults with ruthless zeal and purifying flame.' },
  ] as { id: SocietalBehavior; label: string; desc: string }[],
  favoredBiomes: [
    { type: 'plains' as TerrainType, label: 'Fertile Plains' },
    { type: 'forest' as TerrainType, label: 'Verdant Forests' },
    { type: 'mountains' as TerrainType, label: 'High Mountains' },
    { type: 'hills' as TerrainType, label: 'Rolling Hills' },
    { type: 'desert' as TerrainType, label: 'Sun-scorched Desert' },
    { type: 'tundra' as TerrainType, label: 'Frozen Tundra' },
    { type: 'swamp' as TerrainType, label: 'Mire & Swamplands' },
    { type: 'volcanic' as TerrainType, label: 'Volcanic Crags' },
  ],
};

/**
 * Generate an evocative fantasy or monstrous species name.
 * Requirement 2: Subrace names ALWAYS feature the primary parent race in parentheses, e.g. Sandborne (Human), Woodland (Elf).
 */
export function generateSpeciesName(params: {
  category?: RaceCategory;
  isSubrace: boolean;
  parentRaceName?: string;
  biome?: TerrainType;
}): { name: string; demonym: string } {
  const { category = 'civilized', isSubrace, parentRaceName = 'Human', biome = 'plains' } = params;

  // Prefixes by biome & tone
  const biomePrefixes: Record<TerrainType, string[]> = {
    desert: ['Sandborne', 'Sun-Strider', 'Dune-Walker', 'Ash-Strider', 'Oasis-Bound', 'Solaris'],
    forest: ['Woodland', 'Deep-Wood', 'Verdant', 'Sylvathi', 'Canopy-Kin', 'Briar-Born', 'Emerald'],
    mountains: ['Iron-Peak', 'Crag-Dweller', 'Alpine', 'Stone-Born', 'Cloud-Peak', 'Granite-Heart'],
    hills: ['Highland', 'Barrow-Born', 'Rolling-Dale', 'Green-Mound', 'Hearth-Dale'],
    swamp: ['Mire-Walker', 'Bog-Born', 'Fen-Stalker', 'Sunken-Fen', 'Reed-Stalker', 'Bayou-Kin'],
    volcanic: ['Cinder-Born', 'Obsidian', 'Magma-Forged', 'Ember-Heart', 'Pyre-Kin', 'Ignis'],
    tundra: ['Frost-Born', 'Rime-Walker', 'Glacial', 'Ice-Crest', 'Blizzard-Kin', 'Boreal'],
    plains: ['Grass-Strider', 'Steppe-Born', 'Golden-Plains', 'Meadow-Kin', 'River-Dale', 'Savanna'],
    shallow_water: ['Coral-Born', 'Tide-Strider', 'Shoal-Kin', 'Pearl-Gatherer', 'Reef-Dwellers'],
    ocean: ['Abyssal', 'Tide-Born', 'Wave-Crest', 'Nautical', 'Deep-Dweller'],
    deep_ocean: ['Abyssal', 'Deep-Trench', 'Sunken-Chasm', 'Leviathan-Kin'],
  };

  const civilizedPrefixes = [
    'Aethel',
    'Dawn',
    'Sun',
    'Star',
    'Silver',
    'Golden',
    'Elder',
    'Crown',
    'High',
    'Valiant',
  ];

  const monstrousPrefixes = [
    'Blood',
    'Gorgon',
    'Skull',
    'Grim',
    'Dread',
    'Venom',
    'Iron-Fang',
    'Blight',
    'Bone',
    'Shadow',
    'Ravage',
  ];

  const aberrationPrefixes = [
    'Void',
    'Stygian',
    'Chitter',
    'Mind',
    'Eldritch',
    'Carrion',
    'Null',
    'Abyssal',
    'Grave',
  ];

  const cleanParent = parentRaceName.replace(/\s*\(.*?\)\s*/g, '').trim() || 'Mortal';

  if (isSubrace) {
    const list = biomePrefixes[biome] || biomePrefixes.plains;
    const prefix = list[Math.floor(Math.random() * list.length)];
    return {
      name: `${prefix} (${cleanParent})`,
      demonym: `${prefix} ${cleanParent}s`,
    };
  }

  // Standalone race names
  if (category === 'monstrous') {
    const prefix = monstrousPrefixes[Math.floor(Math.random() * monstrousPrefixes.length)];
    const suffixes = ['Clans', 'Tusks', 'Gnawers', 'Fiends', 'Hulks', 'Stalkers', 'Crawlers', 'Spitters'];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return {
      name: `${prefix}-${suffix}`,
      demonym: `${prefix}kin`,
    };
  }

  if (category === 'aberration') {
    const prefix = aberrationPrefixes[Math.floor(Math.random() * aberrationPrefixes.length)];
    const suffixes = ['Brood', 'Horrors', 'Spawn', 'Thralls', 'Swarm', 'Phantoms', 'Revenants'];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return {
      name: `${prefix}-${suffix}`,
      demonym: `${prefix} Spawn`,
    };
  }

  // Civilized names
  const prefix = civilizedPrefixes[Math.floor(Math.random() * civilizedPrefixes.length)];
  const suffixes = ['folk', 'kin', 'striders', 'guard', 'weavers', 'singers', 'borne'];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return {
    name: `${prefix}${suffix}`,
    demonym: `The ${prefix}${suffix}`,
  };
}

/**
 * Procedurally generate rich myth and lore anchored in the selected world location
 * and standard high-fantasy / monstrous tropes.
 */
export function generateMythAndLore(params: {
  raceName: string;
  category?: RaceCategory;
  isSubrace?: boolean;
  parentRaceName?: string;
  targetCell?: WorldCell | null;
  carapace?: string;
  locomotion?: string;
  intelligence?: IntelligenceLevel;
  societal?: SocietalBehavior;
}): string {
  const {
    raceName,
    category = 'civilized',
    isSubrace = false,
    parentRaceName = 'Ancestors',
    targetCell,
    carapace = 'Normal Humanoid Skin',
    societal = 'mercantile',
  } = params;

  const terrain = targetCell?.terrain || 'plains';
  const climate = targetCell?.climate || 'temperate';
  const resource = targetCell?.resource;
  const lat = targetCell?.lat !== undefined ? `${Math.abs(targetCell.lat).toFixed(0)}°${targetCell.lat >= 0 ? 'N' : 'S'}` : 'Equatorial';
  const lon = targetCell?.lon !== undefined ? `${Math.abs(targetCell.lon).toFixed(0)}°${targetCell.lon >= 0 ? 'E' : 'W'}` : 'Prime Meridian';

  const cleanParent = parentRaceName.replace(/\s*\(.*?\)\s*/g, '').trim();

  // Biome-specific origin narrative fragments
  const biomeTrope: Record<TerrainType, { locus: string; deityGift: string; trial: string }> = {
    desert: {
      locus: `the shimmering, wind-carved desert wastes of [${lat}, ${lon}]`,
      deityGift: 'blessed them with water-retaining resilience and sun-hardened spirits',
      trial: 'wandering endless erg dunes to uncover hidden subterranean aquifers',
    },
    forest: {
      locus: `the primordial emerald canopies and moss-draped groves near [${lat}, ${lon}]`,
      deityGift: 'imbued their souls with the whispering memory of ancient elder trees',
      trial: 'guarding sacred glades against encroaching blight and axemen',
    },
    mountains: {
      locus: `the wind-scoured granite peaks and yawning chasms around [${lat}, ${lon}]`,
      deityGift: 'granted them unyielding bones of iron and an instinct for deep subterranean delving',
      trial: 'chiseling towering citadels into the sheer vertical mountain crags',
    },
    hills: {
      locus: `the rolling highlands and mist-crested hills at [${lat}, ${lon}]`,
      deityGift: 'bestowed rich pastoral intuition and enduring hearthside craftsmanship',
      trial: 'fortifying ancient barrows and terraced valleys against wild beasts',
    },
    swamp: {
      locus: `the stagnant, fog-choked fens and sunken bayous around [${lat}, ${lon}]`,
      deityGift: 'granted immunity to marsh fevers and uncanny camouflage within murky waters',
      trial: 'scavenging primordial herbs and taming ferocious marsh behemoths',
    },
    volcanic: {
      locus: `the jagged basalt fissures and smoking caldera vents at [${lat}, ${lon}]`,
      deityGift: 'forged their hearts in primordial magma and obsidian fires',
      trial: 'harnessing subterranean thermal currents to temper invincible weaponry',
    },
    tundra: {
      locus: `the frost-locked tundra plains and biting permafrost near [${lat}, ${lon}]`,
      deityGift: 'wrapped them in thick insulating constitution and relentless winter endurance',
      trial: 'trailing migratory megafauna across howling blizzard wastes',
    },
    plains: {
      locus: `the expansive golden savannas and fertile river delta lands around [${lat}, ${lon}]`,
      deityGift: 'endowed them with boundless curiosity, swift footwork, and prolific agricultural vitality',
      trial: 'uniting disparate nomadic wagon clans into an enduring civil realm',
    },
    shallow_water: {
      locus: `the sunlit turquoise shallows and coral reefs bordering [${lat}, ${lon}]`,
      deityGift: 'gifted them effortless aquatic breathing and resonance with tidal currents',
      trial: 'navigating treacherous whirlpools and harvesting glowing aether pearls',
    },
    ocean: {
      locus: `the deep sapphire oceanic expanses surrounding [${lat}, ${lon}]`,
      deityGift: 'bestowed mastery of oceanic tempests and deep pressure adaptation',
      trial: 'defending their kelp sanctuaries from abyssal leviathans',
    },
    deep_ocean: {
      locus: `the pitch-black oceanic trenches plunging near [${lat}, ${lon}]`,
      deityGift: 'infused them with bioluminescent vision and cold-trench tenacity',
      trial: 'dwelling in absolute stillness where sunlight never pierces the abyss',
    },
  };

  const trope = biomeTrope[terrain] || biomeTrope.plains;
  const resourcePhrase = resource ? ` Drawn by mystical deposits of ${resource}, ` : ' ';

  if (isSubrace) {
    if (category === 'monstrous') {
      return `A fearsome splinter lineage of ${cleanParent}, the ${raceName} were cast out into ${trope.locus}.${resourcePhrase}Adapting with ${carapace.toLowerCase()}, they severed their old kinship to embrace savage survival and relentless territorial dominance.`;
    }
    return `An adapted offshoot of ancient ${cleanParent}, the ${raceName} migrated into ${trope.locus}.${resourcePhrase}Over generations of intimate communion with the land, their divine patrons ${trope.deityGift}, shaping them into dedicated stewards of their new homeland.`;
  }

  if (category === 'monstrous') {
    return `Spawned within ${trope.locus}, the ${raceName} emerged with terrifying predatory zeal.${resourcePhrase}Endowed with ${carapace.toLowerCase()}, their war-bands survive through ${trope.trial}, striking terror into neighbouring realms and venerating the raw, untamed forces of nature.`;
  }

  if (category === 'aberration') {
    return `Awakened through strange celestial alignments at ${trope.locus}, the ${raceName} defy ordinary mortal comprehension.${resourcePhrase}Their alien minds operate as a unified entity, driven to harvest ambient energies and remake the world according to cosmic designs.`;
  }

  // Standard civilized fantasy myth
  return `Born under the auspicious stars above ${trope.locus}, the ${raceName} arose as the first civilization of the region.${resourcePhrase}Their immortal creator ${trope.deityGift}, guiding them through the great trial of ${trope.trial} to lay the foundation stones of their eternal heritage.`;
}
