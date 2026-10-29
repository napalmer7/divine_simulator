/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AgeId,
  City,
  Civilization,
  Deity,
  HistoryLogEntry,
  Race,
  TerrainType,
  WorldCell,
} from '../types/game';
import { generateCoatOfArms } from './heraldry';

export interface MonstrousArchetype {
  id: string;
  name: string;
  demonym: string;
  favoredBiomes: TerrainType[];
  requiresArcticOrVolcanic?: boolean;
  isSwampOnly?: boolean;
  traits: string[];
  description: string;
  baseAlignment: number;
  color: string;
  lairPrefixes: string[];
  civNameTemplates: string[];
}

export const MONSTROUS_ARCHETYPES: MonstrousArchetype[] = [
  {
    id: 'goblins',
    name: 'Goblins',
    demonym: 'Goblinoid',
    favoredBiomes: ['mountains', 'hills', 'plains', 'forest'],
    traits: ['Subterranean Tunnels', 'Cunning Scavengers', 'Swarm Tactics', 'Covetous Hoarders'],
    description:
      'Spawned in jagged crevices and dense thickets, these wiry, sharp-eared cunning scavengers multiply with startling speed, fashioning scrap weapons and digging labyrinthine warrens.',
    baseAlignment: -1,
    color: '#22c55e',
    lairPrefixes: ['Rustpeak Warrens', 'Scrapfang Den', 'Grizzlegut Burrow', 'Cragtooth Hollow'],
    civNameTemplates: ['Rustpeak Goblin Clan', 'The Scrapfang Warrens', 'Grizzlegut Under-Horde'],
  },
  {
    id: 'orcs',
    name: 'Orcs',
    demonym: 'Orcish',
    favoredBiomes: ['mountains', 'hills', 'plains', 'forest'],
    traits: ['Brutal Bloodrage', 'Warlord Honor', 'Heavy Iron Smithing', 'Fearless Raiding'],
    description:
      'Towering, muscular warriors forged in rugged uplands and untamed forests. Reverent of raw martial strength, they erect spiked bastions and follow ferocious warchiefs.',
    baseAlignment: -1,
    color: '#84cc16',
    lairPrefixes: ['Ironfang Redoubt', 'Bloodpeak Bastion', 'Gorgoroth Stronghold', 'Skullcrag Keep'],
    civNameTemplates: ['Ironfang Orcish Horde', 'Bloodpeak War-Clans', 'The Gorgoroth War-Host'],
  },
  {
    id: 'kobolds',
    name: 'Kobolds',
    demonym: 'Kobold',
    favoredBiomes: ['mountains', 'volcanic'],
    traits: ['Obsidian Trapcraft', 'Draconic Reverence', 'Subterranean Deep-Mining', 'Pack Synergy'],
    description:
      'Reptilian subterranean humanoids dwelling inside geothermal fissures and jagged mountain roots. Fanatical trapcrafters who worship dormant magma conduits and ancient dragons.',
    baseAlignment: -1,
    color: '#f97316',
    lairPrefixes: ['Cinderclaw Warren', 'Ashvein Tunnels', 'Dracospire Burrows', 'Magma-Tooth Lair'],
    civNameTemplates: ['Cinderclaw Kobold Warrens', 'The Ashvein Brood', 'Dracospire Kobold Clan'],
  },
  {
    id: 'dragons',
    name: 'Primordial Dragons',
    demonym: 'Draconic',
    favoredBiomes: ['mountains', 'volcanic'],
    requiresArcticOrVolcanic: true, // Mountains, Volcanic, or Arctic
    traits: ['Apex Primordial Dread', 'Incinerating Elemental Breath', 'Immortal Hoarders', 'Ancient Flying Sovereigns'],
    description:
      'Colossal apex serpents hatched from elemental cataclysms upon razor-sharp volcanic peaks and frozen glacial crags. Their terrifying roars bend lesser beasts to their tyrannical will.',
    baseAlignment: -2,
    color: '#ef4444',
    lairPrefixes: ['Drakon-Tor Caldera', 'Wyrmfang Spire', 'Frostfire Aerie', 'Brimstone Roost'],
    civNameTemplates: ['The Primordial Dragonflight', 'Sovereigns of Drakon-Tor', 'The Wyrmfang Brood'],
  },
  {
    id: 'troglodytes',
    name: 'Troglodytes',
    demonym: 'Troglodytic',
    favoredBiomes: ['swamp'],
    isSwampOnly: true,
    traits: ['Noxious Musk Stench', 'Blind-Sense Vibration', 'Mud-Lurkers', 'Subterranean Mire Stride'],
    description:
      'Pale, subterranean reptilian mud-dwellers born in stagnant mires and subterranean quagmires. Emitting a paralyzing stench musk, they drag unwary travelers into sunless pits.',
    baseAlignment: -2,
    color: '#0d9488',
    lairPrefixes: ['Gloom-Fen Caverns', 'Murkwater Deep-Lair', 'Blight-Mire Hollows', 'Rotbog Pit'],
    civNameTemplates: ['Gloom-Fen Troglodyte Brood', 'The Murkwater Swarm', 'Blight-Mire Denizens'],
  },
];

