/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { City, Civilization, Deity, Race, TerritorialConflict, TradeRoute, WorldCell } from '../types/game';
import { getAdjacentCellIndices } from './worldGrid';

/**
 * Updates mortal populations and demographic pressure across the globe
 */
export function simulatePopulationAndGrowth(
  cells: WorldCell[],
  cities: City[],
  civilizations: Civilization[],
  races: Race[]
): { updatedCells: WorldCell[]; updatedCities: City[] } {
  const cellMap = new Map<number, WorldCell>(cells.map((c) => [c.index, { ...c }]));
  const updatedCities = cities.map((city) => {
    const civ = civilizations.find((c) => c.id === city.civilizationId);
    const race = races.find((r) => r.id === city.raceId);
    const cell = cellMap.get(city.cellIndex);

    let growthRate = 0.05; // 5% base growth per round
    if (cell) {
      growthRate += cell.fertility * 0.08;
      if (cell.terrain === 'plains' || cell.terrain === 'forest') growthRate += 0.03;
      if (cell.terrain === 'desert' || cell.terrain === 'tundra') growthRate -= 0.04;
    }

    if (civ?.technologies.includes('High Agriculture & Granaries')) {
      growthRate += 0.05;
    }
    if (civ?.technologies.includes('Aqueducts & Hydrology')) {
      growthRate += 0.04;
    }

    if (race) {
      growthRate *= race.fertilityMultiplier;
    }

    // Status impact
    if (city.status === 'under_siege') growthRate = -0.1;
    if (city.status === 'ruined') growthRate = -0.05;

    const newPop = Math.max(20, Math.floor(city.population * (1 + growthRate)));
    const wealthDelta = Math.floor(newPop / 80) + (cell?.resource ? 5 : 0);

    // Update cell population
    if (cell) {
      cell.population = newPop;
    }

    return {
      ...city,
      population: newPop,
      wealth: city.wealth + wealthDelta,
    };
  });

  return {
    updatedCells: Array.from(cellMap.values()),
    updatedCities,
  };
}

/**
 * Calculates dynamic trade routes between flourishing cities
 */
export function calculateTradeRoutes(
  cities: City[],
  civilizations: Civilization[],
  cells: WorldCell[]
): TradeRoute[] {
  const routes: TradeRoute[] = [];
  const processedPairs = new Set<string>();

  for (let i = 0; i < cities.length; i++) {
    for (let j = i + 1; j < cities.length; j++) {
      const cityA = cities[i];
      const cityB = cities[j];

      const pairKey = [cityA.id, cityB.id].sort().join('-');
      if (processedPairs.has(pairKey)) continue;
      processedPairs.add(pairKey);

      // Check diplomatic stance
      const civA = civilizations.find((c) => c.id === cityA.civilizationId);
      const civB = civilizations.find((c) => c.id === cityB.civilizationId);
      if (!civA || !civB) continue;

      const isHostile = civA.diplomacy[civB.id] === 'war' || civB.diplomacy[civA.id] === 'war';
      if (isHostile) continue;

      // Distance on globe
      const dLat = cityA.lat - cityB.lat;
      const dLon = Math.abs(cityA.lon - cityB.lon);
      const wrappedLon = Math.min(dLon, 360 - dLon);
      const distance = Math.hypot(dLat, wrappedLon);

      // Trade range: up to 70 degrees
      if (distance < 70) {
        const cellA = cells[cityA.cellIndex];
        const cellB = cells[cityB.cellIndex];

        let good = 'Grain & Timber';
        if (cellA?.resource || cellB?.resource) {
          good = `${cellA?.resource || 'Artisan Goods'} ⇄ ${cellB?.resource || 'Fine Silks'}`;
        }

        const volume = Math.floor((cityA.population + cityB.population) / 250);

        routes.push({
          id: `trade_${cityA.id}_${cityB.id}`,
          cityAId: cityA.id,
          cityBId: cityB.id,
          goods: good,
          volume: Math.max(1, volume),
          color: civA.id === civB.id ? '#38bdf8' : '#fbbf24', // Cyan domestic, gold international
        });
      }
    }
  }

  return routes;
}

/**
 * Detects emerging geopolitical friction and territorial conflicts due to borders & resource competition
 */
