/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Avatar, Civilization, Deity } from '../types/game';
import {
  Crown,
  HeartHandshake,
  ShieldAlert,
  Sparkles,
  X,
  User,
  Scroll,
  Target,
  Flame,
  Scale,
  Compass,
  Gift,
  Swords,
} from 'lucide-react';

interface PantheonDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  deities: Deity[];
  civilizations: Civilization[];
  avatars: Avatar[];
  playerDeity: Deity;
  onOfferPact: (targetDeityId: string) => void;
  onProvokeRival: (targetDeityId: string) => void;
  onBestowTribute?: (targetDeityId: string) => void;
}

export const PantheonDrawer: React.FC<PantheonDrawerProps> = ({
  isOpen,
  onClose,
  deities,
  civilizations,
  avatars,
  playerDeity,
  onOfferPact,
  onProvokeRival,
  onBestowTribute,
}) => {
  const [selectedDeityId, setSelectedDeityId] = useState<string>(deities[0]?.id || playerDeity.id);

  if (!isOpen) return null;

  const activeInspectDeity = deities.find((d) => d.id === selectedDeityId) || playerDeity;
  const isPlayer = activeInspectDeity.isPlayer;
  const civ = civilizations.find((c) => c.creatorDeityId === activeInspectDeity.id);
  const avatar = avatars.find((a) => a.deityId === activeInspectDeity.id && a.isAlive);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-slate-950/95 border-l border-slate-800 shadow-2xl backdrop-blur-md flex flex-col text-slate-100 animate-slide-left">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-serif text-purple-200 tracking-wide flex items-center gap-2">
              The Divine Pantheon ({deities.length} Deities)
            </h2>
            <p className="text-xs text-slate-400">
              Council of Immortals • Shifting Rivalries, Myths & Cosmic Agendas
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

      {/* Deity Selector Carousel / Badges */}
      <div className="flex items-center gap-2 p-3 border-b border-slate-800 bg-slate-900/40 overflow-x-auto">
        {deities.map((d) => {
          const isSelected = d.id === selectedDeityId;
          return (
            <button
              key={d.id}
              onClick={() => setSelectedDeityId(d.id)}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 shrink-0 transition ${
                isSelected
                  ? 'bg-purple-950/60 border-purple-500 shadow-md text-white'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span
                className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs"
                style={{ backgroundColor: `${d.color}30`, color: d.color }}
              >
                {d.symbol}
              </span>
              <span className="font-bold text-xs">{d.name}</span>
              {d.isPlayer && (
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                  You
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Deity Detail Pane */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
        {/* Deity Banner Card */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold border border-white/10 shadow-lg"
                style={{ backgroundColor: `${activeInspectDeity.color}25`, color: activeInspectDeity.color }}
              >
                {activeInspectDeity.symbol}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-white font-serif">{activeInspectDeity.name}</h3>
                  {isPlayer && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30 flex items-center gap-1">
                      <User className="w-3 h-3" /> Player Deity
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-xs">{activeInspectDeity.title}</p>
                <div className="text-[11px] text-amber-300 font-medium mt-0.5">
                  Domain: {activeInspectDeity.domain}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-sm font-mono font-bold text-amber-300">
                {activeInspectDeity.power} Power Pts
              </span>
              <span className="text-[10px] text-slate-500 block">
                Last Roll: [{activeInspectDeity.lastRoll[0]}, {activeInspectDeity.lastRoll[1]}]
              </span>
              {activeInspectDeity.thriftBonus > 0 && (
                <span className="text-[10px] text-emerald-400 font-semibold block">
                  +{activeInspectDeity.thriftBonus} Thrift Bonus
                </span>
              )}
            </div>
          </div>

          {/* Ethos & Cosmic Origin Myth */}
          {activeInspectDeity.myth && (
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-[11px]">
                <Scroll className="w-3.5 h-3.5" /> Cosmic Origin & Lore
              </div>
              <p className="text-slate-300 text-xs leading-relaxed italic">
                "{activeInspectDeity.myth}"
              </p>
              {activeInspectDeity.ethos && (
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <strong className="text-slate-300">Divine Ethos:</strong> {activeInspectDeity.ethos}
                </div>
              )}
            </div>
          )}

          {/* Historical Goals */}
          {activeInspectDeity.historicalGoals && activeInspectDeity.historicalGoals.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-slate-400 font-semibold text-[11px] flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-indigo-400" /> Historical Divine Ambitions
              </span>
              <ul className="space-y-1">
                {activeInspectDeity.historicalGoals.map((goal, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-slate-300 text-[11px]">
                    <span className="text-amber-400">•</span> {goal}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Personality Matrix Sliders / Meters */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <span className="font-bold text-white text-xs block">
            Behavioral Traits & Personality Matrix
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Aggression vs Peace</span>
                <span className="font-bold text-red-400">
                  {Math.round((activeInspectDeity.personality.aggression || 0.5) * 100)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${(activeInspectDeity.personality.aggression || 0.5) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Harmony & Diplomacy</span>
                <span className="font-bold text-emerald-400">
                  {Math.round((activeInspectDeity.personality.harmony || 0.5) * 100)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(activeInspectDeity.personality.harmony || 0.5) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Territorial Expansion</span>
                <span className="font-bold text-amber-400">
                  {Math.round((activeInspectDeity.personality.expansion || 0.5) * 100)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(activeInspectDeity.personality.expansion || 0.5) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Curiosity & Arcana</span>
                <span className="font-bold text-cyan-400">
                  {Math.round((activeInspectDeity.personality.curiosity || 0.5) * 100)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full"
                  style={{ width: `${(activeInspectDeity.personality.curiosity || 0.5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Inter-Deity Relationships Matrix */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <span className="font-bold text-white text-xs block">
            Inter-Deity Relations & Diplomatic Standing
          </span>
          <div className="space-y-2">
            {deities
              .filter((d) => d.id !== activeInspectDeity.id)
              .map((otherDeity) => {
                const score = activeInspectDeity.relationships[otherDeity.id] || 0;
                let relLabel = 'Neutral';
                let badgeClass = 'bg-slate-800 text-slate-300 border-slate-700';

                if (score >= 40) {
                  relLabel = 'Staunch Ally';
                  badgeClass = 'bg-emerald-950 text-emerald-300 border-emerald-600/50';
                } else if (score > 10) {
                  relLabel = 'Friendly Accord';
                  badgeClass = 'bg-teal-950 text-teal-300 border-teal-600/50';
                } else if (score <= -40) {
                  relLabel = 'Mortal Feud';
                  badgeClass = 'bg-red-950 text-red-300 border-red-600/50';
                } else if (score < -10) {
                  relLabel = 'Wary & Distrustful';
                  badgeClass = 'bg-amber-950 text-amber-300 border-amber-600/50';
                }

                return (
                  <div
                    key={otherDeity.id}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs"
                        style={{ backgroundColor: `${otherDeity.color}30`, color: otherDeity.color }}
                      >
                        {otherDeity.symbol}
                      </span>
                      <span className="font-semibold text-white">{otherDeity.name}</span>
                      {otherDeity.isPlayer && (
                        <span className="text-[10px] text-indigo-400 font-medium">(You)</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeClass}`}>
                        {relLabel} ({score > 0 ? `+${score}` : score})
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Player Diplomatic Actions (When inspecting an NPC deity) */}
        {!isPlayer && (
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="font-bold text-white text-xs block">
              Divine Diplomatic Interventions with {activeInspectDeity.name}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onOfferPact(activeInspectDeity.id)}
                className="py-2 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-600/50 text-emerald-200 font-semibold flex items-center justify-center gap-2 transition text-xs"
              >
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
                Offer Celestial Concord (+20 Rel)
              </button>

              <button
                type="button"
                onClick={() => onProvokeRival(activeInspectDeity.id)}
                className="py-2 px-3 rounded-xl bg-red-950/50 hover:bg-red-900/80 border border-red-600/50 text-red-200 font-semibold flex items-center justify-center gap-2 transition text-xs"
              >
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Denounce & Challenge (-25 Rel)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