/**
 * Checks whether a cell satisfies the thematic location requirements for a monstrous race
 */
export function isThematicCellForMonstrousRace(cell: WorldCell, archetype: MonstrousArchetype): boolean {
  if (cell.elevation <= 0 || cell.terrain === 'ocean' || cell.terrain === 'deep_ocean' || cell.terrain === 'shallow_water') {
    return false;
  }

  if (archetype.id === 'troglodytes') {
    // Marsh / swamp or heavy wetland lowlands
    return cell.terrain === 'swamp' || (cell.moisture >= 0.7 && cell.elevation < 0.3);
  }

  if (archetype.id === 'dragons') {
    // Mountains, Volcanic, or Arctic climate
    return (
      cell.terrain === 'mountains' ||
      cell.terrain === 'volcanic' ||
      cell.climate === 'arctic'
    );
  }

  if (archetype.id === 'kobolds') {
    // Mountains or Volcanic
    return cell.terrain === 'mountains' || cell.terrain === 'volcanic';
  }

  if (archetype.id === 'goblins' || archetype.id === 'orcs') {
    // Mountains, Hills, Plains, or Forests
    return ['mountains', 'hills', 'plains', 'forest'].includes(cell.terrain);
  }

  return archetype.favoredBiomes.includes(cell.terrain);
}

export interface MonstrousSpawnResult {
  spawned: boolean;
  newRace?: Race;
  newCity?: City;
  newCiv?: Civilization;
  updatedCells?: WorldCell[];
  logEntry?: HistoryLogEntry;
}

/**
 * Rolls for natural spontaneous awakening of a monstrous race during the Age of Races
 */