export function detectTerritorialFriction(
  cells: WorldCell[],
  cities: City[],
  civilizations: Civilization[],
  deities: Deity[]
): TerritorialConflict[] {
  const conflicts: TerritorialConflict[] = [];

  for (const city of cities) {
    const adj = getAdjacentCellIndices(city.cellIndex, 2);
    const civA = civilizations.find((c) => c.id === city.civilizationId);
    if (!civA) continue;

    for (const neighborIdx of adj) {
      const neighborCell = cells[neighborIdx];
      if (neighborCell && neighborCell.cityId && neighborCell.cityId !== city.id) {
        const neighborCity = cities.find((c) => c.id === neighborCell.cityId);
        if (neighborCity && neighborCity.civilizationId !== city.civilizationId) {
          const civB = civilizations.find((c) => c.id === neighborCity.civilizationId);
          if (!civB) continue;

          // Check if already in war or high tension
          const stance = civA.diplomacy[civB.id];
          const hasValuableResource = Boolean(neighborCell.resource || cells[city.cellIndex].resource);

          let intensity = 1;
          let cause: 'resource_scarcity' | 'divine_rivalry' | 'expansion' | 'holy_war' = 'expansion';

          const deityA = deities.find((d) => d.id === civA.creatorDeityId);
          const deityB = deities.find((d) => d.id === civB.creatorDeityId);

          if (deityA && deityB && deityA.relationships[deityB.id] < -30) {
            cause = 'divine_rivalry';
            intensity = 4;
          } else if (hasValuableResource) {
            cause = 'resource_scarcity';
            intensity = 3;
          } else if (Math.abs(civA.alignment - civB.alignment) >= 3) {
            cause = 'holy_war';
            intensity = 4;
          }

          if (stance === 'war') intensity = 5;

          const conflictId = `conflict_${[civA.id, civB.id].sort().join('_')}_${city.cellIndex}`;
          if (!conflicts.some((c) => c.id === conflictId)) {
            conflicts.push({
              id: conflictId,
              civilizationAId: civA.id,
              civilizationBId: civB.id,
              cellIndex: city.cellIndex,
              lat: city.lat,
              lon: city.lon,
              cause,
              description: `Border tension between ${civA.name} and ${civB.name} over fertile territory and ${cause.replace('_', ' ')}.`,
              intensity,
            });
          }
        }
      }
    }
  }

  return conflicts;
}

export interface TerritoryExpansionResult {
  updatedCells: WorldCell[];
  updatedCities: City[];
  updatedCivilizations: Civilization[];
  narratives: string[];
}

/**
 * Natural territory expansion and settlement founding in the 2nd and 3rd Age
 * based on each race's procreation rate and settlement inclinations.
 */
