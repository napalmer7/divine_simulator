/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Avatar, Civilization, Deity } from '../types/game';
import { Crown, HeartHandshake, ShieldAlert, Sparkles, X, User } from 'lucide-react';

interface PantheonDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  deities: Deity[];
  civilizations: Civilization[];
  avatars: Avatar[];
  playerDeity: Deity;
  onOfferPact: (targetDeityId: string) => void;
  onProvokeRival: (targetDeityId: string) => void;
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
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-slate-950/95 border-l border-slate-800 shadow-2xl backdrop-blur-md flex flex-col text-slate-100 animate-slide-left">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-serif text-purple-200 tracking-wide">
              The Divine Pantheon & Rivalries
            </h2>
            <p className="text-xs text-slate-400">
              Council of Immortals • Shifting Alliances & Divine Agendas
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

      {/* Deity Cards List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
        {deities.map((deity) => {
          const isPlayer = deity.isPlayer;
          const civ = civilizations.find((c) => c.creatorDeityId === deity.id);
          const avatar = avatars.find((a) => a.deityId === deity.id && a.isAlive);
          const relationshipWithPlayer = deity.relationships[playerDeity.id] || 0;

          let relBadge = 'Neutral';
          let relColor = 'text-slate-400';
          if (relationshipWithPlayer > 30) {
            relBadge = 'Staunch Ally';
            relColor = 'text-emerald-400';
          } else if (relationshipWithPlayer > 0) {
            relBadge = 'Friendly';
            relColor = 'text-teal-400';
          } else if (relationshipWithPlayer < -30) {
            relBadge = 'Mortal Rival';
            relColor = 'text-red-400';
          } else if (relationshipWithPlayer < 0) {
            relBadge = 'Distrustful';
            relColor = 'text-amber-400';
          }

          return (
            <div
              key={deity.id}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold border border-white/10 shadow"
                    style={{ backgroundColor: `${deity.color}25`, color: deity.color }}
                  >
                    {deity.symbol}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white font-serif">{deity.name}</h3>
                      {isPlayer && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30 flex items-center gap-1">
                          <User className="w-3 h-3" /> Player Deity
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs">{deity.title}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {deity.power} Power
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    (2d6: {deity.lastRoll[0] + deity.lastRoll[1]})
                  </span>
                </div>
              </div>

              {/* Domain & Personality Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-slate-500 block">Primary Domain</span>
                  <span className="text-slate-200 font-medium">{deity.domain}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Favored Civilization</span>
                  <span className="text-slate-200 font-medium">
                    {civ ? civ.name : 'Yet to be awakened'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Avatar Incarnation</span>
                  <span className="text-amber-300 font-medium">
                    {avatar ? avatar.name : 'None manifest'}
                  </span>
                </div>
                {!isPlayer && (
                  <div>
                    <span className="text-slate-500 block">Disposition Toward You</span>
                    <span className={`font-semibold ${relColor}`}>
                      {relBadge} ({relationshipWithPlayer > 0 ? `+${relationshipWithPlayer}` : relationshipWithPlayer})
                    </span>
                  </div>
                )}
              </div>

              {/* Diplomatic Interaction Buttons */}
              {!isPlayer && (
                <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
                  <button
                    onClick={() => onOfferPact(deity.id)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-600/40 text-emerald-300 font-medium flex items-center justify-center gap-1.5 transition text-[11px]"
                  >
                    <HeartHandshake className="w-3.5 h-3.5" /> Offer Celestial Concord (+20 Relation)
                  </button>
                  <button
                    onClick={() => onProvokeRival(deity.id)}
                    className="py-1.5 px-3 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-600/40 text-red-300 font-medium flex items-center justify-center gap-1.5 transition text-[11px]"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" /> Challenge
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
