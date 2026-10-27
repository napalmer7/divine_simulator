/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AgeId, AGES, Deity, MapViewMode } from '../types/game';
import { Sparkles, Globe, Map, ChevronRight, Dices, ShieldAlert, BookOpen, Layers } from 'lucide-react';

interface TopStatusBarProps {
  currentAge: AgeId;
  round: number;
  year: number;
  activeDeity: Deity;
  playerDeity: Deity;
  mapViewMode: MapViewMode;
  onSelectMapViewMode: (mode: MapViewMode) => void;
  is3DMode: boolean;
  onToggle3DMode: () => void;
  onEndPlayerTurn: () => void;
  canAdvanceAge: boolean;
  onAdvanceAge: () => void;
  onOpenChronicle: () => void;
  onOpenPantheon: () => void;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({
  currentAge,
  round,
  year,
  activeDeity,
  playerDeity,
  mapViewMode,
  onSelectMapViewMode,
  is3DMode,
  onToggle3DMode,
  onEndPlayerTurn,
  canAdvanceAge,
  onAdvanceAge,
  onOpenChronicle,
  onOpenPantheon,
}) => {
  const ageInfo = AGES[currentAge];

  const mapLayerOptions: { id: MapViewMode; label: string }[] = [
    { id: 'physical', label: 'Geography' },
    { id: 'climate', label: 'Biomes & Climate' },
    { id: 'political', label: 'Territories' },
    { id: 'population', label: 'Pop. Density' },
    { id: 'trade', label: 'Trade Routes' },
    { id: 'conflicts', label: 'Conflicts' },
  ];

  return (
    <header className="relative z-30 w-full bg-slate-950/85 border-b border-slate-800 backdrop-blur-md px-4 py-2.5 text-xs text-slate-200 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Age & World State */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm tracking-wide text-amber-200">
                {ageInfo.name}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 border border-amber-500/30 text-amber-300">
                Round {round} • Year {year.toLocaleString()}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {ageInfo.subtitle}
            </span>
          </div>

          {canAdvanceAge && (
            <button
              onClick={onAdvanceAge}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 shadow transition flex items-center gap-1 animate-pulse"
              title="5 rounds completed - Vote to advance into the next divine age"
            >
              Advance Age <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Center: Map Layer Filters & 3D/2D switch */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1 mr-2 pl-1 text-[11px] text-slate-400 font-medium">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Layers:</span>
          </div>
          {mapLayerOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onSelectMapViewMode(opt.id)}
              className={`px-2 py-1 rounded-lg text-[11px] transition ${
                mapViewMode === opt.id
                  ? 'bg-indigo-600 text-white font-medium shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {opt.label}
            </button>
          ))}

          <div className="w-[1px] h-4 bg-slate-700 mx-1" />

          {/* Toggle 3D Globe vs 2D Atlas */}
          <button
            onClick={onToggle3DMode}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition"
            title="Toggle between 3D Globe and 2D Tabletop Atlas"
          >
            {is3DMode ? (
              <>
                <Globe className="w-3.5 h-3.5 text-cyan-400" /> 3D Globe
              </>
            ) : (
              <>
                <Map className="w-3.5 h-3.5 text-amber-400" /> 2D Atlas
              </>
            )}
          </button>
        </div>

        {/* Right: Player Power & Turn Execution */}
        <div className="flex items-center gap-3">
          {/* Active Turn Badge */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: activeDeity.color }}
            />
            <span className="text-[11px] text-slate-300">
              Turn:{' '}
              <span className="font-bold text-white">
                {activeDeity.isPlayer ? 'You (Aethelgard)' : activeDeity.name}
              </span>
            </span>
          </div>

          {/* Divine Power & Dice Roll */}
          <div className="flex items-center gap-2 bg-amber-950/40 border border-amber-600/40 px-3 py-1 rounded-lg text-amber-200">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <div className="flex flex-col text-right">
              <div className="flex items-center gap-1.5 font-bold font-mono text-sm leading-none">
                <span>{playerDeity.power} Pts</span>
                <span className="text-[10px] text-amber-400/80 font-normal">
                  (2d6: {playerDeity.lastRoll[0] + playerDeity.lastRoll[1]})
                </span>
              </div>
              {playerDeity.thriftBonus > 0 && (
                <span className="text-[9px] text-emerald-400 leading-tight">
                  +{playerDeity.thriftBonus} Thrift Bonus
                </span>
              )}
            </div>
          </div>

          {/* End Turn / Pass Action Button */}
          {activeDeity.isPlayer ? (
            <button
              onClick={onEndPlayerTurn}
              className="px-3.5 py-1.5 rounded-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-700/30 transition text-xs flex items-center gap-1.5"
            >
              End Turn <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 text-slate-400 text-xs italic">
              Deity meditating...
            </div>
          )}

          {/* Chronicle & Pantheon Quick Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenPantheon}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Open Divine Pantheon & Diplomatic Rivalries"
            >
              <ShieldAlert className="w-4 h-4 text-purple-400" />
            </button>
            <button
              onClick={onOpenChronicle}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Open The Great Chronicle of Bede (History of the World)"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