export function simulateTerritoryExpansionAndSettlements(
  cells: WorldCell[],
  cities: City[],
  civilizations: Civilization[],
  races: Race[],
  currentAge: string,
  currentRound: number
): TerritoryExpansionResult {
  if (currentAge === '1st_age_land') {
    return {
      updatedCells: cells,
      updatedCities: cities,
      updatedCivilizations: civilizations,
      narratives: [],
    };
  }

  const cellMap = new Map<number, WorldCell>(cells.map((c) => [c.index, { ...c }]));
  const updatedCities = [...cities];
  const updatedCivs = civilizations.map((c) => ({ ...c, cityIds: [...c.cityIds] }));
  const narratives: string[] = [];

  for (const civ of updatedCivs) {
    const race = races.find((r) => r.id === civ.raceId);
    if (!race) continue;

    const procreation = race.procreationRate || race.fertilityMultiplier || 1.0;
    const expansion = race.expansionInclination || 0.5;
    const settlementTendency = race.settlementTendency || 0.5;
    const hasWonderAffinity = Boolean(race.naturalWonderAffinity);

    // 1. Gather all territory cells currently claimed by this civilization
    const territoryIndices = Array.from(cellMap.values())
      .filter((c) => c.civilizationId === civ.id)
      .map((c) => c.index);

    if (territoryIndices.length === 0) continue;

    // 2. Identify candidate adjacent unowned land cells
    const candidateIndices = new Set<number>();
    for (const tIdx of territoryIndices) {
      const neighbors = getAdjacentCellIndices(tIdx, 1);
      for (const nIdx of neighbors) {
        const neighbor = cellMap.get(nIdx);
        if (neighbor && neighbor.elevation > 0 && !neighbor.civilizationId) {
          candidateIndices.add(nIdx);
        }
      }
    }

    // Number of cells this civ can expand into this round
    const maxExpansionCells = Math.max(1, Math.floor(procreation * expansion * 2.2));
    const scoredCandidates: { index: number; score: number }[] = [];

    for (const cIdx of candidateIndices) {
      const cell = cellMap.get(cIdx)!;
      let score = 1;

      // Favored biomes
      if (race.favoredBiomes.includes(cell.terrain)) score += 3;
      // Fertility bonus
      score += cell.fertility * 2.5;

      // Natural wonder / sacred grove affinity
      if (hasWonderAffinity && (cell.resource === 'Sacred Grove Springs' || cell.resource === 'Arcane Mana Springs')) {
        score += 8;
      } else if (cell.resource) {
        score += 2;
      }

      // Aggressive warlike bonus (Orcs/Goblins)
      if (expansion > 0.7) {
        score += 2.5;
      }

      scoredCandidates.push({ index: cIdx, score });
    }

    scoredCandidates.sort((a, b) => b.score - a.score);
    const chosenCells = scoredCandidates.slice(0, maxExpansionCells);

    for (const choice of chosenCells) {
      const cell = cellMap.get(choice.index)!;
      cell.civilizationId = civ.id;
      cell.population = Math.max(25, Math.floor(40 * procreation));
    }

    if (chosenCells.length > 0) {
      narratives.push(
        `${civ.name} (${race.name}) naturally expanded territory across ${chosenCells.length} frontier zones (Procreation: ${procreation.toFixed(1)}x, Expansion: ${expansion > 0.7 ? 'Aggressive' : expansion < 0.3 ? 'Reclusive' : 'Steady'}).`
      );
    }

    // 3. Natural Settlement Creation based on racial tendencies
    const currentCityCount = updatedCities.filter((c) => c.civilizationId === civ.id).length;
    const currentTerritorySize = Array.from(cellMap.values()).filter((c) => c.civilizationId === civ.id).length;

    // Threshold calculation
    const territoryThreshold = Math.max(4, Math.floor(currentCityCount * (1.8 / Math.max(0.2, settlementTendency))));

    let shouldFoundSettlement = false;
    let targetSettlementIdx: number | null = null;

    if (currentTerritorySize >= territoryThreshold) {
      const potentialCells = Array.from(cellMap.values()).filter(
        (c) => c.civilizationId === civ.id && !c.cityId && c.elevation > 0
      );

      if (hasWonderAffinity) {
        // Elves: search strictly for sacred wonder or high fertility grove
        const wonderCell = potentialCells.find(
          (c) => c.resource === 'Sacred Grove Springs' || c.resource === 'Arcane Mana Springs' || (c.terrain === 'forest' && c.fertility > 0.75)
        );
        if (wonderCell && Math.random() < 0.6) {
          shouldFoundSettlement = true;
          targetSettlementIdx = wonderCell.index;
        }
      } else {
        if (potentialCells.length > 0) {
          potentialCells.sort((a, b) => (b.fertility + (b.resource ? 0.4 : 0)) - (a.fertility + (a.resource ? 0.4 : 0)));
          const roll = Math.random();
          if (roll < settlementTendency * 0.75) {
            shouldFoundSettlement = true;
            targetSettlementIdx = potentialCells[0].index;
          }
        }
      }
    }

    if (shouldFoundSettlement && targetSettlementIdx !== null) {
      const site = cellMap.get(targetSettlementIdx)!;
      const namingSuffixes =
        race.category === 'monstrous'
          ? ['War-Camp', 'Garrison', 'Redoubt', 'Den', 'Bastion']
          : race.naturalWonderAffinity
          ? ['Sanctuary', 'Grove-Haven', 'Spire', 'Bower']
          : ['Town', 'Hold', 'Settlement', 'Port', 'Burgh'];
      const suffix = namingSuffixes[Math.floor(Math.random() * namingSuffixes.length)];
      const settlementName = `${civ.name.split(' ')[0]} ${suffix}`;

      const newCity: City = {
        id: `city_${civ.id}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name: settlementName,
        civilizationId: civ.id,
        raceId: race.id,
        creatorDeityId: civ.creatorDeityId,
        cellIndex: targetSettlementIdx,
        lat: site.lat,
        lon: site.lon,
        population: Math.floor(180 * procreation),
        defense: 1,
        wonders: [],
        armiesStationed: 0,
        alignment: race.baseAlignment,
        wealth: 10,
        status: 'prospering',
      };

      site.cityId = newCity.id;
      site.population = newCity.population;
      updatedCities.push(newCity);
      civ.cityIds.push(newCity.id);

      narratives.push(
        `${civ.name} founded the new ${suffix.toLowerCase()} of ${settlementName} at [${site.lat.toFixed(0)}°, ${site.lon.toFixed(0)}°] based on their ${race.name} settlement inclination.`
      );
    }
  }

  // 4. Check Ruined Cities: Chance to spawn Monstrous Hordes if abandoned for too long
  for (const city of updatedCities) {
    if (city.status === 'ruined') {
      const cell = cellMap.get(city.cellIndex);
      if (cell && Math.random() < 0.25) {
        narratives.push(
          `Eerie shadows stir in the abandoned ruins of ${city.name}—monstrous scavengers and feral abominations gather amidst the broken battlements.`
        );
      }
    }
  }

  return {
    updatedCells: Array.from(cellMap.values()),
    updatedCities,
    updatedCivilizations: updatedCivs,
    narratives,
  };
}
