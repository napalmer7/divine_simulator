/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AgeId, Army, Avatar, City, Civilization, Deity, HistoryLogEntry, OrderItem, Race, WorldCell } from '../types/game';
import { AVAILABLE_TECHNOLOGIES, DAWN_OF_WORLDS_COSTS } from './dawnOfWorldsRules';
import { PRESET_RACES } from './races';
import { applyTerrainModification, getAdjacentCellIndices } from './worldGrid';

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
    },
  },
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
    },
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
    },
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
    },
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
    },
  },
];

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
