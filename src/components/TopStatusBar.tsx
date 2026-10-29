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
  Shield,
  HelpCircle,
} from 'lucide-react';

interface TopStatusBarProps {
  worldName?: string;
  currentAge: AgeId;
  round: number;
  roundsInCurrentAge?: number;
  year: number;
  activeDeity: Deity;
  playerDeity: Deity;
  deityCount: number;
  civilizationsCount: number;
  mapViewMode: MapViewMode;
  onSelectMapViewMode: (mode: MapViewMode) => void;
  is3DMode: boolean;
  onToggle3DMode: () => void;
  onEndPlayerTurn: () => void;
  canAdvanceAge: boolean;
  onAdvanceAge: () => void;
  onOpenChronicle: () => void;
  onOpenPantheon: () => void;
  onOpenCivilizations: () => void;
  onOpenNewGame: () => void;
  onOpenSaveLoad: () => void;
  onOpenTutorial?: () => void;
  isTutorialActive?: boolean;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({
  worldName = 'Meglin',
  currentAge,
  round,
  roundsInCurrentAge = 1,
  year,
  activeDeity,
  playerDeity,
  deityCount,
  civilizationsCount,
  mapViewMode,
  onSelectMapViewMode,
  is3DMode,
  onToggle3DMode,
  onEndPlayerTurn,
  canAdvanceAge,
  onAdvanceAge,
  onOpenChronicle,
  onOpenPantheon,
  onOpenCivilizations,
  onOpenNewGame,
  onOpenSaveLoad,
  onOpenTutorial,
  isTutorialActive = false,
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
    <header className="relative z-30 w-full bg-slate-950/95 border-b border-slate-800 backdrop-blur-md px-3 sm:px-4 py-2 text-xs text-slate-200 shadow-xl select-none">
      <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* ========================================================================= */}
        {/* COLUMN 1 (LEFT): WORLD NAME & AGE HEADER + CONTROLS & MAP LAYERS          */}
        {/* ========================================================================= */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-[320px]">
          {/* Top Line: [WORLD NAME] | [AGE]: [NAME OF AGE]        [Current Game Year] */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-sm sm:text-base text-yellow-300 tracking-wide drop-shadow-sm">
                {worldName}
              </span>
              <span className="text-yellow-400/60 font-serif font-bold">|</span>
              <span className="font-serif font-bold text-xs sm:text-sm text-amber-200 tracking-wide">
                {ageInfo.name}
              </span>
            </div>

            <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-semibold">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                Year {year.toLocaleString()}
              </span>
              {currentAge !== '3rd_age_relations' ? (
                <span className="text-[11px] text-slate-400 font-sans font-normal hidden md:inline">
                  (Age Round {roundsInCurrentAge}/5)
                </span>
              ) : (
                <span className="text-[10px] text-amber-400/90 font-sans font-semibold px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/40">
                  Final Epoch
                </span>
              )}
            </div>

            {/* Advance Age Action Button (Only visible when criteria are fulfilled) */}
            {canAdvanceAge && (
              <button
                onClick={onAdvanceAge}
                className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-md shadow-amber-500/30 transition flex items-center gap-1 animate-pulse"
                title={
                  currentAge === '1st_age_land'
                    ? '5 rounds in Age of Land completed — Advance into 2nd Age of Races!'
                    : '5 rounds + active civilizations — Advance into 3rd Age of Relations!'
                }
              >
                <span>Advance Age</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Bottom Line: [New Genesis] [Save/Load]   [Guide]   [Layers] */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* New Genesis & Save/Load Capsule */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shrink-0">
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

            {/* Guide Button */}
            {onOpenTutorial && (
              <button
                data-tutorial="tutorial-button"
                onClick={onOpenTutorial}
                className={`px-2.5 py-1.5 rounded-xl border transition flex items-center gap-1 text-[11px] font-semibold shadow shrink-0 ${
                  isTutorialActive
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 ring-2 ring-amber-400/30 animate-pulse'
                    : 'bg-slate-900 border-slate-800 text-amber-400 hover:text-amber-200 hover:bg-slate-800'
                }`}
                title="Launch Interactive Divine Walkthrough & How to Play"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Guide</span>
              </button>
            )}

            {/* Map Layer Filter Pills */}
            <div
              data-tutorial="map-layers"
              className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 overflow-x-auto shrink-0"
            >
              <div className="flex items-center gap-1 mr-0.5 pl-1 text-[11px] text-slate-400 font-medium">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              {mapLayerOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onSelectMapViewMode(opt.id)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] transition whitespace-nowrap ${
                    mapViewMode === opt.id
                      ? 'bg-indigo-600 text-white font-medium shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden lg:block w-[1px] h-14 bg-slate-800/90 mx-1 shrink-0" />

        {/* ========================================================================= */}
        {/* COLUMN 2 (MIDDLE): PANTHEON & CHRONICLE / CIVILIZATIONS (COUNT) / 2D-3D   */}
        {/* ========================================================================= */}
        <div className="flex flex-col items-center justify-between gap-1 shrink-0">
          {/* Top Row: Pantheon & Chronicle */}
          <div className="flex items-center gap-1.5 w-full justify-center">
            <button
              data-tutorial="pantheon-button"
              onClick={onOpenPantheon}
              className="px-2.5 py-1 rounded-xl bg-purple-950/50 border border-purple-500/50 hover:bg-purple-900/70 text-purple-200 font-semibold transition flex items-center gap-1.5 text-xs shadow"
              title="Inspect all Deities, personalities, inter-deity rivalries and myths"
            >
              <Crown className="w-3.5 h-3.5 text-purple-400" />
              <span>Pantheon</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-purple-500/25 text-purple-300 border border-purple-500/40 font-bold">
                {deityCount}
              </span>
            </button>

            <button
              data-tutorial="chronicle-button"
              onClick={onOpenChronicle}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition shadow"
              title="Open The Great Chronicle of Bede (Historical Records)"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>

          {/* Middle Row (Highlighted in user screenshot): Civilizations (COUNT) */}
          <button
            onClick={onOpenCivilizations}
            className="w-full px-3 py-1 rounded-xl bg-indigo-950/40 border border-indigo-500/50 hover:bg-indigo-900/60 text-indigo-200 font-semibold transition flex items-center justify-center gap-1.5 text-[11px] shadow"
            title="Inspect all sovereign mortal civilizations, populations, and heraldic coat-of-arms"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Civilizations</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 font-bold">
              {civilizationsCount}
            </span>
          </button>

          {/* Bottom Row: 2D Atlas <--> 3D Globe Slider */}
          <div
            data-tutorial="view-toggle"
            onClick={onToggle3DMode}
            className="relative flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-700/80 cursor-pointer select-none text-[10px] font-semibold transition shrink-0"
            role="switch"
            aria-checked={is3DMode}
            title="Slide between 2D Cartographer's Atlas and 3D Spherical Globe"
          >
            <div
              className={`absolute top-0.5 bottom-0.5 w-[68px] rounded-lg transition-all duration-300 ease-out shadow-md ${
                !is3DMode
                  ? 'left-0.5 bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-950 shadow-amber-500/25'
                  : 'left-[71px] bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-500/25'
              }`}
            />
            <span
              className={`relative z-10 w-[68px] py-0.5 text-center flex items-center justify-center gap-1 transition-colors duration-200 ${
                !is3DMode ? 'text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Map className={`w-3 h-3 ${!is3DMode ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>2D Atlas</span>
            </span>
            <span
              className={`relative z-10 w-[68px] py-0.5 text-center flex items-center justify-center gap-1 transition-colors duration-200 ${
                is3DMode ? 'text-white font-black' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className={`w-3 h-3 ${is3DMode ? 'text-white' : 'text-cyan-400'}`} />
              <span>3D Globe</span>
            </span>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden lg:block w-[1px] h-14 bg-slate-800/90 mx-1 shrink-0" />

        {/* ========================================================================= */}
        {/* COLUMN 3 (RIGHT): POWER + TURN / END TURN + ROUND INDICATOR               */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Sub-col Left: Power Points & Turn Indicator */}
          <div className="flex flex-col gap-1">
            {/* Divine Power Meter */}
            <div
              data-tutorial="power-meter"
              className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-600/50 px-2.5 py-1 rounded-xl text-amber-200 shadow"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <div className="flex items-center gap-1 font-bold font-mono text-xs leading-none">
                <span className="text-yellow-300">{playerDeity.power} Pts</span>
                <span className="text-[9px] text-amber-400/80 font-normal">
                  (2d6: {playerDeity.lastRoll[0] + playerDeity.lastRoll[1]})
                </span>
                {playerDeity.thriftBonus > 0 && (
                  <span className="text-[9px] text-emerald-400 font-normal ml-0.5">
                    +{playerDeity.thriftBonus} Thrift
                  </span>
                )}
              </div>
            </div>

            {/* Active Turn Badge */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800 text-[11px]">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: activeDeity.color }}
              />
              <span className="text-slate-300 truncate max-w-[140px]">
                Turn:{' '}
                <span className="font-bold text-white">
                  {activeDeity.isPlayer ? `You (${playerDeity.name})` : activeDeity.name}
                </span>
              </span>
            </div>
          </div>

          {/* Sub-col Right: End Turn Button & Round Indicator */}
          <div className="flex flex-col items-center gap-1">
            {activeDeity.isPlayer ? (
              <button
                data-tutorial="end-turn"
                onClick={onEndPlayerTurn}
                className="px-4 py-2 rounded-xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-700/40 transition text-xs flex items-center gap-1 cursor-pointer"
              >
                <span>End Turn</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs italic">
                Meditating...
              </div>
            )}

            {/* Round Indicator */}
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Round {round}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
