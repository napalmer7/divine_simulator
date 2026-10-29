/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ActionPowerType,
  DAWN_OF_WORLDS_COSTS,
  calculateShapingCost,
  calculateMultiCellCost,
  ShapingScope,
} from '../simulation/dawnOfWorldsRules';
import { AgeId, ClimateType, TerrainType, WorldCell } from '../types/game';
import {
  Mountain,
  Sun,
  Dna,
  Wand2,
  Flame,
  Castle,
  ShieldAlert,
  Crown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TreePine,
  Waves,
  Hammer,
  Droplets,
  Wind,
  ThermometerSnowflake,
  Compass,
  Zap,
  Target,
  X,
  HelpCircle,
  Layers,
  Skull,
  Ghost,
} from 'lucide-react';

interface ControlDockProps {
  currentAge: AgeId;
  playerPower: number;
  selectedCell: WorldCell | null;
  selectedCellIndices?: number[];
  onClearSelection?: () => void;
  onOpenRaceSynthesizer: () => void;
  onOpenMiracleWeaver: () => void;
  onOpenTechTree?: () => void;
  onOpenRaceEvolution?: () => void;
  onOpenCurseRace?: () => void;
  onOpenCreateOrder?: () => void;
  onRebuildRuin?: () => void;
  isRuinSelected?: boolean;
  ruinedCityName?: string;
  onShapeTerrain: (terrain: TerrainType, scope: ShapingScope) => void;
  onShapeClimate: (climate: ClimateType, scope: ShapingScope) => void;
  onExecuteAction: (actionType: ActionPowerType, extraPayload?: any) => void;
  onExecuteCatastrophe?: (type: 'meteor' | 'volcano' | 'deluge' | 'wildfire') => void;
  isOpen?: boolean;
  onToggleOpen?: (open: boolean) => void;
}

