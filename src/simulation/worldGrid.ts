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

      let nc = (c + dc) % GRID_COLS;
      if (nc < 0) nc += GRID_COLS;

      results.add(nr * GRID_COLS + nc);
    }
  }

  return Array.from(results);
}

export type ShapingScope = 'pinpoint' | 'regional' | 'cascade';

export interface CellWithDistance {
  cellIndex: number;
  distance: number;
  ring: number;
}

/**
 * Retrieve cells organized by radial distance and concentric rings around a center
 * accounting for spherical wrapping around the longitude meridian.
 */
export function getCellsByRadialDistance(
  centerIndex: number,
  maxDistance: number
): CellWithDistance[] {
  const cr = Math.floor(centerIndex / GRID_COLS);
  const cc = centerIndex % GRID_COLS;
  const results: CellWithDistance[] = [];

  const maxR = Math.ceil(maxDistance);

  for (let dr = -maxR; dr <= maxR; dr++) {
    const nr = cr + dr;
    if (nr < 0 || nr >= GRID_ROWS) continue; // Pole clamp

    for (let dc = -maxR; dc <= maxR; dc++) {
      let nc = (cc + dc) % GRID_COLS;
      if (nc < 0) nc += GRID_COLS;

      const dist = Math.hypot(dr, dc);
      if (dist <= maxDistance) {
        let ring = 0;
        if (dist === 0) ring = 0;
        else if (dist <= 1.45) ring = 1;
        else if (dist <= 2.5) ring = 2;
        else if (dist <= 3.6) ring = 3;
        else ring = 4;

        results.push({
          cellIndex: nr * GRID_COLS + nc,
          distance: dist,
          ring,
        });
      }
    }
  }

  // Sort by ring/distance so center is processed first
  results.sort((a, b) => a.distance - b.distance);
  return results;
}

export interface CascadeSummary {
  primaryType: TerrainType;
  scope: ShapingScope;
  volcanoCount: number;
  mountainCount: number;
  hillsCount: number;
  plainsCount: number;
  forestCount: number;
  swampCount: number;
  shallowsCount: number;
  oceanCount: number;
  totalAffected: number;
  logNarrative: string;
}

/**
 * Apply cascading physical terrain modification.
 * When a volcanic crag or mountain rises, it cascades naturally through surrounding
 * rings: Volcano -> Mountains -> Hills -> Fertile Plains/Forest -> Coastal Shallows.
 */
