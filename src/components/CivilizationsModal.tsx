/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { City, Civilization, Deity, OrderItem, Race } from '../types/game';
import { CoatOfArmsView } from './CoatOfArmsView';
import {
  X,
  Crown,
  Building2,
  Users,
  Compass,
  Sparkles,
  Shield,
  Layers,
  BookOpen,
} from 'lucide-react';

interface CivilizationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  civilizations: Civilization[];
  cities: City[];
  races: Race[];
  deities: Deity[];
  orders: OrderItem[];
  onSelectCityOnMap: (cellIndex: number) => void;
  onOpenRaceModal: () => void;
}

export const CivilizationsModal: React.FC<CivilizationsModalProps> = ({
  isOpen,
  onClose,
  civilizations,
  cities,
  races,
  deities,
  orders,
  onSelectCityOnMap,
  onOpenRaceModal,
}) => {
  if (!isOpen) return null;

  const totalPop = cities.reduce((sum, c) => sum + (c.population || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif text-white tracking-wide flex items-center gap-2">
                Sovereign Civilizations & Realms
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-sans border border-slate-700">
                  {civilizations.length} {civilizations.length === 1 ? 'Realm' : 'Realms'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Active mortal empires, heraldic crests, demographics, and cultural orders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Statistics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 px-6 py-3 bg-slate-950/50 border-b border-slate-800/80 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Settlements</div>
              <div className="text-sm font-bold text-white">{cities.length} Cities</div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
            <Users className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Global Mortals</div>
              <div className="text-sm font-bold text-white">{totalPop.toLocaleString()} Pop.</div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Holy/Arcane Orders</div>
              <div className="text-sm font-bold text-white">{orders.length} Active</div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
            <Crown className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Sentient Lineages</div>
              <div className="text-sm font-bold text-white">{races.length} Species</div>
            </div>
          </div>
        </div>

        {/* Civilizations Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {civilizations.length === 0 ? (
            <div className="py-12 text-center space-y-4">
              <div className="p-4 rounded-full bg-slate-800/80 text-slate-400 inline-block border border-slate-700">
                <Shield className="w-8 h-8 opacity-70" />
              </div>
              <h3 className="text-base font-bold text-white">No Sovereign Civilizations Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                The world is currently primordial. As you progress into the Second Age of Races, awakening a sentient species will establish the first mortal settlements and bestow their heraldic coat-of-arms!
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenRaceModal();
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/20 inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Awaken First Sentient Race
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {civilizations.map((civ) => {
                const race = races.find((r) => r.id === civ.raceId);
                const deity = deities.find((d) => d.id === civ.creatorDeityId);
                const civCities = cities.filter((c) => c.civilizationId === civ.id);
                const civPop = civCities.reduce((s, c) => s + (c.population || 0), 0);
                const capitalCity = cities.find((c) => c.id === civ.capitalCityId) || civCities[0];
                const civOrders = orders.filter((o) => o.civilizationId === civ.id);

                return (
                  <div
                    key={civ.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
                  >
                    <div>
                      {/* Top Row: Coat of Arms + Names */}
                      <div className="flex items-start gap-3.5 mb-2.5">
                        <div className="shrink-0">
                          <CoatOfArmsView coatOfArms={civ.coatOfArms} size="md" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-white truncate font-serif tracking-wide">
                            {civ.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {race && (
                              <span
                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center gap-1"
                                style={{
                                  backgroundColor: `${race.color || '#60a5fa'}20`,
                                  borderColor: `${race.color || '#60a5fa'}50`,
                                  color: race.color || '#93c5fd',
                                }}
                              >
                                {race.name} ({race.demonym})
                              </span>
                            )}
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
                                civ.alignment > 0
                                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
                                  : civ.alignment < 0
                                  ? 'bg-red-950/70 text-red-300 border-red-800'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              {civ.alignment > 0 ? 'Virtuous' : civ.alignment < 0 ? 'Ruthless' : 'Neutral'}
                            </span>
                          </div>
                          {deity && (
                            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                              <span>Patron:</span>
                              <span
                                className="font-semibold"
                                style={{ color: deity.color }}
                              >
                                {deity.name}
                              </span>
                              {deity.isPlayer && (
                                <span className="text-amber-400 font-bold">(You)</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Demographics & Settlements */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 mb-2.5">
                        <div>
                          <div className="text-[10px] text-slate-400">Total Population</div>
                          <div className="text-xs font-bold text-white">
                            {civPop.toLocaleString()} souls
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Capital City</div>
                          <div className="text-xs font-bold text-amber-300 truncate">
                            {capitalCity ? capitalCity.name : 'Nomadic'}
                          </div>
                        </div>
                      </div>

                      {/* Researched Technologies */}
                      {civ.technologies && civ.technologies.length > 0 && (
                        <div className="mb-2">
                          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-indigo-400" /> Technologies ({civ.technologies.length})
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {civ.technologies.map((t) => (
                              <span
                                key={t}
                                className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 text-[10px] border border-slate-700/60"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Orders */}
                      {civOrders.length > 0 && (
                        <div>
                          <div className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-400" /> Active Orders ({civOrders.length})
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {civOrders.map((o) => (
                              <span
                                key={o.id}
                                className="px-1.5 py-0.5 rounded bg-purple-950/40 text-purple-300 text-[10px] border border-purple-800/60"
                              >
                                {o.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    {capitalCity && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectCityOnMap(capitalCity.cellIndex);
                          onClose();
                        }}
                        className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition"
                      >
                        <Compass className="w-3.5 h-3.5 text-amber-400" />
                        Inspect Capital ({capitalCity.name}) on Atlas
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
