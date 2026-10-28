/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { City, Civilization, MapViewMode, Race, WorldCell } from '../types/game';
import { getGridDimensions } from '../simulation/worldGrid';
import { PRESET_RACES } from '../simulation/races';
import { RaceArtwork } from './RaceArtwork';
import {
  Sparkles,
  Gem,
  Pickaxe,
  Wheat,
  Trees,
  Flame,
  Droplets,
  Compass,
  Eye,
  Shield,
  Users,
  Crown,
  X,
  Maximize2,
  Minimize2,
  Maximize,
  Scroll,
} from 'lucide-react';
import { CoatOfArmsView } from './CoatOfArmsView';
import { ensureCivCoatOfArms } from '../simulation/heraldry';

export type AtlasSizeMode = 'standard' | 'wide' | 'fullscreen';

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
  const { rows: gridRows, cols: gridCols } = getGridDimensions(cells.length);
  const [hoveredCellIndex, setHoveredCellIndex] = useState<number | null>(null);
  const [showResourceOverlay, setShowResourceOverlay] = useState<boolean>(true);
  const [isDraggingSelection, setIsDraggingSelection] = useState<boolean>(false);
  const isDraggingRef = useRef(false);

  // Dynamic screen sizing for large screens (can fill 100% of the view section)
  const [sizeMode, setSizeMode] = useState<AtlasSizeMode>(() => {
    try {
      const saved = localStorage.getItem('meglin_atlas_size_mode');
      if (saved === 'standard' || saved === 'wide' || saved === 'fullscreen') {
        return saved as AtlasSizeMode;
      }
    } catch {
      // ignore
    }
    return typeof window !== 'undefined' && window.innerWidth >= 1400 ? 'wide' : 'standard';
  });

  const handleSetSizeMode = (mode: AtlasSizeMode) => {
    setSizeMode(mode);
    try {
      localStorage.setItem('meglin_atlas_size_mode', mode);
    } catch {
      // ignore
    }
  };

  const [showHeraldryModal, setShowHeraldryModal] = useState<boolean>(false);

  // Persistent, hover-activated settlement tooltip state
  const [hoveredSettlementId, setHoveredSettlementId] = useState<string | null>(null);
  const isHoveringTooltipRef = useRef(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Global mouseup listener to terminate drag-selection cleanly
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDraggingRef.current = false;
      setIsDraggingSelection(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
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

  // Active settlement being inspected via persistent hover
  const activeSettlement = hoveredSettlementId
    ? cities.find((c) => c.id === hoveredSettlementId)
    : null;
  const activeSettlementRace = activeSettlement
    ? races.find((r) => r.id === activeSettlement.raceId) ||
      PRESET_RACES.find((r) => r.id === activeSettlement.raceId) ||
      null
    : null;
  const activeSettlementCiv = activeSettlement
    ? civilizations.find((cv) => cv.id === activeSettlement.civilizationId)
    : null;
  const activeSettlementCell = activeSettlement
    ? cells.find((c) => c.index === activeSettlement.cellIndex)
    : null;

  // Clamped settlement tooltip coordinates strictly inside map grid container
  const getSettlementTooltipStyle = (city: City): React.CSSProperties => {
    const targetCell = cells.find((c) => c.index === city.cellIndex);
    if (!targetCell) return { top: '5%', left: '5%' };

    const col = targetCell.index % gridCols;
    const row = Math.floor(targetCell.index / gridCols);

    const isRight = col > gridCols / 2;
    const isBottom = row > gridRows / 2;

    const leftPercent = ((col + 0.5) / gridCols) * 100;
    const topPercent = ((row + 0.5) / gridRows) * 100;

    const style: React.CSSProperties = {
      position: 'absolute',
      zIndex: 50,
      maxHeight: '94%',
      width: '320px',
      maxWidth: 'calc(100% - 24px)',
    };

    if (isRight) {
      style.right = `${Math.max(1.5, Math.min(96, 100 - leftPercent + 1.2))}%`;
    } else {
      style.left = `${Math.max(1.5, Math.min(96, leftPercent + 1.2))}%`;
    }

    if (isBottom) {
      style.bottom = `${Math.max(1.5, Math.min(92, 100 - topPercent - 2))}%`;
    } else {
      style.top = `${Math.max(1.5, Math.min(92, topPercent - 2))}%`;
    }

    return style;
  };

  return (
    <div
      className={`w-full h-full flex flex-col bg-slate-950 overflow-auto text-slate-100 transition-all duration-200 ${
        sizeMode === 'fullscreen'
          ? 'p-1 sm:p-2 items-stretch justify-start'
          : 'p-2 sm:p-4 items-center justify-between'
      }`}
    >
      <div
        className={`relative border border-amber-900/60 rounded-2xl bg-[#1a1713] shadow-2xl flex flex-col gap-3 transition-all duration-300 ${
          sizeMode === 'fullscreen'
            ? 'w-full max-w-none flex-1 p-2 sm:p-3 justify-between'
            : sizeMode === 'wide'
            ? 'w-full max-w-[1600px] p-3 sm:p-4'
            : 'w-full max-w-6xl p-3 sm:p-4'
        }`}
      >
        {/* Parchment Header & Resource Toolbar */}
        <div className="flex flex-wrap items-center justify-between pb-2.5 border-b border-amber-800/40 text-amber-200 gap-2">
          <div>
            <div className="text-sm sm:text-base font-serif font-bold tracking-wider uppercase flex items-center gap-2 text-amber-300">
              <Compass className="w-4 h-4 text-amber-400" /> Cartographer's Table: 2D World Atlas
            </div>
            <div className="text-[11px] text-amber-300/70 font-mono">
              Equirectangular Projection • {gridRows} Latitudinal Bands × {gridCols} Meridians ({cells.length} Blocks)
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
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

            {/* Civilization Coats of Arms / Heraldry Gallery Button */}
            {civilizations.length > 0 && (
              <button
                onClick={() => setShowHeraldryModal(true)}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-slate-900/90 text-amber-300 border border-amber-700/60 hover:bg-amber-950/70 hover:border-amber-500 transition shadow-sm cursor-pointer"
                title="Inspect Coats of Arms, heraldic blazons, and mottos of all established civilizations"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Heraldry ({civilizations.length} Realms)</span>
              </button>
            )}

            {/* Atlas Viewport Size Selector for Large Displays */}
            <div className="flex items-center bg-slate-900/90 border border-amber-800/60 rounded-xl p-0.5 text-xs shadow-sm">
              <button
                onClick={() => handleSetSizeMode('standard')}
                className={`px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                  sizeMode === 'standard'
                    ? 'bg-amber-500/25 text-amber-300 font-bold border border-amber-500/50 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Standard Boxed View (max 1152px)"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[11px]">Standard</span>
              </button>
              <button
                onClick={() => handleSetSizeMode('wide')}
                className={`px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                  sizeMode === 'wide'
                    ? 'bg-amber-500/25 text-amber-300 font-bold border border-amber-500/50 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Wide Expanded View (max 1600px)"
              >
                <Maximize className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[11px]">Wide</span>
              </button>
              <button
                onClick={() => handleSetSizeMode('fullscreen')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                  sizeMode === 'fullscreen'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-amber-300'
                }`}
                title="Fill View Space: Expands to take 100% of the viewport section for large screens"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">Fill View Space</span>
              </button>
            </div>

            {/* Quick Toggle for High-Visibility Resource Overlay */}
            <button
              onClick={() => setShowResourceOverlay(!showResourceOverlay)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border cursor-pointer ${
                showResourceOverlay
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Toggle prominent resource node icons and glimmers"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Resources</span>
              <span>({totalResourceNodes})</span>
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

        {/* The 2D Cylindrical Grid Canvas & Bounded Tooltip Wrapper */}
        <div className={`relative rounded-xl select-none ${sizeMode === 'fullscreen' ? 'w-full flex-1 flex items-center justify-center' : 'w-full'}`}>
          <div
            className="grid gap-[1px] bg-amber-950/50 rounded-xl overflow-hidden select-none border border-amber-900/50 shadow-inner w-full"
            style={{
              gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
              aspectRatio: '2 / 1',
              maxHeight: sizeMode === 'fullscreen' ? 'calc(100vh - 200px)' : undefined,
            }}
            onMouseLeave={() => {
              setHoveredCellIndex(null);
              if (!isHoveringTooltipRef.current) {
                if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
                closeTimeoutRef.current = setTimeout(() => {
                  if (!isHoveringTooltipRef.current) {
                    setHoveredSettlementId(null);
                  }
                }, 350);
              }
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
                    if (city) {
                      if (closeTimeoutRef.current) {
                        clearTimeout(closeTimeoutRef.current);
                        closeTimeoutRef.current = null;
                      }
                      setHoveredSettlementId(city.id);
                    } else if (!isHoveringTooltipRef.current) {
                      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
                      closeTimeoutRef.current = setTimeout(() => {
                        if (!isHoveringTooltipRef.current) {
                          setHoveredSettlementId(null);
                        }
                      }, 350);
                    }

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

          {/* Persistent, Hover-Activated Settlement Tooltip (Bounded Within Map Grid) */}
          {activeSettlement && activeSettlementCell && (
            <div
              className="absolute z-50 w-80 max-w-[340px] max-h-[94%] overflow-y-auto rounded-2xl bg-slate-950/95 border-2 border-amber-500/80 p-3 shadow-2xl backdrop-blur-md text-slate-100 flex flex-col gap-2 animate-fade-in pointer-events-auto"
              style={getSettlementTooltipStyle(activeSettlement)}
              onMouseEnter={() => {
                isHoveringTooltipRef.current = true;
                if (closeTimeoutRef.current) {
                  clearTimeout(closeTimeoutRef.current);
                  closeTimeoutRef.current = null;
                }
              }}
              onMouseLeave={() => {
                isHoveringTooltipRef.current = false;
                if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
                closeTimeoutRef.current = setTimeout(() => {
                  setHoveredSettlementId(null);
                }, 250);
              }}
            >
              {/* Header with Coat of Arms & Settlement Identity */}
              <div className="flex items-center justify-between pb-1.5 border-b border-amber-900/40">
                <div className="flex items-center gap-2.5">
                  {activeSettlementCiv && (
                    <CoatOfArmsView
                      coatOfArms={ensureCivCoatOfArms(activeSettlementCiv, activeSettlementRace || undefined)}
                      size="sm"
                      showMotto={false}
                    />
                  )}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {activeSettlement.status === 'ruined' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950/80 text-red-300 border border-red-500/50 flex items-center gap-1">
                          <span>🏚</span> Ancient Ruin
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50 flex items-center gap-1">
                          <span>🏛</span> Settlement
                        </span>
                      )}
                      {activeSettlementCiv && (
                        <span
                          className="px-1.5 py-0.5 rounded text-[9px] font-medium border"
                          style={{
                            borderColor: `${activeSettlementCiv.color}60`,
                            color: activeSettlementCiv.color,
                            backgroundColor: `${activeSettlementCiv.color}15`,
                          }}
                        >
                          {activeSettlementCiv.name}
                        </span>
                      )}
                    </div>
                    {activeSettlementCiv && (
                      <span className="text-[10px] text-amber-200/80 font-serif italic mt-0.5 truncate max-w-[210px]">
                        "{ensureCivCoatOfArms(activeSettlementCiv, activeSettlementRace || undefined).motto}"
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHoveredSettlementId(null)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title="Close preview"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Graphical Image for the Race */}
              <div className="rounded-xl overflow-hidden shadow-inner border border-amber-500/30">
                <RaceArtwork race={activeSettlementRace} className="w-full h-28" />
              </div>

              {/* Settlement Identity & Coordinates */}
              <div>
                <h4 className="font-serif font-bold text-sm text-white flex items-center justify-between">
                  <span>{activeSettlement.name}</span>
                  <span className="text-[10px] text-amber-300/80 font-mono">
                    [{activeSettlementCell.lat.toFixed(0)}°{activeSettlementCell.lat >= 0 ? 'N' : 'S'}, {activeSettlementCell.lon.toFixed(0)}°{activeSettlementCell.lon >= 0 ? 'E' : 'W'}]
                  </span>
                </h4>
                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="capitalize">{activeSettlementCell.terrain.replace('_', ' ')}</span>
                  <span>•</span>
                  <span className="capitalize">{activeSettlementCell.climate} Climate</span>
                  {activeSettlementCell.resource && (
                    <>
                      <span>•</span>
                      <span className="text-amber-300 font-medium">{activeSettlementCell.resource}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Population & Fortification Metrics */}
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Users className="w-3 h-3 text-blue-400" /> Pop
                  </span>
                  <span className="font-bold text-xs text-white">
                    {activeSettlement.population.toLocaleString()}
                  </span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-amber-400" /> Walls
                  </span>
                  <span className="font-bold text-xs text-amber-300">
                    Tier {activeSettlement.defense}
                  </span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    💰 Wealth
                  </span>
                  <span className="font-bold text-xs text-emerald-400">
                    {activeSettlement.wealth} Gold
                  </span>
                </div>
              </div>

              {/* Race Cultural Inclination */}
              {activeSettlementRace && (
                <div className="p-2 rounded-xl bg-slate-900/90 border border-amber-500/20 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-amber-300 flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      {activeSettlementRace.name}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {activeSettlementRace.demonym} • {activeSettlementRace.category}
                    </span>
                  </div>

                  {/* Inclination Metrics */}
                  <div className="space-y-1 pt-0.5 text-[10px]">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Procreation Rate:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {(activeSettlementRace.procreationRate || activeSettlementRace.fertilityMultiplier || 1.0).toFixed(1)}x
                        <span className="text-slate-400 font-normal ml-1">
                          ({(activeSettlementRace.procreationRate || 1.0) > 1.5 ? 'Prolific Swarm' : (activeSettlementRace.procreationRate || 1.0) < 0.8 ? 'Reverent / Slow' : 'Balanced'})
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span>Expansion Inclination:</span>
                      <span className="font-mono font-bold text-amber-400">
                        {((activeSettlementRace.expansionInclination || 0.5) * 100).toFixed(0)}%
                        <span className="text-slate-400 font-normal ml-1">
                          ({(activeSettlementRace.expansionInclination || 0.5) > 0.7 ? 'Aggressive Imperialist' : (activeSettlementRace.expansionInclination || 0.5) < 0.3 ? 'Reclusive & Isolated' : 'Measured Frontier'})
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span>Settlement Tendency:</span>
                      <span className="font-mono font-bold text-cyan-400">
                        {((activeSettlementRace.settlementTendency || 0.5) * 100).toFixed(0)}%
                        <span className="text-slate-400 font-normal ml-1">
                          ({(activeSettlementRace.settlementTendency || 0.5) > 0.7 ? 'Rapid Fortress Sprawl' : (activeSettlementRace.settlementTendency || 0.5) < 0.3 ? 'Sacred Havens Only' : 'Steady Towns'})
                        </span>
                      </span>
                    </div>
                  </div>

                  {activeSettlementRace.naturalWonderAffinity && (
                    <div className="px-2 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-[10px] text-emerald-300 font-medium flex items-center gap-1.5">
                      <span>✨</span>
                      <span>Sacred wonder affinity (Sanctuaries near Mana Springs)</span>
                    </div>
                  )}

                  {/* Traits Chips */}
                  {activeSettlementRace.traits && activeSettlementRace.traits.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {activeSettlementRace.traits.map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300 border border-slate-700"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Ruined Warning If Sacked */}
              {activeSettlement.status === 'ruined' && (
                <div className="p-2 rounded-xl bg-red-950/60 border border-red-500/40 text-[10px] text-red-200">
                  <div className="font-bold text-red-300 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>Sacked & Desecrated Fortress</span>
                  </div>
                  <p className="mt-0.5 text-red-200/80 leading-tight">
                    Fallen to ruin in Year {activeSettlement.ruinedYear || '500'} by {activeSettlement.ruinedByCivName || 'invaders'}. Abandoned ruins risk breeding feral monstrous abominations if unreclaimed.
                  </p>
                </div>
              )}
            </div>
          )}
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

              {/* Civilization Coat of Arms & Realm Identity */}
              {inspectedCiv && (
                <div className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-800 p-2 rounded-xl shadow-inner">
                  <CoatOfArmsView
                    coatOfArms={ensureCivCoatOfArms(inspectedCiv, races?.find((r) => r.id === inspectedCiv.raceId))}
                    size="sm"
                    showMotto={false}
                  />
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-amber-300 text-xs truncate max-w-[150px]">
                        {inspectedCiv.name}
                      </span>
                      <span
                        className="px-1.5 py-0.2 rounded text-[9px] font-semibold border"
                        style={{
                          color: inspectedCiv.color,
                          borderColor: `${inspectedCiv.color}50`,
                          backgroundColor: `${inspectedCiv.color}15`,
                        }}
                      >
                        Realm
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-200/80 font-serif italic block truncate max-w-[180px]">
                      "{ensureCivCoatOfArms(inspectedCiv, races?.find((r) => r.id === inspectedCiv.raceId)).motto}"
                    </span>
                  </div>
                </div>
              )}

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

      {/* Heraldic Hall of Realms & Coats of Arms Showcase Modal */}
      {showHeraldryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[88vh] bg-slate-950 border-2 border-amber-600/70 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 overflow-hidden text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-amber-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-amber-200 uppercase tracking-wider flex items-center gap-2">
                    Heraldic Hall of Realms & Coats of Arms
                  </h3>
                  <p className="text-xs text-amber-300/70">
                    Sovereign emblems, heraldic charges, and mottos of every established world civilization
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHeraldryModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Realms Grid */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              {civilizations.map((civ) => {
                const civRace = races?.find((r) => r.id === civ.raceId) || PRESET_RACES.find((r) => r.id === civ.raceId);
                const coat = ensureCivCoatOfArms(civ, civRace);
                const capCity = cities.find((c) => c.id === civ.capitalCityId);
                const civCities = cities.filter((c) => civ.cityIds.includes(c.id));
                const totalPop = civCities.reduce((sum, c) => sum + c.population, 0);

                return (
                  <div
                    key={civ.id}
                    className="p-4 rounded-xl bg-slate-900/90 border border-amber-900/60 flex items-start gap-4 shadow-lg hover:border-amber-500/60 transition"
                  >
                    {/* Coat of Arms Shield */}
                    <div className="flex-shrink-0 pt-1">
                      <CoatOfArmsView coatOfArms={coat} size="lg" showMotto={false} />
                    </div>

                    {/* Realm Metadata */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-serif font-bold text-base text-amber-300 truncate">
                          {civ.name}
                        </h4>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border flex-shrink-0"
                          style={{
                            borderColor: `${civ.color}70`,
                            color: civ.color,
                            backgroundColor: `${civ.color}15`,
                          }}
                        >
                          {civRace?.name || 'Mortal'}
                        </span>
                      </div>

                      {/* Motto Ribbon */}
                      <div className="px-2.5 py-1 rounded bg-amber-950/70 border border-amber-600/40 text-xs text-amber-200 font-serif italic shadow-inner">
                        "{coat.motto}"
                      </div>

                      {/* Blazon */}
                      <p className="text-[11px] text-slate-300 leading-snug font-sans">
                        <span className="text-amber-400 font-medium">Heraldic Blazon:</span> {coat.blazon}
                      </p>

                      {/* Demographics & Capital */}
                      <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 border-t border-slate-800">
                        {capCity && <span>Capital: <strong className="text-white">{capCity.name}</strong></span>}
                        <span>Settlements: <strong className="text-white">{civCities.length}</strong></span>
                        <span>Total Pop: <strong className="text-amber-300">{totalPop.toLocaleString()}</strong></span>
                      </div>

                      {/* Technologies */}
                      {civ.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {civ.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300 border border-slate-700"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