export function applyCascadingTerrainModification(
  cells: WorldCell[],
  centerIndex: number,
  targetTerrain: TerrainType,
  scope: ShapingScope = 'cascade'
): { updatedCells: WorldCell[]; summary: CascadeSummary } {
  const updated = [...cells];

  const maxDist = scope === 'pinpoint' ? 0.5 : scope === 'regional' ? 2.3 : 4.4;
  const ringNodes = getCellsByRadialDistance(centerIndex, maxDist);

  let volcanoCount = 0;
  let mountainCount = 0;
  let hillsCount = 0;
  let plainsCount = 0;
  let forestCount = 0;
  let swampCount = 0;
  let shallowsCount = 0;
  let oceanCount = 0;

  for (const node of ringNodes) {
    const cell = { ...updated[node.cellIndex] };
    const ring = node.ring;

    if (targetTerrain === 'volcanic') {
      if (ring === 0) {
        cell.terrain = 'volcanic';
        cell.elevation = 0.95;
        cell.climate = 'geothermal';
        cell.resource = 'Mithril Lode';
        cell.miracleAura = {
          name: 'Volcanic Fissure',
          color: '#f97316',
          durationRounds: 5,
          effectDescription: 'Primal magma plume and tectonic uplift',
        };
        volcanoCount++;
      } else if (ring === 1 && scope !== 'pinpoint') {
        cell.terrain = 'mountains';
        cell.elevation = Math.max(0.72, cell.elevation + 0.65);
        cell.resource = cell.resource || 'Iron Ore Deposits';
        mountainCount++;
      } else if (ring === 2 && scope !== 'pinpoint') {
        cell.terrain = 'hills';
        cell.elevation = Math.max(0.46, cell.elevation + 0.45);
        cell.fertility = Math.max(0.65, cell.fertility + 0.25);
        hillsCount++;
      } else if (ring === 3 && scope === 'cascade') {
        cell.elevation = Math.max(0.20, cell.elevation + 0.35);
        cell.fertility = Math.max(0.85, cell.fertility + 0.4);
        cell.moisture = Math.max(0.55, cell.moisture + 0.25);
        if (cell.moisture > 0.6) {
          cell.terrain = 'forest';
          forestCount++;
        } else {
          cell.terrain = 'plains';
          plainsCount++;
        }
      } else if (ring >= 4 && scope === 'cascade') {
        if (cell.elevation < 0) {
          cell.elevation = -0.15;
          cell.terrain = 'shallow_water';
          shallowsCount++;
        }
      }
    } else if (targetTerrain === 'mountains') {
      if (ring === 0) {
        cell.terrain = 'mountains';
        cell.elevation = 0.88;
        cell.resource = cell.resource || 'Ancient Stone Quarry';
        mountainCount++;
      } else if (ring === 1 && scope !== 'pinpoint') {
        cell.terrain = 'mountains';
        cell.elevation = Math.max(0.70, cell.elevation + 0.55);
        mountainCount++;
      } else if (ring === 2 && scope !== 'pinpoint') {
        cell.terrain = 'hills';
        cell.elevation = Math.max(0.44, cell.elevation + 0.38);
        hillsCount++;
      } else if (ring === 3 && scope === 'cascade') {
        cell.elevation = Math.max(0.18, cell.elevation + 0.25);
        cell.fertility = Math.max(0.70, cell.fertility + 0.2);
        cell.terrain = cell.moisture > 0.45 ? 'forest' : 'plains';
        if (cell.terrain === 'forest') forestCount++;
        else plainsCount++;
      } else if (ring >= 4 && scope === 'cascade') {
        if (cell.elevation < 0) {
          cell.elevation = -0.16;
          cell.terrain = 'shallow_water';
          shallowsCount++;
        }
      }
    } else if (targetTerrain === 'hills') {
      if (ring === 0) {
        cell.terrain = 'hills';
        cell.elevation = 0.52;
        cell.fertility = Math.max(0.55, cell.fertility + 0.15);
        cell.resource = cell.resource || 'Silver Outcrops';
        hillsCount++;
      } else if (ring === 1 && scope !== 'pinpoint') {
        cell.terrain = 'hills';
        cell.elevation = Math.max(0.44, cell.elevation + 0.30);
        hillsCount++;
      } else if (ring === 2 && scope !== 'pinpoint') {
        cell.elevation = Math.max(0.20, cell.elevation + 0.20);
        cell.terrain = cell.moisture > 0.5 ? 'forest' : 'plains';
        if (cell.terrain === 'forest') forestCount++;
        else plainsCount++;
      } else if (ring >= 3 && scope === 'cascade') {
        if (cell.elevation < 0) {
          cell.elevation = -0.15;
          cell.terrain = 'shallow_water';
          shallowsCount++;
        }
      }
    } else if (targetTerrain === 'swamp') {
      if (ring === 0) {
        cell.terrain = 'swamp';
        cell.elevation = 0.08;
        cell.moisture = 0.95;
        cell.fertility = 0.65;
        cell.resource = cell.resource || 'Arcane Mana Springs';
        swampCount++;
      } else if (ring === 1 && scope !== 'pinpoint') {
        cell.terrain = 'swamp';
        cell.elevation = Math.max(0.05, Math.min(0.20, cell.elevation));
        cell.moisture = Math.max(0.85, cell.moisture + 0.3);
        swampCount++;
      } else if (ring === 2 && scope !== 'pinpoint') {
        cell.moisture = Math.min(1.0, cell.moisture + 0.25);
        if (cell.elevation > 0) {
          cell.terrain = cell.moisture > 0.7 ? 'swamp' : 'forest';
          if (cell.terrain === 'swamp') swampCount++;
          else forestCount++;
        } else {
          cell.terrain = 'shallow_water';
          shallowsCount++;
        }
      } else if (ring >= 3 && scope === 'cascade') {
        cell.moisture = Math.min(1.0, cell.moisture + 0.15);
      }
    } else if (targetTerrain === 'forest') {
      if (ring === 0) {
        cell.terrain = 'forest';
        cell.elevation = Math.max(0.15, cell.elevation);
        cell.moisture = 0.90;
        cell.fertility = 0.90;
        cell.resource = cell.resource || 'Dense Timber Groves';
        forestCount++;
      } else if (ring === 1 && scope !== 'pinpoint') {
        cell.terrain = 'forest';
        cell.moisture = Math.max(0.70, cell.moisture + 0.25);
        cell.fertility = Math.max(0.75, cell.fertility + 0.2);
        forestCount++;
      } else if (ring === 2 && scope !== 'pinpoint') {
        cell.moisture = Math.min(1.0, cell.moisture + 0.25);
        cell.fertility = Math.min(1.0, cell.fertility + 0.25);
        if (cell.elevation > 0) {
          cell.terrain = cell.moisture > 0.6 ? 'forest' : 'plains';
          if (cell.terrain === 'forest') forestCount++;
          else plainsCount++;
        }
      } else if (ring >= 3 && scope === 'cascade') {
        cell.moisture = Math.min(1.0, cell.moisture + 0.15);
        cell.fertility = Math.min(1.0, cell.fertility + 0.15);
      }
    } else if (targetTerrain === 'plains') {
      if (ring === 0) {
        cell.terrain = 'plains';
        cell.elevation = Math.max(0.22, cell.elevation);
        cell.fertility = 0.80;
        cell.resource = cell.resource || 'Fertile River Delta';
        plainsCount++;
      } else if (ring === 1 && scope !== 'pinpoint') {
        cell.elevation = Math.max(0.18, cell.elevation);
        cell.terrain = 'plains';
        cell.fertility = Math.max(0.70, cell.fertility);
        plainsCount++;
      } else if (ring === 2 && scope !== 'pinpoint') {
        cell.elevation = Math.max(0.12, cell.elevation);
        cell.terrain = cell.elevation > 0 ? 'plains' : 'shallow_water';
        if (cell.terrain === 'plains') plainsCount++;
        else shallowsCount++;
      } else if (ring >= 3 && scope === 'cascade') {
        if (cell.elevation < 0) {
          cell.elevation = -0.15;
          cell.terrain = 'shallow_water';
          shallowsCount++;
        }
      }
    } else if (targetTerrain === 'deep_ocean' || targetTerrain === 'ocean') {
      if (ring === 0) {
        cell.elevation = -0.80;
        cell.terrain = 'deep_ocean';
        cell.population = 0;
        cell.cityId = null;
        cell.civilizationId = null;
        oceanCount++;
      } else if (ring === 1 && scope !== 'pinpoint') {
        cell.elevation = -0.48;
        cell.terrain = 'ocean';
        cell.population = 0;
        cell.cityId = null;
        cell.civilizationId = null;
        oceanCount++;
      } else if (ring === 2 && scope !== 'pinpoint') {
        cell.elevation = -0.18;
        cell.terrain = 'shallow_water';
        shallowsCount++;
      } else if (ring >= 3 && scope === 'cascade') {
        if (cell.elevation > 0.5) {
          cell.elevation -= 0.25;
          cell.terrain = 'hills';
          hillsCount++;
        } else if (cell.elevation > 0.2) {
          cell.elevation -= 0.15;
          cell.terrain = 'plains';
          plainsCount++;
        }
      }
    } else if (targetTerrain === 'desert') {
      if (ring === 0) {
        cell.terrain = 'desert';
        cell.moisture = 0.05;
        cell.fertility = 0.15;
      } else if (ring === 1 && scope !== 'pinpoint') {
        cell.terrain = 'desert';
        cell.moisture = 0.12;
        cell.fertility = 0.20;
      } else if (ring === 2 && scope !== 'pinpoint') {
        cell.moisture = Math.max(0.15, cell.moisture - 0.25);
        if (cell.terrain === 'forest') cell.terrain = 'plains';
      }
    }

    updated[node.cellIndex] = cell;
  }

  // Construct narrative description of the geological cascade
  let narrative = '';
  if (targetTerrain === 'volcanic') {
    narrative = `Unleashed a volcanic caldera at the epicenter, triggering cascading tectonic uplift that forged ${mountainCount} mountain ridges, ${hillsCount} rugged foothills, and ${plainsCount + forestCount} fertile ash-nourished lowlands.`;
  } else if (targetTerrain === 'mountains') {
    narrative = `Raised alpine spires that rippled outward into ${mountainCount} mountain crests, surrounded by ${hillsCount} foothills and ${plainsCount + forestCount} piedmont plains.`;
  } else if (targetTerrain === 'hills') {
    narrative = `Erected rolling highlands and ${hillsCount} hill formations descending into fertile valleys.`;
  } else if (targetTerrain === 'swamp') {
    narrative = `Sank the terrain into a primeval mire, spreading moisture across ${swampCount} swamp wetlands and mist-shrouded bayous.`;
  } else if (targetTerrain === 'forest') {
    narrative = `Seeded an ancient woodland canopy that cast transpiration rainfall across ${forestCount} forest groves and surrounding plains.`;
  } else if (targetTerrain === 'deep_ocean' || targetTerrain === 'ocean') {
    narrative = `Cleaved an abyssal chasm into the crust, inundating ${oceanCount} ocean depths and eroding surrounding coasts.`;
  } else {
    narrative = `Shaped the bedrock into ${targetTerrain.replace('_', ' ')} across ${ringNodes.length} coordinate zones.`;
  }

  return {
    updatedCells: updated,
    summary: {
      primaryType: targetTerrain,
      scope,
      volcanoCount,
      mountainCount,
      hillsCount,
      plainsCount,
      forestCount,
      swampCount,
      shallowsCount,
      oceanCount,
      totalAffected: ringNodes.length,
      logNarrative: narrative,
    },
  };
}

