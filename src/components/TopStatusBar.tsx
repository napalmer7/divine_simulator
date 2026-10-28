/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AgeId, AGES, Deity, MapViewMode } from '../types/game';
import {
  Sparkles,
  Globe,
  Map,
  ChevronRight,
  BookOpen,
  Layers,
  Crown,
  Save,
  PlusCircle,
  Gem,
} from 'lucide-react';

interface TopStatusBarProps {
  currentAge: AgeId;
  round: number;
  year: number;
  activeDeity: Deity;
  playerDeity: Deity;
  deityCount: number;
  mapViewMode: MapViewMode;
  onSelectMapViewMode: (mode: MapViewMode) => void;
  is3DMode: boolean;
  onToggle3DMode: () => void;
  onEndPlayerTurn: () => void;
  canAdvanceAge: boolean;
  onAdvanceAge: () => void;
  onOpenChronicle: () => void;
  onOpenPantheon: () => void;
  onOpenNewGame: () => void;
  onOpenSaveLoad: () => void;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({
  currentAge,
  round,
  year,
  activeDeity,
  playerDeity,
  deityCount,
  mapViewMode,
  onSelectMapViewMode,
  is3DMode,
  onToggle3DMode,
  onEndPlayerTurn,
  canAdvanceAge,
  onAdvanceAge,
  onOpenChronicle,
  onOpenPantheon,
  onOpenNewGame,
  onOpenSaveLoad,
}) => {
  const ageInfo = AGES[currentAge];

  const mapLayerOptions: { id: MapViewMode; label: string }[] = [
    { id: 'physical', label: 'Geography' },
    { id: 'climate', label: 'Biomes & Climate' },
    { id: 'resources', label: 'Resources' },
    { id: 'political', label: 'Territories' },
    { id: 'population', label: 'Pop. Density' },
    { id: 'trade', label: 'Trade Routes' },
    { id: 'conflicts', label: 'Conflicts' },
  ];

  return (
    <header className="relative z-30 w-full bg-slate-950/90 border-b border-slate-800 backdrop-blur-md px-3 sm:px-4 py-2 text-xs text-slate-200 shadow-lg select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Age & World State + New Game / Save Load */}
        <div className="flex items-center gap-2.5">
          {/* New Game & Save/Load Buttons */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={onOpenNewGame}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-600/20 text-amber-300 border border-amber-500/40 hover:bg-amber-600 hover:text-slate-950 transition flex items-center gap-1.5 shadow"
              title="Start a new game with customized world structure, deity count, and player deity"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">New Genesis</span>
            </button>
            <button
              onClick={onOpenSaveLoad}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
              title="Save or load game states and export JSON backups"
            >
              <Save className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Save/Load</span>
            </button>
          </div>

          <div className="h-5 w-[1px] bg-slate-800 hidden sm:block" />

          {/* Age Information */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-xs sm:text-sm tracking-wide text-amber-200">
                {ageInfo.name}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 border border-amber-500/30 text-amber-300">
                R{round} • Year {year.toLocaleString()}
              </span>
            </div>
          </div>

          {canAdvanceAge && (
            <button
              onClick={onAdvanceAge}
              className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 shadow transition flex items-center gap-1 animate-pulse"
              title="5 rounds completed - Vote to advance into the next divine age"
            >
              Advance Age <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Center: Map Layer Filters & 3D/2D switch */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 overflow-x-auto">
          <div className="flex items-center gap-1 mr-1 pl-1 text-[11px] text-slate-400 font-medium">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          {mapLayerOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onSelectMapViewMode(opt.id)}
              className={`px-2 py-1 rounded-lg text-[11px] transition whitespace-nowrap ${
                mapViewMode === opt.id
                  ? 'bg-indigo-600 text-white font-medium shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {opt.label}
            </button>
          ))}

          <div className="w-[1px] h-4 bg-slate-700 mx-1" />

          {/* Slider Style Toggle: 2D World Atlas <--> 3D Globe */}
          <div
            onClick={onToggle3DMode}
            className="relative flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-700/80 cursor-pointer select-none text-[11px] font-semibold transition"
            role="switch"
            aria-checked={is3DMode}
            title="Slide between 2D Cartographer's Atlas and 3D Spherical Globe"
          >
            {/* Sliding Pill Indicator */}
            <div
              className={`absolute top-0.5 bottom-0.5 w-[76px] rounded-lg transition-all duration-300 ease-out shadow-md ${
                !is3DMode
                  ? 'left-0.5 bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-950 shadow-amber-500/25'
                  : 'left-[79px] bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-500/25'
              }`}
            />
            <span
              className={`relative z-10 w-[76px] py-1 text-center flex items-center justify-center gap-1.5 transition-colors duration-200 ${
                !is3DMode ? 'text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Map className={`w-3.5 h-3.5 ${!is3DMode ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>2D Atlas</span>
            </span>
            <span
              className={`relative z-10 w-[76px] py-1 text-center flex items-center justify-center gap-1.5 transition-colors duration-200 ${
                is3DMode ? 'text-white font-black' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className={`w-3.5 h-3.5 ${is3DMode ? 'text-white' : 'text-cyan-400'}`} />
              <span>3D Globe</span>
            </span>
          </div>
        </div>

        {/* Right: Player Power & Turn Execution + Pantheon & Chronicles */}
        <div className="flex items-center gap-2">
          {/* Active Turn Badge */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: activeDeity.color }}
            />
            <span className="text-[11px] text-slate-300">
              Turn:{' '}
              <span className="font-bold text-white">
                {activeDeity.isPlayer ? `You (${playerDeity.name})` : activeDeity.name}
              </span>
            </span>
          </div>

          {/* Divine Power & Dice Roll */}
          <div className="flex items-center gap-2 bg-amber-950/40 border border-amber-600/40 px-2.5 py-1 rounded-lg text-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <div className="flex flex-col text-right">
              <div className="flex items-center gap-1 font-bold font-mono text-xs leading-none">
                <span>{playerDeity.power} Pts</span>
                <span className="text-[9px] text-amber-400/80 font-normal">
                  (2d6: {playerDeity.lastRoll[0] + playerDeity.lastRoll[1]})
                </span>
              </div>
              {playerDeity.thriftBonus > 0 && (
                <span className="text-[9px] text-emerald-400 leading-tight">
                  +{playerDeity.thriftBonus} Thrift
                </span>
              )}
            </div>
          </div>

          {/* End Turn / Pass Action Button */}
          {activeDeity.isPlayer ? (
            <button
              onClick={onEndPlayerTurn}
              className="px-3 py-1.5 rounded-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-700/30 transition text-xs flex items-center gap-1"
            >
              End Turn <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 text-slate-400 text-xs italic">
              Meditating...
            </div>
          )}

          {/* Pantheon Button */}
          <button
            onClick={onOpenPantheon}
            className="px-2.5 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/40 hover:bg-purple-900/60 text-purple-200 font-semibold transition flex items-center gap-1.5 text-xs shadow"
            title="Inspect all Deities, personalities, inter-deity rivalries and myths"
          >
            <Crown className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Pantheon</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {deityCount}
            </span>
          </button>

          {/* Chronicle Quick Button */}
          <button
            onClick={onOpenChronicle}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Open The Great Chronicle of Bede (Historical Records)"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
