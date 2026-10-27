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
