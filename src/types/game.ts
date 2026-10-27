/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AgeId = '1st_age_land' | '2nd_age_races' | '3rd_age_relations';

export interface AgeInfo {
  id: AgeId;
  name: string;
  subtitle: string;
  minRounds: number;
  yearsPerRound: number;
  description: string;
}

export const AGES: Record<AgeId, AgeInfo> = {
  '1st_age_land': {
    id: '1st_age_land',
    name: '1st Age: Age of Land',
    subtitle: 'Cosmic Genesis & Continental Shaping',
    minRounds: 5,
    yearsPerRound: 500,
    description: 'The world is young and malleable. Shaping land and climate is cheap, while creating life is an immense divine feat.',
  },
  '2nd_age_races': {
    id: '2nd_age_races',
    name: '2nd Age: Age of Races',
    subtitle: 'Awakening of Mortal Kind',
    minRounds: 5,
    yearsPerRound: 100,
    description: 'The earth has cooled. Intelligent races awaken, establish ancient homelands, and form the first great cities.',
  },
  '3rd_age_relations': {
    id: '3rd_age_relations',
    name: '3rd Age: Age of Relations',
    subtitle: 'Empires, Alliances, & Holy Wars',
    minRounds: 5,
    yearsPerRound: 25,
    description: 'Mortal nations clash and trade. Orders of knights and secret guilds rise. Shifting politics and divine rivalries determine destiny.',
  },
};

export type TerrainType =
  | 'deep_ocean'
  | 'ocean'
  | 'shallow_water'
  | 'plains'
  | 'forest'
  | 'mountains'
  | 'hills'
  | 'desert'
  | 'tundra'
  | 'swamp'
  | 'volcanic';

export type ClimateType =
  | 'arctic'
  | 'cold'
  | 'temperate'
  | 'arid'
  | 'tropical'
  | 'geothermal';

export interface WorldCell {
  index: number;
  lat: number;
  lon: number;
  terrain: TerrainType;
  elevation: number; // -1.0 (abyssal trench) to 1.0 (highest peaks)
  climate: ClimateType;
  moisture: number; // 0.0 to 1.0
  fertility: number; // 0.0 to 1.0
  resource: string | null;
  population: number;
  cityId: string | null;
  civilizationId: string | null;
  alignment: number; // -5 (blighted evil) to +5 (hallowed good), default 0
  miracleAura: {
    name: string;
    color: string;
    durationRounds: number;
    effectDescription: string;
  } | null;
}

export interface Deity {
  id: string;
  name: string;
  title: string;
  domain: string;
  symbol: string;
  isPlayer: boolean;
  power: number;
  thriftBonus: number; // +1 per turn ending with <= 5 points (max +3)
  lastRoll: [number, number];
  personality: {
    aggression: number; // 0.0 to 1.0
    harmony: number;
    expansion: number;
    curiosity: number;
  };
  color: string;
  avatarId: string | null;
  relationships: Record<string, number>; // -100 (mortal rival) to +100 (devoted ally)
  myth?: string;
  historicalGoals?: string[];
  ethos?: string;
}

export interface RacePhysiology {
  carapaceOrSkin: string;
  locomotion: string;
  sensory: string;
  lifespanYears: number;
  metabolism: string;
}

export type RaceCategory = 'civilized' | 'monstrous' | 'aberration';

export type IntelligenceLevel =
  | 'instinctual'
  | 'cunning'
  | 'scholastic'
  | 'arcane_network'
  | 'transcendent'
  | 'feral_madness';

export type SocietalBehavior =
  | 'nomadic'
  | 'militaristic'
  | 'monastic'
  | 'mercantile'
  | 'tribal'
  | 'scholarly'
  | 'zealous_inquisition'
  | 'feudal_monarchy'
  | 'theocracy'
  | 'communal_democracy'
  | 'hive_collective'
  | 'raider_plunderers'
  | 'anarchic_survivalist'
  | 'necrocracy';

export interface Race {
  id: string;
  name: string;
  demonym: string;
  creatorDeityId: string;
  parentRaceId: string | null;
  category?: RaceCategory;
  description: string;
  traits: string[];
  physiology: RacePhysiology;
  intelligenceLevel: IntelligenceLevel;
  societalBehavior: SocietalBehavior;
  favoredBiomes: TerrainType[];
  baseAlignment: number; // -1 evil, 0 neutral, +1 good
  militaryBonus: number;
  fertilityMultiplier: number;
  techAffinity: number;
  color: string;
}

