/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Civilization, Race } from '../types/game';
import {
  calculateTechCost,
  DEFAULT_TECH_TREE,
  TECH_CATEGORIES,
  TechCategory,
  TechItem,
} from '../simulation/techTree';
import {
  X,
  Swords,
  Wheat,
  Scroll,
  Wand2,
  Ship,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface TechTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  civilizations: Civilization[];
  playerCivilization: Civilization | null;
  races: Race[];
  playerPower: number;
  onResearchTech: (civId: string, tech: TechItem, cost: number) => void;
}

export const TechTreeModal: React.FC<TechTreeModalProps> = ({
  isOpen,
  onClose,
  civilizations,
  playerCivilization,
  races,
  playerPower,
  onResearchTech,
}) => {
  if (!isOpen) return null;

  const [selectedCivId, setSelectedCivId] = useState<string>(
    playerCivilization ? playerCivilization.id : civilizations[0]?.id || ''
  );
  const [activeCategory, setActiveCategory] = useState<TechCategory>('combat');

  const activeCiv = civilizations.find((c) => c.id === selectedCivId) || civilizations[0];
  const activeRace = races.find((r) => r.id === activeCiv?.raceId);
  const ownedTechs = activeCiv?.technologies || [];

  const categoryMeta = TECH_CATEGORIES[activeCategory];
  const techsInCategory = DEFAULT_TECH_TREE[activeCategory] || [];

  const getCategoryIcon = (cat: TechCategory) => {
    switch (cat) {
      case 'combat':
        return <Swords className="w-4 h-4 text-red-400" />;
      case 'agriculture':
        return <Wheat className="w-4 h-4 text-emerald-400" />;
      case 'knowledge':
        return <Scroll className="w-4 h-4 text-blue-400" />;
      case 'magic':
        return <Wand2 className="w-4 h-4 text-purple-400" />;
      case 'naval_logistics':
        return <Ship className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-yellow-300 border border-amber-500/30">
              <Scroll className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-white tracking-wide flex items-center gap-2">
                Civilization Tech Progression (5-Tier System)
              </h2>
              <p className="text-xs text-slate-400">
                Unlock advancements across 5 tiers. Races may skip intermediate tiers at 1.5× Power cost.
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

        {/* Civ Selector & Power Bar */}
        <div className="px-6 py-3 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Civilization:</span>
            <div className="flex items-center gap-1.5">
              {civilizations.map((civ) => {
                const race = races.find((r) => r.id === civ.raceId);
                const isSelected = civ.id === activeCiv?.id;
                return (
                  <button
                    key={civ.id}
                    onClick={() => setSelectedCivId(civ.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
                      isSelected
                        ? 'border-amber-500/80 bg-amber-950/50 text-white shadow ring-1 ring-amber-400/50'
                        : 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: civ.color }} />
                    <span>{civ.name}</span>
                    <span className="text-[10px] text-slate-400">({race?.name})</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
            <span className="text-slate-400">⚡ Available Power:</span>
            <span className="text-yellow-300 font-bold">{playerPower} Pts</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-6 pt-3 bg-slate-950 flex items-center gap-2 border-b border-slate-800 overflow-x-auto">
          {(Object.keys(TECH_CATEGORIES) as TechCategory[]).map((catKey) => {
            const cat = TECH_CATEGORIES[catKey];
            const isCurrent = activeCategory === catKey;
            const categoryTechs = DEFAULT_TECH_TREE[catKey];
            const ownedCount = categoryTechs.filter((t) => ownedTechs.includes(t.name)).length;

            return (
              <button
                key={catKey}
                onClick={() => setActiveCategory(catKey)}
                className={`px-4 py-2.5 border-b-2 font-bold text-xs flex items-center gap-2 transition whitespace-nowrap ${
                  isCurrent
                    ? 'border-amber-400 text-amber-200 bg-slate-900/40 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
                }`}
              >
                {getCategoryIcon(catKey)}
                <span>{cat.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {ownedCount}/5
                </span>
              </button>
            );
          })}
        </div>

        {/* Tech Tree Flow by Tier */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
            <div>
              <span className="font-bold text-slate-200">{categoryMeta.name}: </span>
              {categoryMeta.description}
            </div>
            <div className="text-[11px] font-mono text-amber-300/80">
              ⚡ Tier Skip Multiplier: 1.5× Power Cost
            </div>
          </div>

          <div className="space-y-3">
            {techsInCategory.map((tech) => {
              const isOwned = ownedTechs.includes(tech.name);
              const { cost, isTierSkip, skippedTierCount } = calculateTechCost(
                tech,
                ownedTechs,
                DEFAULT_TECH_TREE
              );
              const canAfford = playerPower >= cost;

              return (
                <div
                  key={tech.id}
                  className={`p-4 rounded-xl border transition flex items-center justify-between gap-4 ${
                    isOwned
                      ? 'border-emerald-500/50 bg-emerald-950/20 shadow-sm'
                      : isTierSkip
                      ? 'border-purple-500/40 bg-purple-950/15'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900/80'
                  }`}
                >
                  {/* Left: Tier Badge & Details */}
                  <div className="flex items-start gap-3.5 flex-1">
                    <div
                      className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center font-bold font-mono text-xs flex-shrink-0 border ${
                        isOwned
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                          : 'border-slate-700 bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="text-[9px] uppercase tracking-tighter text-slate-400 font-sans">
                        Tier
                      </span>
                      <span>{tech.tier}</span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-bold text-sm text-white">{tech.name}</h4>
                        {isOwned && (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Researched
                          </span>
                        )}
                        {!isOwned && isTierSkip && (
                          <span className="flex items-center gap-1 text-[10px] text-purple-300 font-mono bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-500/40">
                            ⚡ Tier Jump ({skippedTierCount} skipped • 1.5× Cost)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{tech.description}</p>
                      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-amber-300 font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Benefit: {tech.bonusSummary}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Research Action */}
                  <div className="flex items-center gap-3">
                    {!isOwned && (
                      <button
                        onClick={() => {
                          if (canAfford && activeCiv) {
                            onResearchTech(activeCiv.id, tech, cost);
                          }
                        }}
                        disabled={!canAfford}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow ${
                          canAfford
                            ? isTierSkip
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/40'
                              : 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-amber-900/30'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Research ({cost} Power)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-400">
            Selected Civ:{' '}
            <span className="text-white font-bold">{activeCiv?.name}</span> ({activeRace?.name}
            — Tech Affinity: {activeRace?.techAffinity.toFixed(2)}×)
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
