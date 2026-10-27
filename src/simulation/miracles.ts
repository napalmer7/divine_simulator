/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClimateType, CustomMiracleTemplate, TerrainType, WorldCell } from '../types/game';
import { getAdjacentCellIndices } from './worldGrid';

export const PRESET_MIRACLES: CustomMiracleTemplate[] = [
  {
    name: 'Verdant Awakening',
    description: 'A miraculous wave of vitality washes over the land, transforming barren wastes into ancient lush woodlands and multiplying mortal harvests.',
    targetType: 'region',
    terrainShift: 'forest',
    climateShift: 'temperate',
    fertilityDelta: 0.4,
    populationDeltaPct: 25,
    alignmentDelta: 1,
    vfxColor: '#10b981',
    auraName: 'Verdant Radiance',
  },
  {
    name: 'Titan\'s Crag Eruption',
    description: 'The tectonic plates shudder as towering volcanic peaks burst from the soil, rich with unmined mithril and subterranean minerals.',
    targetType: 'cell',
    terrainShift: 'volcanic',
    climateShift: 'geothermal',
    elevationShift: 0.8,
    fertilityDelta: -0.2,
    alignmentDelta: 0,
    grantTechnology: 'Deep Shaft Mining',
    vfxColor: '#f97316',
    auraName: 'Primal Pyre',
  },
  {
    name: 'Glacial Stillness',
    description: 'Freezing cosmic winds descend from the upper firmament, encasing the region in shimmering permafrost and crystalline tundras.',
    targetType: 'region',
    terrainShift: 'tundra',
    climateShift: 'arctic',
    fertilityDelta: -0.3,
    alignmentDelta: 0,
    vfxColor: '#38bdf8',
    auraName: 'Boreal Frost',
  },
  {
    name: 'Celestial Illumination',
    description: 'A column of divine radiance pierces the clouds, banishing demonic corruption, blessing the faithful, and granting profound philosophical revelations.',
    targetType: 'region',
    fertilityDelta: 0.2,
    alignmentDelta: 2,
    populationDeltaPct: 15,
    grantTechnology: 'Philosophical Academies',
    vfxColor: '#fbbf24',
    auraName: 'Hallowed Dawn',
  },
  {
    name: 'Abyssal Blight',
    description: 'A vile miasma rises from the deep chasms, corrupting settlements with forbidden dark sorceries and martial malice.',
    targetType: 'region',
    terrainShift: 'swamp',
    alignmentDelta: -2,
    grantTechnology: 'War Magic & Pyromancy',
    vfxColor: '#a855f7',
    auraName: 'Nether Taint',
  },
  {
    name: 'Solar Cleansing & Sea Genesis',
    description: 'Divine light recedes ocean waters into a fertile coastal basin, opening fresh lands for settlement.',
    targetType: 'cell',
    terrainShift: 'plains',
    elevationShift: 0.3,
    fertilityDelta: 0.5,
    alignmentDelta: 1,
    vfxColor: '#eab308',
    auraName: 'Solar Genesis',
  },
];

/**
 * Execute a custom miracle on the target world cell and surrounding region
 */
export function applyMiracle(
  cells: WorldCell[],
  centerIndex: number,
  miracle: CustomMiracleTemplate,
  radius = 1
): { updatedCells: WorldCell[]; logSummary: string } {
  const updated = [...cells];
  const affected = miracle.targetType === 'cell' ? [centerIndex] : [centerIndex, ...getAdjacentCellIndices(centerIndex, radius)];

  let totalPopShift = 0;

  for (const idx of affected) {
    const c = { ...updated[idx] };

    if (miracle.terrainShift) {
      c.terrain = miracle.terrainShift;
    }
    if (miracle.climateShift) {
      c.climate = miracle.climateShift;
    }
    if (miracle.elevationShift !== undefined) {
      c.elevation = Math.max(-1, Math.min(1, c.elevation + miracle.elevationShift));
    }
    if (miracle.fertilityDelta !== undefined) {
      c.fertility = Math.max(0, Math.min(1, c.fertility + miracle.fertilityDelta));
    }
    if (miracle.alignmentDelta !== undefined) {
      c.alignment = Math.max(-5, Math.min(5, c.alignment + miracle.alignmentDelta));
    }
    if (miracle.populationDeltaPct !== undefined && c.population > 0) {
      const delta = Math.floor(c.population * (miracle.populationDeltaPct / 100));
      c.population = Math.max(10, c.population + delta);
      totalPopShift += delta;
    }

    c.miracleAura = {
      name: miracle.auraName || miracle.name,
      color: miracle.vfxColor,
      durationRounds: 4,
      effectDescription: miracle.description,
    };

    updated[idx] = c;
  }

  const logSummary = `Invoked miracle "${miracle.name}" across ${affected.length} coordinate zones. Shifted alignment by ${
    miracle.alignmentDelta || 0
  }, altered biomes, and infused the ground with ${miracle.auraName}.`;

  return { updatedCells: updated, logSummary };
}
