/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { City, Civilization, MapViewMode, Race, WorldCell } from '../types/game';
import { GRID_COLS, GRID_ROWS } from '../simulation/worldGrid';
import { Sparkles, Gem, Pickaxe, Wheat, Trees, Flame, Droplets, Compass, Eye } from 'lucide-react';

interface FlatMapAtlasProps {
  cells: WorldCell[];
  cities: City[];
  civilizations: Civilization[];
  races?: Race[];
  selectedCellIndex: number | null;
  selectedCellIndices?: number[];
  onSelectCell: (cellIndex: number, isMultiSelect?: boolean) => void;
  onClearSelection?: () => void;
  viewMode: MapViewMode;
}

// Resource Icon & Meta helper
export function getResourceMeta(resourceName: string | null): {
  icon: string;
  color: string;
  category: string;
  bonus: string;
} | null {
  if (!resourceName) return null;
  if (resourceName.includes('Mithril') || resourceName.includes('Gemstone')) {
    return { icon: '💎', color: '#38bdf8', category: 'Precious Arcana', bonus: '+2 Tech Affinity & Elite Relics' };
  }
  if (resourceName.includes('Iron') || resourceName.includes('Gold') || resourceName.includes('Silver') || resourceName.includes('Stone Quarry')) {
    return { icon: '⛏', color: '#fbbf24', category: 'Mineral Vein', bonus: '+1 Army Strength & Rapid Walls' };
  }
  if (resourceName.includes('Mana Springs') || resourceName.includes('Sacred Grove')) {
    return { icon: '🔮', color: '#c084fc', category: 'Primal Mysticism', bonus: '+2 Alignment & Miracle Efficiency' };
  }
  if (resourceName.includes('Fertile River Delta') || resourceName.includes('River Delta')) {
    return { icon: '🌾', color: '#4ade80', category: 'Rich Farmland', bonus: '+50% Population Growth & Trade Gold' };
  }
  if (resourceName.includes('Timber')) {
    return { icon: '🌲', color: '#22c55e', category: 'Lumber Forest', bonus: '+1 Fleet/Army Construction & Bows' };
  }
  return { icon: '✨', color: '#fef08a', category: 'Natural Resource', bonus: '+1 Economic Vitality' };
}