export const ControlDock: React.FC<ControlDockProps> = ({
  currentAge,
  playerPower,
  selectedCell,
  selectedCellIndices = [],
  onClearSelection,
  onOpenRaceSynthesizer,
  onOpenMiracleWeaver,
  onOpenTechTree,
  onOpenRaceEvolution,
  onOpenCurseRace,
  onOpenCreateOrder,
  onRebuildRuin,
  isRuinSelected = false,
  ruinedCityName,
  onShapeTerrain,
  onShapeClimate,
  onExecuteAction,
  onExecuteCatastrophe,
  isOpen: controlledIsOpen,
  onToggleOpen,
}) => {
  // Support controlled or internal open state
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (next: boolean) => {
    if (onToggleOpen) {
      onToggleOpen(next);
    } else {
      setInternalIsOpen(next);
    }
  };

  const [activeCategory, setActiveCategory] = useState<'land' | 'life' | 'civilization' | 'wrath'>('land');
  const [shapingScope, setShapingScope] = useState<ShapingScope>('cascade');
  const [landSubTab, setLandSubTab] = useState<'geology' | 'climate'>('geology');
  const [catastropheType, setCatastropheType] = useState<'meteor' | 'volcano' | 'deluge' | 'wildfire'>('meteor');

  const selectedCount = Math.max(1, selectedCellIndices.length || (selectedCell ? 1 : 0));
  const costs = DAWN_OF_WORLDS_COSTS;
  const baseLandCost = calculateShapingCost(costs.shape_land[currentAge], shapingScope);
  const landCost = calculateMultiCellCost(baseLandCost, selectedCount);

  const baseClimateCost = calculateShapingCost(costs.shape_climate[currentAge], shapingScope);
  const climateCost = calculateMultiCellCost(baseClimateCost, selectedCount);

  const ageTitles: Record<AgeId, string> = {
    '1st_age_land': 'First Age of Land',
    '2nd_age_races': 'Second Age of Races',
    '3rd_age_relations': 'Third Age of Relations',
  };

  return (
    <>
      {/* 1. COLLAPSED STATE: Eye-catching magical floating trigger handle strictly bounded within the main workspace */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group absolute right-0 top-1/2 -translate-y-1/2 z-30 flex items-center bg-gradient-to-l from-amber-500 via-purple-600 to-indigo-700 hover:from-amber-400 hover:via-purple-500 hover:to-indigo-600 text-white pl-4 pr-3 py-3 rounded-l-2xl shadow-[0_0_25px_rgba(245,158,11,0.5)] border-y border-l border-amber-300/80 transition-all duration-300 hover:scale-105 hover:pr-4 cursor-pointer"
          title="Open Divine Powers Drawer"
          aria-label="Open Divine Powers Drawer"
        >
          {/* Animated Wand & Sparkles */}
          <div className="relative mr-2.5 flex items-center justify-center">
            <Wand2 className="w-6 h-6 text-yellow-300 animate-pulse group-hover:rotate-12 transition-transform" />
            <Sparkles className="w-3.5 h-3.5 text-amber-200 absolute -top-1.5 -right-1.5 animate-bounce" />
          </div>

          {/* Text and Power indicator */}
          <div className="flex flex-col items-start text-left">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-black uppercase tracking-wider font-serif text-yellow-200 drop-shadow">
                Divine Powers
              </span>
              <span className="text-xs">✨</span>
            </div>
            <span className="text-[10px] text-amber-100 font-mono font-bold flex items-center gap-1 mt-0.5">
              ⚡ {playerPower} Power
            </span>
          </div>

          <ChevronLeft className="w-4 h-4 ml-2 text-yellow-300 group-hover:-translate-x-1 transition-transform" />
        </button>
      )}

      {/* 2. EXPANDED STATE: Sleek Pullout Drawer that sits alongside the map, pushing the map left without overlapping */}
      {isOpen && (
        <div data-tutorial="powers-drawer" className="relative z-20 w-[420px] sm:w-[460px] md:w-[480px] lg:w-[500px] max-w-[50vw] sm:max-w-none h-full flex-shrink-0 bg-slate-950/95 border-l border-amber-500/40 shadow-2xl backdrop-blur-md flex flex-col text-slate-100 overflow-hidden">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 text-yellow-300 border border-amber-500/30 shadow-inner">
                <Wand2 className="w-5 h-5" />
                <Sparkles className="w-3 h-3 text-amber-200 absolute -top-1 -right-1" />
              </div>
              <div>
                <h2 className="text-sm font-bold font-serif text-white tracking-wide flex items-center gap-1.5">
                  Divine Powers
                  <span className="text-xs font-sans font-normal text-amber-300/80">
                    ({ageTitles[currentAge]})
                  </span>
                </h2>
                <div className="text-[11px] font-mono text-amber-400 font-semibold flex items-center gap-1">
                  <span>⚡ Available Power:</span>
                  <span className="text-yellow-300 font-bold">{playerPower} Pts</span>
                </div>
              </div>
            </div>

            {/* Collapse / Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-1 text-xs"
              title="Collapse Divine Powers Drawer"
            >
              <ChevronRight className="w-5 h-5 text-amber-400" />
            </button>
          </div>

          {/* Targeted Coordinate & Cell Focus Banner */}
          <div className="px-5 py-2 bg-slate-900/50 border-b border-slate-800/80 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Target className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>Target:</span>
              {selectedCellIndices && selectedCellIndices.length > 1 ? (
                <div className="flex items-center gap-2">
                  <span className="text-amber-300 font-bold">
                    {selectedCellIndices.length} Adjacent Blocks Selected
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-600/40">
                    +{landCost - baseLandCost} Power Cost
                  </span>
                  {onClearSelection && (
                    <button
                      onClick={onClearSelection}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition"
                      title="Clear multi-selection to single block"
                    >
                      Clear Multi
                    </button>
                  )}
                </div>
              ) : selectedCell ? (
                <span className="text-amber-300 font-semibold">
                  [{selectedCell.lat.toFixed(0)}°, {selectedCell.lon.toFixed(0)}°]{' '}
                  <span className="capitalize font-normal text-slate-300">
                    ({selectedCell.terrain.replace('_', ' ')} • {selectedCell.climate})
                  </span>
                </span>
              ) : (
                <span className="text-slate-500 italic">Click or drag across globe to select cell(s)</span>
              )}
            </div>

            {selectedCellIndices.length <= 1 && selectedCell?.resource && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium capitalize text-[10px]">
                ✦ {selectedCell.resource}
              </span>
            )}
          </div>

          {/* Category Navigation Tabs */}
          <div className="grid grid-cols-4 gap-1 p-2 bg-slate-900/70 border-b border-slate-800 text-[11px]">
            <button
              onClick={() => setActiveCategory('land')}
              className={`py-1.5 px-1 rounded-lg font-semibold flex flex-col sm:flex-row items-center justify-center gap-1 transition ${
                activeCategory === 'land'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Mountain className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="truncate">Land & Sky</span>
            </button>

            <button
              onClick={() => setActiveCategory('life')}
              className={`py-1.5 px-1 rounded-lg font-semibold flex flex-col sm:flex-row items-center justify-center gap-1 transition ${
                activeCategory === 'life'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Dna className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="truncate">Races</span>
            </button>

            <button
              onClick={() => setActiveCategory('civilization')}
              className={`py-1.5 px-1 rounded-lg font-semibold flex flex-col sm:flex-row items-center justify-center gap-1 transition ${
                activeCategory === 'civilization'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Castle className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
              <span className="truncate">Cities</span>
            </button>

            <button
              onClick={() => setActiveCategory('wrath')}
              className={`py-1.5 px-1 rounded-lg font-semibold flex flex-col sm:flex-row items-center justify-center gap-1 transition ${
                activeCategory === 'wrath'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
              <span className="truncate">Miracles</span>
            </button>
          </div>

          {/* Drawer Body - Scrollable content per category */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* CATEGORY 1: LAND & SKY */}
            {activeCategory === 'land' && (
              <div className="space-y-4">
                {/* Sub-tab: Geology vs Climate */}
                <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setLandSubTab('geology')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 ${
                      landSubTab === 'geology'
                        ? 'bg-amber-600/30 text-amber-200 border border-amber-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Mountain className="w-3.5 h-3.5 text-amber-400" /> Geologic Terrain ({landCost} Pts)
                  </button>
                  <button
                    onClick={() => setLandSubTab('climate')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 ${
                      landSubTab === 'climate'
                        ? 'bg-cyan-600/30 text-cyan-200 border border-cyan-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Wind className="w-3.5 h-3.5 text-cyan-400" /> Climate Currents ({climateCost} Pts)
                  </button>
                </div>

                {/* Scope & Cascading Physics Selector */}
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-semibold flex items-center gap-1 text-[11px]">
                      <Compass className="w-3.5 h-3.5 text-amber-400" /> Ripple Scope & Physics:
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold uppercase">
                      {shapingScope === 'cascade'
                        ? 'Cascading (4 Rings)'
                        : shapingScope === 'regional'
                        ? 'Regional (2 Rings)'
                        : 'Pinpoint (1 Cell)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                    <button
                      onClick={() => setShapingScope('cascade')}
                      className={`p-2 rounded-lg border text-center transition ${
                        shapingScope === 'cascade'
                          ? 'bg-amber-600/30 border-amber-500 text-amber-200 font-bold shadow'
                          : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                      title="Full cascading physics ripple across 4 concentric rings"
                    >
                      <div>Tectonic Cascade</div>
                      <div className="text-[9px] text-amber-400 mt-0.5">Volcano → Mtns → Hills → Plains</div>
                    </button>

                    <button
                      onClick={() => setShapingScope('regional')}
                      className={`p-2 rounded-lg border text-center transition ${
                        shapingScope === 'regional'
                          ? 'bg-amber-600/30 border-amber-500 text-amber-200 font-bold shadow'
                          : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                      title="Moderate regional ripple across 2 rings at reduced cost"
                    >
                      <div>Regional Ripple</div>
                      <div className="text-[9px] text-amber-400 mt-0.5">2 Rings (Reduced Pts)</div>
                    </button>

                    <button
                      onClick={() => setShapingScope('pinpoint')}
                      className={`p-2 rounded-lg border text-center transition ${
                        shapingScope === 'pinpoint'
                          ? 'bg-amber-600/30 border-amber-500 text-amber-200 font-bold shadow'
                          : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                      title="Precision surgical modification of 1 cell at lowest cost"
                    >
                      <div>Pinpoint Focus</div>
                      <div className="text-[9px] text-amber-400 mt-0.5">1 Cell (Lowest Cost)</div>
                    </button>
                  </div>
                </div>

                {/* Geology Action Cards */}
                {landSubTab === 'geology' && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onShapeTerrain('volcanic', shapingScope)}
                      disabled={playerPower < landCost}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-red-500/40 flex items-center gap-2.5 text-left transition"
                    >
                      <div className="p-2 rounded-lg bg-red-950/80 text-red-400 border border-red-500/30">
                        <Flame className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">Volcanic Crags</div>
                        <div className="text-[10px] text-amber-400">{landCost} Power</div>
                      </div>
                    </button>

                    <button
                      onClick={() => onShapeTerrain('mountains', shapingScope)}
                      disabled={playerPower < landCost}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700/80 flex items-center gap-2.5 text-left transition"
                    >
                      <div className="p-2 rounded-lg bg-stone-900 text-stone-300 border border-stone-600">
                        <Mountain className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">Raise Mountains</div>
                        <div className="text-[10px] text-amber-400">{landCost} Power</div>
                      </div>
                    </button>

                    <button
                      onClick={() => onShapeTerrain('hills', shapingScope)}
                      disabled={playerPower < landCost}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-amber-700/60 flex items-center gap-2.5 text-left transition"
                    >
                      <div className="p-2 rounded-lg bg-amber-950/80 text-amber-500 border border-amber-600/40">
                        <Mountain className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">Rolling Hills</div>
                        <div className="text-[10px] text-amber-400">{landCost} Power</div>
                      </div>
                    </button>

                    <button
                      onClick={() => onShapeTerrain('swamp', shapingScope)}
                      disabled={playerPower < landCost}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-lime-700/60 flex items-center gap-2.5 text-left transition"
                    >
                      <div className="p-2 rounded-lg bg-lime-950/80 text-lime-400 border border-lime-600/40">
                        <Droplets className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">Swamps & Mires</div>
                        <div className="text-[10px] text-amber-400">{landCost} Power</div>
                      </div>
                    </button>

                    <button
                      onClick={() => onShapeTerrain('forest', shapingScope)}
                      disabled={playerPower < landCost}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-emerald-700/60 flex items-center gap-2.5 text-left transition"
                    >
                      <div className="p-2 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-600/40">
                        <TreePine className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">Seed Forests</div>
                        <div className="text-[10px] text-amber-400">{landCost} Power</div>
                      </div>
                    </button>

                    <button
                      onClick={() => onShapeTerrain('plains', shapingScope)}
                      disabled={playerPower < landCost}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-yellow-700/60 flex items-center gap-2.5 text-left transition"
                    >
                      <div className="p-2 rounded-lg bg-yellow-950/80 text-yellow-400 border border-yellow-600/40">
                        <Sun className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">Fertile Plains</div>
                        <div className="text-[10px] text-amber-400">{landCost} Power</div>
                      </div>
                    </button>

                    <button
                      onClick={() => onShapeTerrain('desert', shapingScope)}
                      disabled={playerPower < landCost}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-orange-800/60 flex items-center gap-2.5 text-left transition"
                      title="Arid Desert Cascade: Desert → Plains → Forest in temperate climates. Triggers Frozen Tundra → Plains in arctic climates."
                    >
                      <div className="p-2 rounded-lg bg-orange-950/80 text-orange-400 border border-orange-600/40">
                        <Sun className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">Arid Desert</div>
                        <div className="text-[10px] text-amber-400">{landCost} Power</div>
                      </div>
                    </button>

                    <button
                      onClick={() => onShapeTerrain('tundra', shapingScope)}
                      disabled={playerPower < landCost}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700/60 flex items-center gap-2.5 text-left transition"
                      title="Frozen Tundra: Frozen permafrost wastes cascading into sub-polar plains."
                    >
                      <div className="p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-700">
                        <ThermometerSnowflake className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">Frozen Tundra</div>
                        <div className="text-[10px] text-amber-400">{landCost} Power</div>
                      </div>
                    </button>
                  </div>

                  {/* Sinking Waters & Basins - 2 Stages (Create Lake vs Sink Ocean) */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5 font-serif">
                        <Waves className="w-3.5 h-3.5 text-sky-400" />
                        Sinking Waters & Basins (2 Stages)
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        1-Step Lake vs Abyss
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Stage 1: Single Step Down / Create Lake */}
                      <button
                        onClick={() => onShapeTerrain('shallow_water', shapingScope)}
                        disabled={playerPower < landCost}
                        className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800/90 disabled:opacity-40 border border-cyan-500/50 hover:border-cyan-400 flex items-center gap-2.5 text-left transition shadow-sm group"
                        title="Stage 1 (Single Step Down): Lowlands become inland lakes/shallows; hills drop to plains; mountains drop to hills."
                      >
                        <div className="p-2 rounded-lg bg-cyan-950/90 text-cyan-400 border border-cyan-500/40 group-hover:scale-105 transition-transform flex-shrink-0">
                          <Droplets className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white text-xs flex items-center gap-1">
                            <span className="truncate">Create Lake</span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-900/70 text-cyan-300 border border-cyan-600/40 font-mono flex-shrink-0">
                              Stage 1
                            </span>
                          </div>
                          <div className="text-[10px] text-cyan-300 font-medium">
                            1 Step Down • {landCost} P
                          </div>
                          <div className="text-[9px] text-slate-400 truncate mt-0.5">
                            Land → Lake • Mtns → Hills
                          </div>
                        </div>
                      </button>

                      {/* Stage 2: Large Drop / Sink Deep Ocean */}
                      <button
                        onClick={() => onShapeTerrain('deep_ocean', shapingScope)}
                        disabled={playerPower < landCost}
                        className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800/90 disabled:opacity-40 border border-sky-600/50 hover:border-sky-400 flex items-center gap-2.5 text-left transition shadow-sm group"
                        title="Stage 2 (Large Drop): Cleaves crust into deep abyssal ocean trench (-0.85 elevation)."
                      >
                        <div className="p-2 rounded-lg bg-sky-950/90 text-sky-400 border border-sky-500/40 group-hover:scale-105 transition-transform flex-shrink-0">
                          <Waves className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white text-xs flex items-center gap-1">
                            <span className="truncate">Sink Ocean</span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-sky-900/70 text-sky-300 border border-sky-600/40 font-mono flex-shrink-0">
                              Stage 2
                            </span>
                          </div>
                          <div className="text-[10px] text-sky-300 font-medium">
                            Large Drop • {landCost} P
                          </div>
                          <div className="text-[9px] text-slate-400 truncate mt-0.5">
                            Cleaves Abyssal Trench
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}

                {/* Climate Action Cards */}
                {landSubTab === 'climate' && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onShapeClimate('tropical', shapingScope)}
                      disabled={playerPower < climateCost}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-emerald-500/40 flex items-center gap-2.5 text-left transition"
                    >
                      <div className="p-2 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                        <Sun className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">Tropical Monsoons</div>
                        <div className="text-[10px] text-cyan-400">{climateCost} Power</div>
                      </div>
                    </button>

                    <button
                      onClick={() => onShapeClimate('temperate', shapingScope)}
                      disabled={playerPower < climateCost}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-sky-500/40 flex items-center gap-2.5 text-left transition"
                    >
                      <div className="p-2 rounded-lg bg-sky-950/80 text-sky-400 border border-sky-500/30">
                        <Droplets className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">Temperate Rains</div>
                        <div className="text-[10px] text-cyan-400">{climateCost} Power</div>
                      </div>
                    </button>

                    <button
                      onClick={() => onShapeClimate('arctic', shapingScope)}
                      disabled={playerPower < climateCost}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-cyan-500/40 flex items-center gap-2.5 text-left transition"
                    >
                      <div className="p-2 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                        <ThermometerSnowflake className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">Arctic Frost</div>
                        <div className="text-[10px] text-cyan-400">{climateCost} Power</div>
                      </div>
                    </button>

                    <button
                      onClick={() => onShapeClimate('arid', shapingScope)}
                      disabled={playerPower < climateCost}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-amber-500/40 flex items-center gap-2.5 text-left transition"
                    >
                      <div className="p-2 rounded-lg bg-amber-950/80 text-amber-500 border border-amber-500/30">
                        <Sun className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">Arid Drought</div>
                        <div className="text-[10px] text-cyan-400">{climateCost} Power</div>
                      </div>
                    </button>

                    <button
                      onClick={() => onShapeClimate('geothermal', shapingScope)}
                      disabled={playerPower < climateCost}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-red-500/40 flex items-center gap-2.5 text-left transition col-span-2"
                    >
                      <div className="p-2 rounded-lg bg-red-950/80 text-red-500 border border-red-500/30">
                        <Flame className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">Geothermal Steam Vents</div>
                        <div className="text-[10px] text-cyan-400">{climateCost} Power</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* CATEGORY 2: RACES & GENETICS */}
            {activeCategory === 'life' && (
              <div className="space-y-3">
                {/* Highlighted Synthesizer Launch Banner */}
                <button
                  data-tutorial="race-button"
                  onClick={onOpenRaceSynthesizer}
                  disabled={playerPower < costs.create_race[currentAge]}
                  className="w-full p-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-40 text-white font-bold flex items-center justify-between transition shadow-lg shadow-emerald-950/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-black/25">
                      <Dna className="w-5 h-5 text-emerald-200" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm">Genetic Synthesizer</div>
                      <div className="text-[11px] text-emerald-100 font-normal">
                        Create Standard, Monstrous, or Sub-species
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-md bg-black/30 text-amber-300 font-mono text-xs font-bold">
                      {costs.create_race[currentAge]} Pts
                    </span>
                  </div>
                </button>

                {/* Race Evolution Power (2nd & 3rd Age) */}
                {currentAge !== '1st_age_land' && onOpenRaceEvolution && (
                  <button
                    onClick={onOpenRaceEvolution}
                    disabled={playerPower < 6}
                    className="w-full p-3.5 rounded-xl bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-slate-900 hover:from-purple-800/80 hover:to-indigo-800/80 disabled:opacity-40 border border-purple-500/50 flex items-center justify-between transition shadow"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-purple-200 text-xs">Evolve Race / Subrace Divergence</div>
                        <div className="text-[10px] text-slate-400">
                          Adapt mortals to woodlands, deserts, frost, or caverns
                        </div>
                      </div>
                    </div>
                    <span className="text-amber-400 font-bold text-xs font-mono">6 Power</span>
                  </button>
                )}

                {/* Curse & Corrupt Race (2nd & 3rd Age) */}
                {currentAge !== '1st_age_land' && onOpenCurseRace && (
                  <button
                    onClick={onOpenCurseRace}
                    disabled={playerPower < costs.create_subrace[currentAge]}
                    className="w-full p-3.5 rounded-xl bg-gradient-to-r from-purple-950/80 via-slate-950 to-red-950/70 hover:from-purple-900/90 hover:to-red-900/80 disabled:opacity-40 border border-purple-500/60 flex items-center justify-between transition shadow"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/40">
                        <Skull className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-purple-200 text-xs flex items-center gap-1.5">
                          Curse & Corrupt Race
                          <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 text-[9px] border border-purple-500/40 font-mono">
                            Evil Evolution
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Birth Dark Elves, Deep Dwarves, Undead, or Fell Abominations
                        </div>
                      </div>
                    </div>
                    <span className="text-purple-300 font-bold text-xs font-mono">
                      {costs.create_subrace[currentAge]} Power
                    </span>
                  </button>
                )}

                {/* Cultural Interventions */}
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-semibold text-slate-300">
                    Civilization & Moral Alignment:
                  </div>

                  {/* 5-Tier Tech Tree Launcher */}
                  {onOpenTechTree && (
                    <button
                      onClick={onOpenTechTree}
                      className="w-full p-3 rounded-xl bg-gradient-to-r from-blue-950/60 to-slate-900 hover:bg-slate-800 border border-blue-500/40 flex items-center justify-between text-left transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          <Hammer className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-blue-200 text-xs">5-Tier Tech Advancement Tree</div>
                          <div className="text-[10px] text-slate-400">
                            Combat, Agriculture, Knowledge, Magic, Naval
                          </div>
                        </div>
                      </div>
                      <span className="text-blue-300 font-bold text-xs">Browse Tiers</span>
                    </button>
                  )}

                  <button
                    onClick={() => onExecuteAction('purify_civ')}
                    disabled={playerPower < costs.purify_civ[currentAge]}
                    className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700/80 flex items-center justify-between text-left transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-yellow-500/10 text-amber-300 border border-yellow-500/30">
                        <Sun className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">Purify Civ (+1 Alignment)</div>
                        <div className="text-[10px] text-slate-400">
                          Steer mortal soul toward benevolence and celestial justice
                        </div>
                      </div>
                    </div>
                    <span className="text-amber-400 font-bold text-xs">
                      {costs.purify_civ[currentAge]} Power
                    </span>
                  </button>

                  <button
                    onClick={() => onExecuteAction('corrupt_civ')}
                    disabled={playerPower < costs.corrupt_civ[currentAge]}
                    className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700/80 flex items-center justify-between text-left transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">Corrupt Civ (-1 Alignment)</div>
                        <div className="text-[10px] text-slate-400">
                          Stir dark ambition, shadow cults, and aggressive conquest
                        </div>
                      </div>
                    </div>
                    <span className="text-amber-400 font-bold text-xs">
                      {costs.corrupt_civ[currentAge]} Power
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* CATEGORY 3: CIVILIZATION & ARMIES */}
            {activeCategory === 'civilization' && (
              <div className="space-y-2.5">
                {/* Special Rebuild Ruins Action if selected cell has a ruin */}
                {isRuinSelected && onRebuildRuin && (
                  <button
                    onClick={onRebuildRuin}
                    disabled={playerPower < 4}
                    className="w-full p-3.5 rounded-xl bg-gradient-to-r from-amber-600/30 via-yellow-600/30 to-amber-900/40 border border-amber-400/80 flex items-center justify-between text-left transition shadow-lg animate-pulse"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-amber-500/20 text-yellow-300 border border-amber-400/40">
                        <Castle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-yellow-200 text-xs">
                          Rebuild & Consecrate Ruins {ruinedCityName ? `of ${ruinedCityName}` : ''}
                        </div>
                        <div className="text-[10px] text-amber-200/80">
                          Restore walls, banish scavengers, and revive the city
                        </div>
                      </div>
                    </div>
                    <span className="text-yellow-300 font-bold text-xs font-mono">4 Power</span>
                  </button>
                )}

                {/* 5-Tier Tech Tree Launcher */}
                {onOpenTechTree && (
                  <button
                    onClick={onOpenTechTree}
                    className="w-full p-3 rounded-xl bg-gradient-to-r from-blue-950/60 to-slate-900 hover:bg-slate-800 border border-blue-500/40 flex items-center justify-between text-left transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        <Hammer className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-blue-200 text-xs">5-Tier Tech Advancement Tree</div>
                        <div className="text-[10px] text-slate-400">
                          Research Martial, Food, Arcane, and Maritime Techs
                        </div>
                      </div>
                    </div>
                    <span className="text-blue-300 font-bold text-xs">Browse Tiers</span>
                  </button>
                )}

                <button
                  onClick={() => onExecuteAction('command_race')}
                  disabled={playerPower < costs.command_race[currentAge]}
                  className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700/80 flex items-center justify-between text-left transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30">
                      <Castle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">Found Settlement</div>
                      <div className="text-[10px] text-slate-400">
                        Direct race to establish a city on selected world cell
                      </div>
                    </div>
                  </div>
                  <span className="text-amber-400 font-bold text-xs">
                    {costs.command_race[currentAge]} Power
                  </span>
                </button>

                <button
                  onClick={() => onExecuteAction('command_city')}
                  disabled={playerPower < costs.command_city[currentAge]}
                  className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700/80 flex items-center justify-between text-left transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">Raise Army / Fortify Walls</div>
                      <div className="text-[10px] text-slate-400">
                        Muster legion regiments or reinforce urban fortifications
                      </div>
                    </div>
                  </div>
                  <span className="text-amber-400 font-bold text-xs">
                    {costs.command_city[currentAge]} Power
                  </span>
                </button>

                <button
                  onClick={onOpenCreateOrder ? onOpenCreateOrder : () => onExecuteAction('create_order')}
                  disabled={playerPower < costs.create_order[currentAge]}
                  className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700/80 flex items-center justify-between text-left transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">Create Holy / Arcane Order</div>
                      <div className="text-[10px] text-slate-400">
                        Found knightly orders, merchant leagues, or mystic cabals
                      </div>
                    </div>
                  </div>
                  <span className="text-amber-400 font-bold text-xs">
                    {costs.create_order[currentAge]} Power
                  </span>
                </button>

                <button
                  onClick={() => onExecuteAction('create_avatar')}
                  disabled={playerPower < costs.create_avatar[currentAge]}
                  className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700/80 flex items-center justify-between text-left transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-300 border border-yellow-500/30">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">Manifest Divine Avatar</div>
                      <div className="text-[10px] text-slate-400">
                        Descend in physical mortal form to lead armies and champion faith
                      </div>
                    </div>
                  </div>
                  <span className="text-amber-400 font-bold text-xs">
                    {costs.create_avatar[currentAge]} Power
                  </span>
                </button>
              </div>
            )}

            {/* CATEGORY 4: MIRACLES & WRATH */}
            {activeCategory === 'wrath' && (
              <div className="space-y-3">
                {/* Custom Miracle Weaver Card */}
                <button
                  onClick={onOpenMiracleWeaver}
                  disabled={playerPower < costs.custom_miracle[currentAge]}
                  className="w-full p-4 rounded-xl bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-40 text-slate-950 font-bold flex items-center justify-between transition shadow-lg shadow-amber-950/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-black/20">
                      <Wand2 className="w-5 h-5 text-slate-950" />
                    </div>
                    <div className="text-left">
                      <div className="font-black text-sm">Weave Custom Miracle</div>
                      <div className="text-[11px] text-slate-900 font-medium">
                        Shift Climates, Bless Soil, or Trigger Epiphanies
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-black/20 text-slate-950 font-mono text-xs font-black">
                    {costs.custom_miracle[currentAge]} Pts
                  </span>
                </button>

                {/* Catastrophe with Dynamic Type Selection */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-red-500/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-red-950 text-red-400 border border-red-500/40">
                        <Flame className="w-4 h-4" />
                      </div>
                      <div className="font-bold text-red-300 text-xs">Unleash Dynamic Catastrophe</div>
                    </div>
                    <span className="text-amber-400 font-bold text-xs font-mono">
                      {costs.catastrophe[currentAge]} Power
                    </span>
                  </div>

                  {/* Catastrophe Type Selector */}
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <button
                      onClick={() => setCatastropheType('meteor')}
                      className={`p-2 rounded-lg border text-left transition ${
                        catastropheType === 'meteor'
                          ? 'border-cyan-400 bg-cyan-950/60 text-white font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      ☄️ Meteor Impact (Crater Lake)
                    </button>
                    <button
                      onClick={() => setCatastropheType('volcano')}
                      className={`p-2 rounded-lg border text-left transition ${
                        catastropheType === 'volcano'
                          ? 'border-orange-400 bg-orange-950/60 text-white font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      🌋 Supervolcano (Caldera & Ash)
                    </button>
                    <button
                      onClick={() => setCatastropheType('deluge')}
                      className={`p-2 rounded-lg border text-left transition ${
                        catastropheType === 'deluge'
                          ? 'border-blue-400 bg-blue-950/60 text-white font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      🌊 Abyssal Deluge (Ocean Abyss)
                    </button>
                    <button
                      onClick={() => setCatastropheType('wildfire')}
                      className={`p-2 rounded-lg border text-left transition ${
                        catastropheType === 'wildfire'
                          ? 'border-red-400 bg-red-950/60 text-white font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      🔥 Wildfire (Ash Scorched)
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (onExecuteCatastrophe) {
                        onExecuteCatastrophe(catastropheType);
                      } else {
                        onExecuteAction('catastrophe');
                      }
                    }}
                    disabled={playerPower < costs.catastrophe[currentAge]}
                    className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:opacity-40 text-white font-bold text-xs transition shadow flex items-center justify-center gap-1.5"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Strike Target with {catastropheType.toUpperCase()} ({costs.catastrophe[currentAge]} Power)</span>
                  </button>
                </div>

                {/* Divine Event */}
                <button
                  onClick={() => onExecuteAction('event')}
                  disabled={playerPower < costs.event[currentAge]}
                  className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-purple-500/40 flex items-center justify-between text-left transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-purple-950/80 text-purple-400 border border-purple-500/30">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">Trigger Divine Event</div>
                      <div className="text-[10px] text-slate-400">
                        Cosmic omens, Gold Rushes, Arcane Surges, or Great Migrations
                      </div>
                    </div>
                  </div>
                  <span className="text-amber-400 font-bold text-xs">
                    {costs.event[currentAge]} Power
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Drawer Footer Rules & Thrift Bonus Reminder */}
          <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Dawn of Worlds Rules: Thrift carries unspent points (+1 bonus).</span>
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-amber-400 hover:text-amber-300 font-semibold"
            >
              Hide Drawer
            </button>
          </div>
        </div>
      )}
    </>
  );
};