/**
 * Apply cascading climate modification (Shape Climate)
 */
export function applyCascadingClimateModification(
  cells: WorldCell[],
  centerIndex: number,
  targetClimate: ClimateType,
  scope: ShapingScope = 'cascade'
): { updatedCells: WorldCell[]; summary: string } {
  const updated = [...cells];
  const maxDist = scope === 'pinpoint' ? 0.5 : scope === 'regional' ? 2.3 : 4.4;
  const ringNodes = getCellsByRadialDistance(centerIndex, maxDist);

  for (const node of ringNodes) {
    const cell = { ...updated[node.cellIndex] };
    const ring = node.ring;

    if (ring === 0) {
      cell.climate = targetClimate;
      if (targetClimate === 'tropical') cell.moisture = Math.max(0.7, cell.moisture + 0.3);
      if (targetClimate === 'arid') cell.moisture = 0.1;
      if (targetClimate === 'arctic') cell.moisture = Math.max(0.1, cell.moisture - 0.2);
    } else if (ring === 1 && scope !== 'pinpoint') {
      cell.climate = targetClimate;
      if (targetClimate === 'tropical') cell.moisture = Math.max(0.6, cell.moisture + 0.2);
      if (targetClimate === 'arid') cell.moisture = Math.max(0.12, cell.moisture - 0.25);
    } else if (ring === 2 && scope === 'cascade') {
      if (targetClimate === 'tropical' && cell.climate === 'cold') cell.climate = 'temperate';
      if (targetClimate === 'arctic' && cell.climate === 'temperate') cell.climate = 'cold';
      if (targetClimate === 'arid') cell.moisture = Math.max(0.18, cell.moisture - 0.2);
    }

    // Adapt terrain to new climate if on land
    if (cell.elevation > 0) {
      if (cell.climate === 'arctic' && cell.elevation > 0.4) cell.terrain = 'tundra';
      if (cell.climate === 'arid' && cell.terrain === 'plains') cell.terrain = 'desert';
      if (cell.climate === 'tropical' && cell.moisture > 0.6 && cell.terrain === 'desert') cell.terrain = 'forest';
    }

    updated[node.cellIndex] = cell;
  }

  const summary = `Shifted atmospheric currents toward ${targetClimate} across ${ringNodes.length} zones (${scope} scope).`;
  return { updatedCells: updated, summary };
}

/**
 * Backward compatible wrapper for legacy calls
 */
export function applyTerrainModification(
  cells: WorldCell[],
  centerIndex: number,
  targetTerrain: TerrainType,
  radius = 1
): WorldCell[] {
  const scope: ShapingScope = radius > 1 ? 'cascade' : radius === 1 ? 'regional' : 'pinpoint';
  return applyCascadingTerrainModification(cells, centerIndex, targetTerrain, scope).updatedCells;
}
