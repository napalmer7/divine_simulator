/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClimateType, TerrainType, WorldCell } from '../types/game';

export const GRID_ROWS = 24; // Latitude divisions (-80 to +80)
export const GRID_COLS = 48; // Longitude divisions (-180 to +180)
export const TOTAL_CELLS = GRID_ROWS * GRID_COLS; // 1,152 cells

export const RESOURCES_LIST = [
  'Iron Ore Deposits',
  'Deep Gold Veins',
  'Mithril Lode',
  'Arcane Mana Springs',
  'Ancient Stone Quarry',
  'Fertile River Delta',
  'Dense Timber Groves',
  'Gemstone Caverns',
  'Silver Outcrops',
  'Sacred Grove Springs',
];

/**
 * Convert lat/lon in degrees to spherical 3D coordinates on a sphere of radius R
 */
export function latLonToVector3(latDeg: number, lonDeg: number, radius = 1): [number, number, number] {
  const phi = (90 - latDeg) * (Math.PI / 180);
  const theta = (lonDeg + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return [x, y, z];
}

/**
 * Direct exact conversion from cellIndex to 3D spherical coordinates matching Three.js SphereGeometry
 */
export function cellIndexToVector3(cellIndex: number, radius = 1): [number, number, number] {
  const r = Math.floor(cellIndex / GRID_COLS);
  const c = cellIndex % GRID_COLS;
  const u = (c + 0.5) / GRID_COLS;
  const v = (r + 0.5) / GRID_ROWS;

  const phi = v * Math.PI;
  const theta = u * 2 * Math.PI;

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return [x, y, z];
}

/**
 * Determine climate based on latitude and moisture
 */
export function computeClimate(lat: number, moisture: number): ClimateType {
  const absLat = Math.abs(lat);
  if (absLat > 65) return 'arctic';
  if (absLat > 45) return 'cold';
  if (absLat < 20) {
    return moisture > 0.4 ? 'tropical' : 'arid';
  }
  return moisture < 0.25 ? 'arid' : 'temperate';
}

/**
 * Determine terrain based on elevation, moisture, and climate
 */
export function computeTerrain(elevation: number, moisture: number, climate: ClimateType): TerrainType {
  if (elevation < -0.35) return 'deep_ocean';
  if (elevation < 0.0) return 'shallow_water';
  if (elevation > 0.7) return 'mountains';
  if (elevation > 0.45) return 'hills';

  if (climate === 'arctic') return 'tundra';
  if (climate === 'arid') return 'desert';

  if (moisture > 0.65) {
    return climate === 'tropical' ? 'forest' : 'swamp';
  }
  if (moisture > 0.4) {
    return 'forest';
  }
  return 'plains';
}

/**
 * Generate the initial nascent world:
 * A mostly blank oceanic globe with a primal continent and scattered archipelagos
 * ready for the gods to shape.
 */
export function generateInitialWorld(): WorldCell[] {
  const cells: WorldCell[] = [];

  for (let r = 0; r < GRID_ROWS; r++) {
    // Latitude from +90 (north) to -90 (south) centered in cell band
    const lat = 90 - ((r + 0.5) / GRID_ROWS) * 180;

    for (let c = 0; c < GRID_COLS; c++) {
      // Longitude from -180 to +180 centered in meridian slice
      const lon = -180 + ((c + 0.5) / GRID_COLS) * 360;
      const index = r * GRID_COLS + c;

      // Create organic initial continental seeds using trigonometric waves
      const nx = Math.cos((lon * Math.PI) / 180) * Math.cos((lat * Math.PI) / 180);
      const ny = Math.sin((lat * Math.PI) / 180);
      const nz = Math.sin((lon * Math.PI) / 180) * Math.cos((lat * Math.PI) / 180);

      // Primary continental noise
      let elevation =
        Math.sin(nx * 2.5 + ny * 1.8) * 0.4 +
        Math.cos(nz * 2.2 - ny * 1.5) * 0.35 +
        Math.sin(nx * 4.0 - nz * 3.0) * 0.2 -
        0.25; // default ocean biased

      // Create one prominent ancient supercontinent (Meglin / Gondwana style)
      const distToContinentA = Math.hypot(lat - 10, lon - 25);
      if (distToContinentA < 35) {
        elevation += Math.cos((distToContinentA / 35) * (Math.PI / 2)) * 0.65;
      }

      // Secondary island cluster
      const distToContinentB = Math.hypot(lat + 20, lon + 120);
      if (distToContinentB < 25) {
        elevation += Math.cos((distToContinentB / 25) * (Math.PI / 2)) * 0.55;
      }

      // Clamping elevation
      elevation = Math.max(-1.0, Math.min(1.0, elevation));

      const moisture = Math.max(0, Math.min(1, 0.5 + Math.sin(lon * 0.05) * 0.3 + (elevation > 0 ? 0.1 : 0.4)));
      const climate = computeClimate(lat, moisture);
      const terrain = computeTerrain(elevation, moisture, climate);

      // Sparse natural resources on land
      let resource: string | null = null;
      if (elevation > 0 && Math.random() < 0.2) {
        resource = RESOURCES_LIST[Math.floor(Math.random() * RESOURCES_LIST.length)];
      }

      const fertility = elevation > 0 ? (terrain === 'forest' ? 0.8 : terrain === 'plains' ? 0.7 : terrain === 'desert' ? 0.2 : 0.4) : 0;

      cells.push({
        index,
        lat,
        lon,
        terrain,
        elevation,
        climate,
        moisture,
        fertility,
        resource,
        population: 0,
        cityId: null,
        civilizationId: null,
        alignment: 0,
        miracleAura: null,
      });
    }
  }

  return cells;
}

/**
 * Retrieve adjacent cell indices on the spherical grid (with wrap around on longitude)
 */
export function getAdjacentCellIndices(cellIndex: number, radius = 1): number[] {
  const r = Math.floor(cellIndex / GRID_COLS);
  const c = cellIndex % GRID_COLS;

  const results: Set<number> = new Set();

  for (let dr = -radius; dr <= radius; dr++) {
    for (let dc = -radius; dc <= radius; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      if (nr < 0 || nr >= GRID_ROWS) continue; // Pole clamp

      // Longitude wraps around the sphere
      let nc = (c + dc) % GRID_COLS;
      if (nc < 0) nc += GRID_COLS;

      results.add(nr * GRID_COLS + nc);
    }
  }

  return Array.from(results);
}

/**
 * Shape terrain at target cell and surrounding radius
 */
export function applyTerrainModification(
  cells: WorldCell[],
  centerIndex: number,
  targetTerrain: TerrainType,
  radius = 1
): WorldCell[] {
  const updated = [...cells];
  const affectedIndices = [centerIndex, ...getAdjacentCellIndices(centerIndex, radius)];

  for (const idx of affectedIndices) {
    const cell = { ...updated[idx] };
    cell.terrain = targetTerrain;

    if (targetTerrain === 'mountains') {
      cell.elevation = Math.max(0.75, cell.elevation + 0.4);
    } else if (targetTerrain === 'hills') {
      cell.elevation = Math.max(0.45, cell.elevation + 0.25);
    } else if (targetTerrain === 'plains') {
      cell.elevation = Math.max(0.1, Math.min(0.35, cell.elevation));
      cell.fertility = Math.max(0.6, cell.fertility);
    } else if (targetTerrain === 'forest') {
      cell.elevation = Math.max(0.1, cell.elevation);
      cell.moisture = Math.max(0.6, cell.moisture);
      cell.fertility = Math.max(0.8, cell.fertility);
    } else if (targetTerrain === 'desert') {
      cell.moisture = 0.1;
      cell.fertility = 0.15;
    } else if (targetTerrain === 'deep_ocean' || targetTerrain === 'ocean') {
      cell.elevation = -0.5;
      cell.population = 0;
      cell.cityId = null;
      cell.civilizationId = null;
    } else if (targetTerrain === 'volcanic') {
      cell.elevation = 0.85;
      cell.climate = 'geothermal';
      cell.resource = 'Mithril Lode';
    }

    updated[idx] = cell;
  }

  return updated;
}
