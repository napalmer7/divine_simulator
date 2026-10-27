import React, { useState } from 'react';
import {
  ActionPowerType,
  DAWN_OF_WORLDS_COSTS,
  calculateShapingCost,
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
  ChevronDown,
  ChevronUp,
  Sparkles,
  TreePine,
  Waves,
  Hammer,
  Droplets,
  Wind,
  ThermometerSnowflake,
  Compass,
} from 'lucide-react';

interface ControlDockProps {
  currentAge: AgeId;
  playerPower: number;
  selectedCell: WorldCell | null;
  onOpenRaceSynthesizer: () => void;
  onOpenMiracleWeaver: () => void;
  onShapeTerrain: (terrain: TerrainType, scope: ShapingScope) => void;
  onShapeClimate: (climate: ClimateType, scope: ShapingScope) => void;
  onExecuteAction: (actionType: ActionPowerType, extraPayload?: any) => void;
}

export const ControlDock: React.FC<ControlDockProps> = ({
  currentAge,
  playerPower,
  selectedCell,
  onOpenRaceSynthesizer,
  onOpenMiracleWeaver,
  onShapeTerrain,
  onShapeClimate,
  onExecuteAction,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'land' | 'life' | 'civilization' | 'wrath'>('land');
  const [shapingScope, setShapingScope] = useState<ShapingScope>('cascade');
  const [landSubTab, setLandSubTab] = useState<'geology' | 'climate'>('geology');

  const costs = DAWN_OF_WORLDS_COSTS;
  const landCost = calculateShapingCost(costs.shape_land[currentAge], shapingScope);
  const climateCost = calculateShapingCost(costs.shape_climate[currentAge], shapingScope);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: 'min(980px, 94vw)',
        width: '100%',
        zIndex: 30,
      }}
      className="flex flex-col items-center transition-all duration-300"
    >
      {/* Collapse Toggle Handle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="mb-1.5 px-3 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-[11px] text-slate-300 hover:text-white shadow-lg backdrop-blur-md flex items-center gap-1.5 transition"
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 text-amber-400" /> Show Divine Powers
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> Cinema Mode (Hide Dock)
          </>
        )}
      </button>

      {/* Dock Card */}
      {!isCollapsed && (
        <div className="w-full rounded-2xl bg-slate-950/92 border border-slate-800/90 shadow-2xl backdrop-blur-md p-3 text-xs text-slate-200">
          {/* Top Category Tabs & Selected Target Indicator */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2.5">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveCategory('land')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeCategory === 'land'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Mountain className="w-3.5 h-3.5 text-amber-400" /> Shaping Land & Sky
              </button>
              <button
                onClick={() => setActiveCategory('life')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeCategory === 'life'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Dna className="w-3.5 h-3.5 text-emerald-400" /> Races & Genetics
              </button>
              <button
                onClick={() => setActiveCategory('civilization')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeCategory === 'civilization'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Castle className="w-3.5 h-3.5 text-sky-400" /> Cities & Armies
              </button>
              <button
                onClick={() => setActiveCategory('wrath')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeCategory === 'wrath'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Miracles & Wrath
              </button>
            </div>

            {/* Targeted Coordinate readout */}
            <div className="text-[11px] font-mono text-slate-400 hidden sm:flex items-center gap-1.5">
              <span>Target:</span>
              {selectedCell ? (
                <span className="text-amber-300 font-semibold">
                  [{selectedCell.lat.toFixed(0)}°, {selectedCell.lon.toFixed(0)}°]{' '}
                  <span className="capitalize font-normal text-slate-300">
                    ({selectedCell.terrain.replace('_', ' ')} • {selectedCell.climate})
                  </span>
                </span>
              ) : (
                <span className="text-slate-500 italic">Click globe to select cell</span>
              )}
            </div>
          </div>

          {/* Granularity & Scope Controls for Land & Sky */}
          {activeCategory === 'land' && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-2.5 mb-2 border-b border-slate-800/60 text-[11px]">
              {/* Sub-tab: Geology vs Climate */}
              <div className="flex gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                <button
                  onClick={() => setLandSubTab('geology')}
                  className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                    landSubTab === 'geology'
                      ? 'bg-amber-600/30 text-amber-200 border border-amber-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Mountain className="w-3 h-3 text-amber-400" /> Geologic Terrain ({landCost} Pts)
                </button>
                <button
                  onClick={() => setLandSubTab('climate')}
                  className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                    landSubTab === 'climate'
                      ? 'bg-cyan-600/30 text-cyan-200 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Wind className="w-3 h-3 text-cyan-400" /> Climate Currents ({climateCost} Pts)
                </button>
              </div>

              {/* Scope & Granularity Selector */}
              <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-medium px-1 flex items-center gap-1">
                  <Compass className="w-3 h-3 text-amber-400" /> Ripple Scope:
                </span>
                <button
                  onClick={() => setShapingScope('cascade')}
                  className={`px-2 py-0.5 rounded-md transition ${
                    shapingScope === 'cascade'
                      ? 'bg-amber-600 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Full cascading physics ripple across 4 concentric rings (e.g. Volcano -> Mountains -> Hills -> Plains -> Shallows)"
                >
                  Tectonic Cascade (4 Rings)
                </button>
                <button
                  onClick={() => setShapingScope('regional')}
                  className={`px-2 py-0.5 rounded-md transition ${
                    shapingScope === 'regional'
                      ? 'bg-amber-600 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Moderate regional ripple across 2 concentric rings at reduced power cost"
                >
                  Regional (2 Rings)
                </button>
                <button
                  onClick={() => setShapingScope('pinpoint')}
                  className={`px-2 py-0.5 rounded-md transition ${
                    shapingScope === 'pinpoint'
                      ? 'bg-amber-600 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Precision surgical modification of a single cell at lowest power cost"
                >
                  Pinpoint (1 Cell)
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons for Active Tab */}
          <div className="flex flex-wrap items-center gap-2">
            {activeCategory === 'land' && landSubTab === 'geology' && (
              <>
                <button
                  onClick={() => onShapeTerrain('volcanic', shapingScope)}
                  disabled={playerPower < landCost}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-red-500/40 flex items-center gap-2 text-slate-200 transition"
                  title="Erupt volcanic caldera triggering mountain ring, foothills, and fertile ash lowlands"
                >
                  <Flame className="w-4 h-4 text-red-500" />
                  <div className="text-left">
                    <div className="font-semibold text-white">Volcanic Crags</div>
                    <div className="text-[10px] text-amber-400">{landCost} Power</div>
                  </div>
                </button>

                <button
                  onClick={() => onShapeTerrain('mountains', shapingScope)}
                  disabled={playerPower < landCost}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700/80 flex items-center gap-2 text-slate-200 transition"
                  title="Raise high mountain ridges, alpine crests, and foothills"
                >
                  <Mountain className="w-4 h-4 text-stone-300" />
                  <div className="text-left">
                    <div className="font-semibold text-white">Raise Mountains</div>
                    <div className="text-[10px] text-amber-400">{landCost} Power</div>
                  </div>
                </button>

                <button
                  onClick={() => onShapeTerrain('hills', shapingScope)}
                  disabled={playerPower < landCost}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-amber-700/60 flex items-center gap-2 text-slate-200 transition"
                  title="Raise rugged rolling hills and highland plateaus descending into plains"
                >
                  <Mountain className="w-4 h-4 text-amber-500" />
                  <div className="text-left">
                    <div className="font-semibold text-white">Rolling Hills</div>
                    <div className="text-[10px] text-amber-400">{landCost} Power</div>
                  </div>
                </button>

                <button
                  onClick={() => onShapeTerrain('swamp', shapingScope)}
                  disabled={playerPower < landCost}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-lime-700/60 flex items-center gap-2 text-slate-200 transition"
                  title="Sink land into mist-shrouded swamps, wetlands, bayous, and fens"
                >
                  <Droplets className="w-4 h-4 text-lime-400" />
                  <div className="text-left">
                    <div className="font-semibold text-white">Swamps & Mires</div>
                    <div className="text-[10px] text-amber-400">{landCost} Power</div>
                  </div>
                </button>

                <button
                  onClick={() => onShapeTerrain('forest', shapingScope)}
                  disabled={playerPower < landCost}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-emerald-700/60 flex items-center gap-2 text-slate-200 transition"
                  title="Seed lush ancient woodlands with transpiration rainfall"
                >
                  <TreePine className="w-4 h-4 text-emerald-400" />
                  <div className="text-left">
                    <div className="font-semibold text-white">Seed Forests</div>
                    <div className="text-[10px] text-amber-400">{landCost} Power</div>
                  </div>
                </button>

                <button
                  onClick={() => onShapeTerrain('plains', shapingScope)}
                  disabled={playerPower < landCost}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-yellow-700/60 flex items-center gap-2 text-slate-200 transition"
                  title="Flatten into fertile grasslands, savannas, and meadows"
                >
                  <Sun className="w-4 h-4 text-yellow-400" />
                  <div className="text-left">
                    <div className="font-semibold text-white">Fertile Plains</div>
                    <div className="text-[10px] text-amber-400">{landCost} Power</div>
                  </div>
                </button>

                <button
                  onClick={() => onShapeTerrain('desert', shapingScope)}
                  disabled={playerPower < landCost}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-orange-800/60 flex items-center gap-2 text-slate-200 transition"
                  title="Scorch soil into dry desert dunes and arid steppes"
                >
                  <Sun className="w-4 h-4 text-orange-400" />
                  <div className="text-left">
                    <div className="font-semibold text-white">Arid Desert</div>
                    <div className="text-[10px] text-amber-400">{landCost} Power</div>
                  </div>
                </button>

                <button
                  onClick={() => onShapeTerrain('deep_ocean', shapingScope)}
                  disabled={playerPower < landCost}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-sky-800/60 flex items-center gap-2 text-slate-200 transition"
                  title="Cleave abyssal ocean trench eroding surrounding coastline"
                >
                  <Waves className="w-4 h-4 text-sky-400" />
                  <div className="text-left">
                    <div className="font-semibold text-white">Sink Ocean</div>
                    <div className="text-[10px] text-amber-400">{landCost} Power</div>
                  </div>
                </button>
              </>
            )}

            {activeCategory === 'land' && landSubTab === 'climate' && (
              <>
                <button
                  onClick={() => onShapeClimate('tropical', shapingScope)}
                  disabled={playerPower < climateCost}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-emerald-500/40 flex items-center gap-2 text-slate-200 transition"
                  title="Channel warm tropical monsoons, high humidity, and lush vegetation"
                >
                  <Sun className="w-4 h-4 text-emerald-400" />
                  <div className="text-left">
                    <div className="font-semibold text-white">Tropical Monsoons</div>
                    <div className="text-[10px] text-cyan-400">{climateCost} Power</div>
                  </div>
                </button>

                <button
                  onClick={() => onShapeClimate('temperate', shapingScope)}
                  disabled={playerPower < climateCost}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-sky-500/40 flex items-center gap-2 text-slate-200 transition"
                  title="Brings balanced temperate rainfall and fertile seasons"
                >
                  <Droplets className="w-4 h-4 text-sky-400" />
                  <div className="text-left">
                    <div className="font-semibold text-white">Temperate Rains</div>
                    <div className="text-[10px] text-cyan-400">{climateCost} Power</div>
                  </div>
                </button>

                <button
                  onClick={() => onShapeClimate('arctic', shapingScope)}
                  disabled={playerPower < climateCost}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-cyan-500/40 flex items-center gap-2 text-slate-200 transition"
                  title="Summon freezing polar winds, permafrost, and glacial ice packs"
                >
                  <ThermometerSnowflake className="w-4 h-4 text-cyan-300" />
                  <div className="text-left">
                    <div className="font-semibold text-white">Arctic Frost</div>
                    <div className="text-[10px] text-cyan-400">{climateCost} Power</div>
                  </div>
                </button>

                <button
                  onClick={() => onShapeClimate('arid', shapingScope)}
                  disabled={playerPower < climateCost}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-amber-500/40 flex items-center gap-2 text-slate-200 transition"
                  title="Enforce scorching sun and drought across continental steppes"
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <div className="text-left">
                    <div className="font-semibold text-white">Arid Drought</div>
                    <div className="text-[10px] text-cyan-400">{climateCost} Power</div>
                  </div>
                </button>

                <button
                  onClick={() => onShapeClimate('geothermal', shapingScope)}
                  disabled={playerPower < climateCost}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-red-500/40 flex items-center gap-2 text-slate-200 transition"
                  title="Heat the atmosphere with sulfuric geothermal steam vents"
                >
                  <Flame className="w-4 h-4 text-red-500" />
                  <div className="text-left">
                    <div className="font-semibold text-white">Geothermal Vents</div>
                    <div className="text-[10px] text-cyan-400">{climateCost} Power</div>
                  </div>
                </button>
              </>
            )}

            {activeCategory === 'life' && (
              <>
                <button
                  onClick={onOpenRaceSynthesizer}
                  disabled={playerPower < costs.create_race[currentAge]}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold flex items-center gap-2 transition shadow-md"
                >
                  <Dna className="w-4 h-4" />
                  <div className="text-left">
                    <div className="font-semibold">Race Synthesizer</div>
                    <div className="text-[10px] text-emerald-100 font-normal">
                      Create Race ({costs.create_race[currentAge]} Pts)
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => onExecuteAction('advance_civ')}
                  disabled={playerPower < costs.advance_civ[currentAge]}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700/80 flex items-center gap-2 text-slate-200 transition"
                  title="Gift your civilization expert knowledge of smithing, arcana, or navigation"
                >
                  <Hammer className="w-4 h-4 text-amber-400" />
                  <div className="text-left">
                    <div className="font-semibold text-white">Advance Civ</div>
                    <div className="text-[10px] text-amber-400">{costs.advance_civ[currentAge]} Power</div>
                  </div>
                </button>

                <button
                  onClick={() => onExecuteAction('purify_civ')}
                  disabled={playerPower < costs.purify_civ[currentAge]}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700/80 flex items-center gap-2 text-slate-200 transition"
                  title="Purify civilization toward righteous virtue (+1 Alignment)"
                >
                  <Sun className="w-4 h-4 text-amber-300" />
                  <div className="text-left">
                    <div className="font-semibold text-white">Purify Civ (+1)</div>
                    <div className="text-[10px] text-amber-400">{costs.purify_civ[currentAge]} Power</div>
                  </div>
                </button>

                <button
                  onClick={() => onExecuteAction('corrupt_civ')}
                  disabled={playerPower < costs.corrupt_civ[currentAge]}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700/80 flex items-center gap-2 text-slate-200 transition"
                  title="Corrupt civilization with shadow and ruthless malice (-1 Alignment)"
                >
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <div className="text-left">
                    <div className="font-semibold text-white">Corrupt Civ (-1)</div>
                    <div className="text-[10px] text-amber-400">{costs.corrupt_civ[currentAge]} Power</div>
                  </div>
                </button>
              </>
            )}

            {activeCategory === 'civilization' && (
              <>
                <button
                  onClick={() => onExecuteAction('command_race')}
                  disabled={playerPower < costs.command_race[currentAge]}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700/80 flex items-center gap-2 text-slate-200 transition"
                  title="Command race to found a new settlement on targeted cell"
                >
                  <Castle className="w-4 h-4 text-sky-400" />
                  <div className="text-left">
                    <div className="font-semibold text-white">Found Settlement</div>
                    <div className="text-[10px] text-amber-400">{costs.command_race[currentAge]} Power</div>
                  </div>
                </button>

                <button
                  onClick={() => onExecuteAction('command_city')}
                  disabled={playerPower < costs.command_city[currentAge]}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700/80 flex items-center gap-2 text-slate-200 transition"
                  title="Muster an army at chosen city or construct defensive walls"
                >
                  <Crown className="w-4 h-4 text-indigo-400" />
                  <div className="text-left">
                    <div className="font-semibold text-white">Raise Army / Walls</div>
                    <div className="text-[10px] text-amber-400">{costs.command_city[currentAge]} Power</div>
                  </div>
                </button>

                <button
                  onClick={() => onExecuteAction('create_order')}
                  disabled={playerPower < costs.create_order[currentAge]}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700/80 flex items-center gap-2 text-slate-200 transition"
                  title="Found a chivalric knightly order, arcane circle, or merchant guild"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <div className="text-left">
                    <div className="font-semibold text-white">Create Order</div>
                    <div className="text-[10px] text-amber-400">{costs.create_order[currentAge]} Power</div>
                  </div>
                </button>

                <button
                  onClick={() => onExecuteAction('create_avatar')}
                  disabled={playerPower < costs.create_avatar[currentAge]}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700/80 flex items-center gap-2 text-slate-200 transition"
                  title="Manifest your divine avatar to walk mortal lands"
                >
                  <Crown className="w-4 h-4 text-yellow-300" />
                  <div className="text-left">
                    <div className="font-semibold text-white">Create Avatar</div>
                    <div className="text-[10px] text-amber-400">{costs.create_avatar[currentAge]} Power</div>
                  </div>
                </button>
              </>
            )}

            {activeCategory === 'wrath' && (
              <>
                <button
                  onClick={onOpenMiracleWeaver}
                  disabled={playerPower < costs.custom_miracle[currentAge]}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 disabled:opacity-40 text-slate-950 font-bold flex items-center gap-2 transition shadow-md"
                >
                  <Wand2 className="w-4 h-4" />
                  <div className="text-left">
                    <div className="font-semibold">Weave Custom Miracle</div>
                    <div className="text-[10px] font-normal">
                      Shift Climate & Destinies ({costs.custom_miracle[currentAge]} Pts)
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => onExecuteAction('catastrophe')}
                  disabled={playerPower < costs.catastrophe[currentAge]}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-red-500/40 flex items-center gap-2 text-red-200 transition"
                  title="Unleash meteor strike, flood, or plague destroying enemy armies or city walls"
                >
                  <Flame className="w-4 h-4 text-red-400" />
                  <div className="text-left">
                    <div className="font-semibold text-red-300">Catastrophe</div>
                    <div className="text-[10px] text-amber-400">{costs.catastrophe[currentAge]} Power</div>
                  </div>
                </button>

                <button
                  onClick={() => onExecuteAction('event')}
                  disabled={playerPower < costs.event[currentAge]}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700/80 flex items-center gap-2 text-slate-200 transition"
                  title="Trigger a sudden wind of fortune: Gold Rush or Arcane Surge"
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <div className="text-left">
                    <div className="font-semibold text-white">Divine Event</div>
                    <div className="text-[10px] text-amber-400">{costs.event[currentAge]} Power</div>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