export interface City {
  id: string;
  name: string;
  civilizationId: string;
  raceId: string;
  creatorDeityId: string;
  cellIndex: number;
  lat: number;
  lon: number;
  population: number;
  defense: number; // Walls / fortification level
  wonders: string[];
  armiesStationed: number;
  alignment: number;
  wealth: number;
  status: 'prospering' | 'defensive' | 'under_siege' | 'ruined';
}

export interface Civilization {
  id: string;
  name: string;
  raceId: string;
  creatorDeityId: string;
  capitalCityId: string;
  cityIds: string[];
  technologies: string[]; // e.g. "Runecraft", "Steel Smithing", "High Agriculture"
  orders: string[];
  alignment: number;
  diplomacy: Record<string, 'allied' | 'peace' | 'tensions' | 'war'>;
  color: string;
}

export interface Army {
  id: string;
  name: string;
  civilizationId: string;
  creatorDeityId: string;
  cityOriginId: string;
  cellIndex: number;
  lat: number;
  lon: number;
  targetCellIndex: number | null;
  targetCityId: string | null;
  strength: number;
  consecutiveBattles: number;
}

export interface Avatar {
  id: string;
  name: string;
  title: string;
  deityId: string;
  cellIndex: number;
  lat: number;
  lon: number;
  isAlive: boolean;
  actionsThisTurn: number;
  description: string;
}

export interface OrderItem {
  id: string;
  name: string;
  type: 'religious_sect' | 'knightly_order' | 'thieves_guild' | 'scholars' | 'druidic_circle';
  creatorDeityId: string;
  civilizationId: string;
  cityId: string;
  description: string;
  renown: number;
}

export interface TradeRoute {
  id: string;
  cityAId: string;
  cityBId: string;
  goods: string;
  volume: number;
  color: string;
}

export interface TerritorialConflict {
  id: string;
  civilizationAId: string;
  civilizationBId: string;
  cellIndex: number;
  lat: number;
  lon: number;
  cause: 'resource_scarcity' | 'divine_rivalry' | 'expansion' | 'holy_war';
  description: string;
  intensity: number; // 1 to 5
}

export interface HistoryLogEntry {
  id: string;
  age: AgeId;
  round: number;
  year: number;
  deityId: string;
  deityName: string;
  deityColor: string;
  actionType: string;
  cost: number;
  title: string;
  description: string;
  impact: string;
  category: 'creation' | 'life' | 'civilization' | 'conflict' | 'miracle' | 'avatar';
}

export interface CustomMiracleTemplate {
  name: string;
  description: string;
  targetType: 'cell' | 'region' | 'civilization' | 'global';
  terrainShift?: TerrainType;
  climateShift?: ClimateType;
  elevationShift?: number;
  fertilityDelta?: number;
  alignmentDelta?: number;
  populationDeltaPct?: number;
  grantTechnology?: string;
  vfxColor: string;
  auraName: string;
}

export type MapViewMode =
  | 'physical'
  | 'climate'
  | 'political'
  | 'population'
  | 'trade'
  | 'conflicts'
  | 'resources';

export type WorldStructureType =
  | 'continental'
  | 'pangea'
  | 'archipelago'
  | 'shattered'
  | 'waterworld';

export interface SavedGameSlot {
  id: string;
  saveName: string;
  timestamp: number;
  saveDateFormatted: string;
  age: AgeId;
  round: number;
  year: number;
  playerDeityName: string;
  playerDeityTitle: string;
  deityCount: number;
  worldStructure: WorldStructureType;
  cells: WorldCell[];
  cities: City[];
  civilizations: Civilization[];
  races: Race[];
  armies: Army[];
  avatars: Avatar[];
  orders: OrderItem[];
  tradeRoutes: TradeRoute[];
  conflicts: TerritorialConflict[];
  deities: Deity[];
  turnOrder: string[];
  activeDeityIndex: number;
  history: HistoryLogEntry[];
  mapViewMode: MapViewMode;
  is3DMode: boolean;
}