export const FlatMapAtlas: React.FC<FlatMapAtlasProps> = ({
  cells,
  cities,
  civilizations,
  races = [],
  selectedCellIndex,
  selectedCellIndices = [],
  onSelectCell,
  onClearSelection,
  viewMode,
}) => {
  const [hoveredCellIndex, setHoveredCellIndex] = useState<number | null>(null);
  const [showResourceOverlay, setShowResourceOverlay] = useState<boolean>(true);
  const [isDraggingSelection, setIsDraggingSelection] = useState<boolean>(false);
  const isDraggingRef = React.useRef(false);

  // Global mouseup listener to terminate drag-selection cleanly
  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDraggingRef.current = false;
      setIsDraggingSelection(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Effective selected indices
  const activeSelectedIndices = selectedCellIndices.length > 0
    ? selectedCellIndices
    : (selectedCellIndex !== null ? [selectedCellIndex] : []);

  // Inspector target: selected cell or hovered cell
  const inspectIndex = selectedCellIndex !== null ? selectedCellIndex : hoveredCellIndex;
  const inspectedCell = inspectIndex !== null ? cells[inspectIndex] : null;
  const inspectedCity = inspectedCell?.cityId ? cities.find((c) => c.id === inspectedCell.cityId) : null;
  const inspectedCiv = inspectedCell?.civilizationId ? civilizations.find((cv) => cv.id === inspectedCell.civilizationId) : null;
  const inspectedResourceMeta = getResourceMeta(inspectedCell?.resource || null);

  // Count total resources on map
  const totalResourceNodes = cells.filter((c) => Boolean(c.resource && c.elevation > 0)).length;

  // Extra cost for multi-selection: +1 for 2 blocks, +2 for each additional beyond that
  const extraCost = activeSelectedIndices.length >= 2
    ? 1 + (activeSelectedIndices.length - 2) * 2
    : 0;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-2 sm:p-4 bg-slate-950 overflow-auto text-slate-100">
      <div className="relative border border-amber-900/60 rounded-2xl p-3 sm:p-4 bg-[#1a1713] shadow-2xl max-w-6xl w-full flex flex-col gap-3">
        {/* Parchment Header & Resource Toolbar */}
        <div className="flex flex-wrap items-center justify-between pb-2.5 border-b border-amber-800/40 text-amber-200 gap-2">
          <div>
            <div className="text-sm sm:text-base font-serif font-bold tracking-wider uppercase flex items-center gap-2 text-amber-300">
              <Compass className="w-4 h-4 text-amber-400" /> Cartographer's Table: 2D World Atlas
            </div>
            <div className="text-[11px] text-amber-300/70 font-mono">
              Equirectangular Projection • {GRID_ROWS} Latitudinal Bands × {GRID_COLS} Meridians
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Multi-Selection Counter & Clear Indicator */}
            {activeSelectedIndices.length > 1 && (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-500/70 text-xs shadow-md">
                <span className="font-bold text-amber-300">
                  {activeSelectedIndices.length} Blocks Selected
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-200 border border-amber-500/40">
                  +{extraCost} Power
                </span>
                {onClearSelection && (
                  <button
                    onClick={onClearSelection}
                    className="text-[10px] text-amber-400 hover:text-white underline ml-1 cursor-pointer"
                  >
                    Clear Multi
                  </button>
                )}
              </div>
            )}

            {/* Quick Toggle for High-Visibility Resource Overlay */}
            <button
              onClick={() => setShowResourceOverlay(!showResourceOverlay)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
                showResourceOverlay
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Toggle prominent resource node icons and glimmers"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Resources ({totalResourceNodes} Nodes)</span>
              <span className={`w-2 h-2 rounded-full ${showResourceOverlay ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
            </button>
          </div>
        </div>

        {/* Multi-Selection Drag Hint */}
        <div className="text-[10px] text-amber-400/80 -mt-1 px-1 flex items-center justify-between">
          <span>Tip: Click and drag across adjacent (or diagonally adjacent) blocks to shape multiple sections together.</span>
          {activeSelectedIndices.length >= 2 && (
            <span className="text-amber-300 font-mono">Cost scaling: +1 for 2 blocks, +2 per block beyond</span>
          )}
        </div>

        {/* The 2D Cylindrical Grid Canvas */}
        <div
          className="grid gap-[1px] bg-amber-950/50 rounded-xl overflow-hidden select-none border border-amber-900/50 shadow-inner"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
            aspectRatio: '2 / 1',
          }}
          onMouseLeave={() => {
            setHoveredCellIndex(null);
          }}
        >
          {cells.map((cell) => {
            const isSelected = activeSelectedIndices.includes(cell.index);
            const isHovered = hoveredCellIndex === cell.index;
            const city = cell.cityId ? cities.find((c) => c.id === cell.cityId) : null;
            const civ = cell.civilizationId ? civilizations.find((cv) => cv.id === cell.civilizationId) : null;
            const resMeta = getResourceMeta(cell.resource);

            let bgColor = '#0f172a';
            if (viewMode === 'physical' || viewMode === 'resources') {
              if (cell.terrain === 'deep_ocean') bgColor = '#082f49';
              else if (cell.terrain === 'ocean') bgColor = '#0369a1';
              else if (cell.terrain === 'shallow_water') bgColor = '#38bdf8';
              else if (cell.terrain === 'mountains') bgColor = '#57534e';
              else if (cell.terrain === 'hills') bgColor = '#78716c';
              else if (cell.terrain === 'forest') bgColor = '#15803d';
              else if (cell.terrain === 'desert') bgColor = '#b45309';
              else if (cell.terrain === 'tundra') bgColor = '#94a3b8';
              else if (cell.terrain === 'swamp') bgColor = '#3f6212';
              else if (cell.terrain === 'volcanic') bgColor = '#991b1b';
              else bgColor = '#22c55e';

              // If dedicated resources view mode, dim cells without resources
              if (viewMode === 'resources' && !cell.resource && cell.elevation > 0) {
                bgColor = '#1e293b';
              }
            } else if (viewMode === 'political' && civ) {
              bgColor = civ.color;
            } else if (viewMode === 'climate') {
              if (cell.climate === 'arctic') bgColor = '#93c5fd';
              else if (cell.climate === 'cold') bgColor = '#67e8f9';
              else if (cell.climate === 'temperate') bgColor = '#22c55e';
              else if (cell.climate === 'arid') bgColor = '#d97706';
              else if (cell.climate === 'tropical') bgColor = '#15803d';
              else bgColor = '#ef4444';
            } else {
              if (cell.elevation <= 0) bgColor = '#0369a1';
              else bgColor = cell.population > 100 ? '#eab308' : '#334155';
            }

            return (
              <button
                key={cell.index}
                onMouseDown={(e) => {
                  isDraggingRef.current = true;
                  setIsDraggingSelection(true);
                  // If holding Shift, multi-select; else start new selection
                  onSelectCell(cell.index, e.shiftKey);
                }}
                onMouseEnter={() => {
                  setHoveredCellIndex(cell.index);
                  if (isDraggingRef.current) {
                    // Continuous drag adds adjacent cells to selection
                    onSelectCell(cell.index, true);
                  }
                }}
                onClick={(e) => {
                  // Fallback single-click handler
                  if (!isDraggingRef.current) {
                    onSelectCell(cell.index, e.shiftKey);
                  }
                }}
                style={{ backgroundColor: bgColor }}
                className={`relative group transition-all duration-75 flex items-center justify-center p-0 m-0 ${
                  isSelected
                    ? 'ring-2 ring-amber-400 z-20 scale-110 shadow-xl brightness-125'
                    : isHovered
                    ? 'ring-1 ring-cyan-300 z-10 scale-105'
                    : 'hover:brightness-110'
                }`}
                title={`[${cell.lat.toFixed(0)}°, ${cell.lon.toFixed(0)}°] • ${cell.terrain.replace('_', ' ')} (${cell.climate})${
                  cell.resource ? ` • Resource: ${cell.resource}` : ''
                }${city ? ` • City: ${city.name}` : ''}`}
              >
                {/* Settlement Citadel or Ancient Ruin Icon */}
                {city && (
                  <span
                    className={`text-[10px] leading-none drop-shadow z-10 ${
                      city.status === 'ruined' ? 'animate-pulse text-red-400' : ''
                    }`}
                    title={city.status === 'ruined' ? `Ruins of ${city.name} (Sacked/Abandoned)` : `City: ${city.name}`}
                  >
                    {city.status === 'ruined' ? '🏚' : '🏛'}
                  </span>
                )}

                {/* Other Deities' Races / Civilization Territory Markers */}
                {!city && cell.civilizationId && (
                  <span
                    className="w-1.5 h-1.5 rounded-full z-10 opacity-80 shadow-sm"
                    style={{ backgroundColor: civ?.color || '#cbd5e1' }}
                    title={`Territory: ${civ?.name}`}
                  />
                )}

                {/* Prominent High-Visibility Resource Icon / Glyph */}
                {resMeta && showResourceOverlay && (
                  <span
                    className={`absolute flex items-center justify-center pointer-events-none ${
                      city ? 'bottom-0 right-0 scale-75' : 'inset-0'
                    }`}
                  >
                    <span
                      className="text-[9px] sm:text-[10px] leading-none drop-shadow-md select-none transform hover:scale-125 transition-transform"
                      style={{ filter: `drop-shadow(0 0 3px ${resMeta.color})` }}
                    >
                      {resMeta.icon}
                    </span>
                  </span>
                )}

                {/* Miracle Aura Ring */}
                {cell.miracleAura && (
                  <span
                    className="absolute inset-0 border border-purple-400/90 rounded pointer-events-none animate-pulse"
                    style={{ borderColor: cell.miracleAura.color }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected / Hovered World Section Inspector Card */}
        <div className="bg-slate-950/90 border border-amber-900/60 rounded-xl p-3 text-xs flex flex-wrap items-center justify-between gap-3 shadow-md">
          {inspectedCell ? (
            <div className="flex flex-wrap items-center gap-4 w-full justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-600/40 text-amber-300 font-mono font-bold text-xs flex flex-col items-center justify-center min-w-[68px]">
                  <span>{inspectedCell.lat.toFixed(0)}° {inspectedCell.lat >= 0 ? 'N' : 'S'}</span>
                  <span>{inspectedCell.lon.toFixed(0)}° {inspectedCell.lon >= 0 ? 'E' : 'W'}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white capitalize">
                      {inspectedCell.terrain.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                      {inspectedCell.climate} Climate
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Elev: {inspectedCell.elevation >= 0 ? `+${inspectedCell.elevation.toFixed(2)}` : inspectedCell.elevation.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                    <span>Moisture: {Math.round(inspectedCell.moisture * 100)}%</span>
                    <span>•</span>
                    <span>Fertility: {Math.round(inspectedCell.fertility * 100)}%</span>
                    {inspectedCity && (
                      <>
                        <span>•</span>
                        <span
                          className={`font-semibold ${
                            inspectedCity.status === 'ruined' ? 'text-red-400 font-bold' : 'text-amber-300'
                          }`}
                        >
                          {inspectedCity.status === 'ruined'
                            ? `🏚 Ruins of ${inspectedCity.name} (Sacked/Abandoned)`
                            : `🏛 ${inspectedCity.name} (Pop: ${inspectedCity.population.toLocaleString()})`}
                        </span>
                      </>
                    )}
                    {(() => {
                      const cCiv = civilizations.find((c) => c.id === inspectedCell.civilizationId);
                      const cRace = races.find((r) => r.id === cCiv?.raceId);
                      if (!cRace) return null;
                      return (
                        <>
                          <span>•</span>
                          <span className="text-cyan-300 font-mono text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                            {cRace.name} (Procreation: {cRace.procreationRate?.toFixed(1) || cRace.fertilityMultiplier?.toFixed(1)}x • {cRace.expansionInclination > 0.7 ? 'Aggressive Expansion' : cRace.expansionInclination < 0.3 ? 'Reclusive' : 'Steady Expansion'})
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Resource Highlight Badge */}
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-2 rounded-xl">
                {inspectedResourceMeta ? (
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl drop-shadow">{inspectedResourceMeta.icon}</span>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-amber-300 text-xs">
                          {inspectedCell.resource}
                        </span>
                        <span
                          className="px-1.5 py-0.2 rounded text-[9px] font-semibold border"
                          style={{
                            color: inspectedResourceMeta.color,
                            borderColor: `${inspectedResourceMeta.color}50`,
                            backgroundColor: `${inspectedResourceMeta.color}15`,
                          }}
                        >
                          {inspectedResourceMeta.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-medium block">
                        Benefit: {inspectedResourceMeta.bonus}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 italic px-2">
                    {inspectedCell.elevation <= 0
                      ? 'Submerged waters • No surface resource vein'
                      : 'Unclaimed terrain • No special resource vein'}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-slate-400 italic text-xs py-1 flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" />
              Hover or click any cell coordinate on the map to survey its terrain, elevation, and resource veins.
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-[11px] text-amber-200/80 border-t border-amber-900/40">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#0369a1] inline-block border border-slate-700"></span> Ocean
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#22c55e] inline-block border border-slate-700"></span> Plains
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#15803d] inline-block border border-slate-700"></span> Forest
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#57534e] inline-block border border-slate-700"></span> Mountain
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#78716c] inline-block border border-slate-700"></span> Hills
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#3f6212] inline-block border border-slate-700"></span> Swamp
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#b45309] inline-block border border-slate-700"></span> Desert
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#991b1b] inline-block border border-slate-700"></span> Volcanic
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🏛</span> Settlement
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🏚</span> Ruin
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-amber-300 font-semibold">
              <span>🏛</span> Settlement
            </div>
            <div className="flex items-center gap-1 text-cyan-300 font-semibold">
              <span>💎</span> Mithril / Gems
            </div>
            <div className="flex items-center gap-1 text-amber-400 font-semibold">
              <span>⛏</span> Ore / Gold / Quarry
            </div>
            <div className="flex items-center gap-1 text-purple-300 font-semibold">
              <span>🔮</span> Mana Springs
            </div>
            <div className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span>🌾</span> River Delta
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
