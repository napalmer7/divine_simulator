/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BattleResult } from '../simulation/conflicts';
import { Swords, Shield, Dices, Award, X } from 'lucide-react';

interface BattleModalProps {
  isOpen: boolean;
  battleResult: BattleResult | null;
  onClose: () => void;
}

export const BattleModal: React.FC<BattleModalProps> = ({
  isOpen,
  battleResult,
  onClose,
}) => {
  const [diceRolling, setDiceRolling] = useState(false);

  if (!isOpen || !battleResult) return null;

  const { attacker, defender, winner, margin, narrative, targetCitySacked } = battleResult;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl flex flex-col rounded-2xl bg-slate-900 border border-red-500/40 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-red-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-white tracking-wide">
                Dawn of Worlds Conflict Resolution
              </h2>
              <p className="text-xs text-red-300">
                2d6 Dice Contest • Martial Advancements & Territorial High Ground
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

        {/* Clash View */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Attacker Card */}
            <div
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                winner === 'attacker'
                  ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/40'
                  : 'bg-slate-800/40 border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                    Attacking Host
                  </span>
                  {winner === 'attacker' && (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                      <Award className="w-3.5 h-3.5" /> Victorious
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-base text-white">{attacker.army.name}</h3>
                <p className="text-xs text-slate-400 mb-3">
                  {attacker.civilization.name} • {attacker.race.name}
                </p>

                {/* Modifiers breakdown */}
                <div className="space-y-1 text-xs text-slate-300 border-t border-slate-700/60 pt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Martial Tech Bonus:</span>
                    <span className="font-mono text-emerald-400">+{attacker.techBonus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Racial Prowess:</span>
                    <span className="font-mono text-emerald-400">+{attacker.racialBonus}</span>
                  </div>
                  {attacker.fatiguePenalty > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Consecutive Battle Fatigue:</span>
                      <span className="font-mono text-red-400">-{attacker.fatiguePenalty}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dice & Total */}
              <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dices className="w-5 h-5 text-red-400" />
                  <span className="font-mono text-sm text-slate-300">
                    [{attacker.diceRoll[0]} + {attacker.diceRoll[1]}] = {attacker.rollTotal}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Final Score</span>
                  <span className="text-xl font-bold font-mono text-white">
                    {attacker.finalScore}
                  </span>
                </div>
              </div>
            </div>

            {/* Defender Card */}
            <div
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                winner === 'defender'
                  ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/40'
                  : 'bg-slate-800/40 border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                    Defending Garrison
                  </span>
                  {winner === 'defender' && (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                      <Award className="w-3.5 h-3.5" /> Defended
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-base text-white">{defender.army.name}</h3>
                <p className="text-xs text-slate-400 mb-3">
                  {defender.civilization.name} • {defender.race.name}
                </p>

                {/* Modifiers breakdown */}
                <div className="space-y-1 text-xs text-slate-300 border-t border-slate-700/60 pt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Martial Tech Bonus:</span>
                    <span className="font-mono text-emerald-400">+{defender.techBonus}</span>
                  </div>
                  {defender.wallBonus > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fortress Ramparts:</span>
                      <span className="font-mono text-cyan-400">+{defender.wallBonus}</span>
                    </div>
                  )}
                  {defender.terrainBonus > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">High Ground Elevation:</span>
                      <span className="font-mono text-cyan-400">+{defender.terrainBonus}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Racial Prowess:</span>
                    <span className="font-mono text-emerald-400">+{defender.racialBonus}</span>
                  </div>
                </div>
              </div>

              {/* Dice & Total */}
              <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dices className="w-5 h-5 text-sky-400" />
                  <span className="font-mono text-sm text-slate-300">
                    [{defender.diceRoll[0]} + {defender.diceRoll[1]}] = {defender.rollTotal}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Final Score</span>
                  <span className="text-xl font-bold font-mono text-white">
                    {defender.finalScore}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Outcome Narrative */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs leading-relaxed space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-300 font-serif">
              <span>Outcome of Battle (Victory Margin: {margin})</span>
              {targetCitySacked && (
                <span className="px-2 py-0.5 rounded bg-red-900/60 text-red-200 text-[10px]">
                  City Sacked
                </span>
              )}
            </div>
            <p className="text-slate-300">{narrative}</p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white transition text-xs"
          >
            Acknowledge & Record in Chronicles
          </button>
        </div>
      </div>
    </div>
  );
};