export function checkAndSpawnMonstrousRace({
  cells,
  cities,
  civilizations,
  races,
  round,
  year,
  currentAge,
  monstrousSpawnChance = 10,
  deities,
}: {
  cells: WorldCell[];
  cities: City[];
  civilizations: Civilization[];
  races: Race[];
  round: number;
  year: number;
  currentAge: AgeId;
  monstrousSpawnChance: number;
  deities: Deity[];
}): MonstrousSpawnResult {
  // Only occurs during the Age of Races
  if (currentAge !== '2nd_age_races') {
    return { spawned: false };
  }

  // Roll against percentage chance (e.g. 10% = 0.10)
  const roll = Math.random() * 100;
  if (roll > monstrousSpawnChance) {
    return { spawned: false };
  }

  // Prioritize archetypes that don't exist yet, or pick random
  const existingRaceNames = new Set(races.map((r) => r.name.toLowerCase()));
  const unspawned = MONSTROUS_ARCHETYPES.filter(
    (a) => !existingRaceNames.has(a.name.toLowerCase())
  );
  const candidates = unspawned.length > 0 ? unspawned : MONSTROUS_ARCHETYPES;

  // Shuffle candidates
  const shuffledCandidates = [...candidates].sort(() => Math.random() - 0.5);

  for (const archetype of shuffledCandidates) {
    // Find all suitable cells for this monster archetype
    const suitableCells = cells.filter((c) => isThematicCellForMonstrousRace(c, archetype));
    if (suitableCells.length === 0) continue;

    // Prefer unoccupied wild cells without existing cities
    const wildSuitableCells = suitableCells.filter((c) => !c.cityId && !c.civilizationId);
    const targetCell =
      wildSuitableCells.length > 0
        ? wildSuitableCells[Math.floor(Math.random() * wildSuitableCells.length)]
        : suitableCells[Math.floor(Math.random() * suitableCells.length)];

    // Choose creator deity: wild chaotic/earth deity or primordial nature
    const chaoticDeity =
      deities.find((d) => !d.isPlayer && d.personality.aggression > 0.6) ||
      deities.find((d) => !d.isPlayer) ||
      deities[0];

    const timestamp = Date.now();
    const raceId = `race_monstrous_${archetype.id}_${timestamp}`;
    const cityId = `city_monstrous_${archetype.id}_${timestamp}`;
    const civId = `civ_monstrous_${archetype.id}_${timestamp}`;

    const lairName =
      archetype.lairPrefixes[Math.floor(Math.random() * archetype.lairPrefixes.length)];
    const civName =
      archetype.civNameTemplates[Math.floor(Math.random() * archetype.civNameTemplates.length)];

    const newRace: Race = {
      id: raceId,
      name: archetype.name,
      demonym: archetype.demonym,
      creatorDeityId: chaoticDeity.id,
      parentRaceId: null,
      category: 'monstrous',
      description: archetype.description,
      traits: archetype.traits,
      physiology: {
        carapaceOrSkin:
          archetype.id === 'dragons'
            ? 'Diamond-Hard Elemental Scales'
            : archetype.id === 'kobolds'
            ? 'Geothermal Scaled Hide'
            : archetype.id === 'troglodytes'
            ? 'Slime-Coated Wetland Skin'
            : 'Toughened Leathery Epidermis',
        locomotion: archetype.id === 'dragons' ? 'Winged Flight & Quadrupedal Stride' : 'Bipedal',
        sensory: archetype.id === 'troglodytes' ? 'Blind-Sense & Tremor Perception' : 'Darkvision',
        lifespanYears: archetype.id === 'dragons' ? 2500 : archetype.id === 'goblins' ? 45 : 120,
        metabolism: archetype.id === 'dragons' ? 'Elemental Flame Conduit' : 'Omnivorous / Scavenger',
      },
      intelligenceLevel: archetype.id === 'dragons' ? 'transcendent' : archetype.id === 'kobolds' ? 'cunning' : 'feral_madness',
      societalBehavior: archetype.id === 'dragons' ? 'feudal_monarchy' : archetype.id === 'orcs' ? 'militaristic' : 'raider_plunderers',
      favoredBiomes: archetype.favoredBiomes,
      baseAlignment: archetype.baseAlignment,
      militaryBonus: archetype.id === 'dragons' ? 4 : archetype.id === 'orcs' ? 2 : 1,
      fertilityMultiplier: archetype.id === 'goblins' ? 1.5 : archetype.id === 'dragons' ? 0.4 : 1.0,
      procreationRate: archetype.id === 'goblins' ? 2.0 : archetype.id === 'dragons' ? 0.6 : 1.2,
      expansionInclination: archetype.id === 'orcs' ? 0.9 : archetype.id === 'dragons' ? 0.8 : 0.6,
      settlementTendency: archetype.id === 'dragons' ? 0.2 : archetype.id === 'goblins' ? 0.8 : 0.5,
      naturalWonderAffinity: archetype.id === 'dragons',
      techAffinity: archetype.id === 'kobolds' ? 2 : 1,
      color: archetype.color,
    };

    const coatOfArms = generateCoatOfArms(civName, newRace, archetype.color);

    const newCiv: Civilization = {
      id: civId,
      name: civName,
      raceId,
      creatorDeityId: chaoticDeity.id,
      capitalCityId: cityId,
      cityIds: [cityId],
      technologies: archetype.id === 'dragons' ? ['Arcane Runecraft', 'Draconic Flight Lore'] : ['Tribal Totems', 'Scrap Metal Smithing'],
      orders: [],
      alignment: archetype.baseAlignment,
      diplomacy: {},
      color: archetype.color,
      coatOfArms,
    };

    const newCity: City = {
      id: cityId,
      name: lairName,
      civilizationId: civId,
      raceId,
      creatorDeityId: chaoticDeity.id,
      cellIndex: targetCell.index,
      lat: targetCell.lat,
      lon: targetCell.lon,
      population: archetype.id === 'dragons' ? 60 : archetype.id === 'goblins' ? 350 : 180,
      defense: archetype.id === 'dragons' ? 4 : 2,
      wonders: [],
      armiesStationed: archetype.id === 'dragons' ? 1 : 0,
      alignment: archetype.baseAlignment,
      wealth: archetype.id === 'dragons' ? 150 : 25,
      status: 'prospering',
    };

    const updatedCells = cells.map((c) =>
      c.index === targetCell.index
        ? {
            ...c,
            cityId,
            civilizationId: civId,
            population: newCity.population,
            alignment: archetype.baseAlignment,
          }
        : c
    );

    const logEntry: HistoryLogEntry = {
      id: `monster_birth_${timestamp}`,
      age: currentAge,
      round,
      year,
      deityId: chaoticDeity.id,
      deityName: 'The Primordial Depths',
      deityColor: archetype.color,
      actionType: 'Natural Awakening',
      cost: 0,
      title: `Primordial Terror: The Awakening of the ${archetype.name}!`,
      description: `Deep in the untamed wilderness of [${targetCell.lat.toFixed(0)}°, ${targetCell.lon.toFixed(0)}°] (${targetCell.terrain.replace('_', ' ')}), the primordial darkness stirred. The ferocious ${archetype.name} have naturally emerged and established their stronghold at ${lairName}.`,
      impact: `A monstrous civilization (${civName}) now threatens the mortal balance of the world.`,
      category: 'life',
    };

    return {
      spawned: true,
      newRace,
      newCity,
      newCiv,
      updatedCells,
      logEntry,
    };
  }

  return { spawned: false };
}
