/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AgeId, IntelligenceLevel, Race, SocietalBehavior, TerrainType } from '../types/game';
import { DAWN_OF_WORLDS_COSTS } from '../simulation/dawnOfWorldsRules';
import { GENETIC_TRAIT_OPTIONS, PRESET_RACES } from '../simulation/races';
import { X, Dna, Sparkles, Shield, Cpu, Users, HeartHandshake } from 'lucide-react';

interface RaceGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAge: AgeId;
  playerPower: number;
  existingRaces: Race[];
  onCreateRace: (race: Race, isSubrace: boolean) => void;
}

export const RaceGeneratorModal: React.FC<RaceGeneratorModalProps> = ({
  isOpen,
  onClose,
  currentAge,
  playerPower,
  existingRaces,
  onCreateRace,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'synthesizer'>('synthesizer');
  const [isSubrace, setIsSubrace] = useState(false);
  const [parentRaceId, setParentRaceId] = useState<string>(existingRaces[0]?.id || '');

  // Synthesizer State
  const [name, setName] = useState('Chitin-Kin');
  const [demonym, setDemonym] = useState('Vanguard');
  const [description, setDescription] = useState(
    'A resilient species encased in iridescent chitinous exoskeletons with hive-networked collective thought.'
  );
  const [carapace, setCarapace] = useState(GENETIC_TRAIT_OPTIONS.carapaceOrSkin[0].label);
  const [locomotion, setLocomotion] = useState(GENETIC_TRAIT_OPTIONS.locomotion[0].label);
  const [sensory, setSensory] = useState(GENETIC_TRAIT_OPTIONS.sensory[0].label);
  const [intelligence, setIntelligence] = useState<IntelligenceLevel>('arcane_network');
  const [societal, setSocietal] = useState<SocietalBehavior>('mercantile');
  const [favoredBiomes, setFavoredBiomes] = useState<TerrainType[]>(['forest', 'plains']);
  const [color, setColor] = useState('#10b981');
  const [baseAlignment, setBaseAlignment] = useState<number>(0);

  if (!isOpen) return null;

  const cost = isSubrace
    ? DAWN_OF_WORLDS_COSTS.create_subrace[currentAge]
    : DAWN_OF_WORLDS_COSTS.create_race[currentAge];

  const canAfford = playerPower >= cost;

  // Calculate dynamic stats
  let militaryBonus = 1;
  let fertilityMultiplier = 1.0;
  let techAffinity = 1.0;

  if (carapace.includes('Chitinous')) {
    militaryBonus += 2;
    fertilityMultiplier -= 0.15;
  } else if (carapace.includes('Photosynthetic')) {
    fertilityMultiplier += 0.35;
    militaryBonus -= 1;
  } else if (carapace.includes('Crystalline')) {
    techAffinity += 0.3;
  }

  if (locomotion.includes('Four-Armed')) militaryBonus += 1;
  if (locomotion.includes('Centauroid')) militaryBonus += 1;

  if (intelligence === 'instinctual') {
    militaryBonus += 1;
    techAffinity -= 0.2;
  } else if (intelligence === 'scholastic') {
    techAffinity += 0.3;
  } else if (intelligence === 'arcane_network') {
    techAffinity += 0.4;
  } else if (intelligence === 'transcendent') {
    techAffinity += 0.6;
    fertilityMultiplier -= 0.2;
  }

  if (societal === 'militaristic') militaryBonus += 2;
  if (societal === 'mercantile') fertilityMultiplier += 0.15;

  const handleCreateCustom = () => {
    if (!canAfford) return;

    const newRace: Race = {
      id: `race_custom_${Date.now()}`,
      name: name.trim() || 'Primordial Kind',
      demonym: demonym.trim() || 'The Awakened',
      creatorDeityId: 'deity_player',
      parentRaceId: isSubrace ? parentRaceId : null,
      description: description.trim(),
      traits: [
        carapace.split(' ')[0],
        locomotion.split(' ')[0],
        intelligence.replace('_', ' '),
      ],
      physiology: {
        carapaceOrSkin: carapace,
        locomotion,
        sensory,
        lifespanYears: intelligence === 'transcendent' ? 500 : 90,
        metabolism: carapace.includes('Photosynthetic') ? 'Photosynthetic' : 'Standard Organic',
      },
      intelligenceLevel: intelligence,
      societalBehavior: societal,
      favoredBiomes,
      baseAlignment,
      militaryBonus: Math.max(0, militaryBonus),
      fertilityMultiplier: Number(Math.max(0.4, fertilityMultiplier).toFixed(2)),
      techAffinity: Number(Math.max(0.5, techAffinity).toFixed(2)),
      color,
    };

    onCreateRace(newRace, isSubrace);
    onClose();
  };

  const handleSelectPreset = (preset: Race) => {
    if (!canAfford) return;
    const raceCopy: Race = {
      ...preset,
      id: `race_preset_${Date.now()}`,
      creatorDeityId: 'deity_player',
      parentRaceId: null,
    };
    onCreateRace(raceCopy, false);
    onClose();
  };

  const toggleBiome = (biome: TerrainType) => {
    if (favoredBiomes.includes(biome)) {
      if (favoredBiomes.length > 1) {
        setFavoredBiomes(favoredBiomes.filter((b) => b !== biome));
      }
    } else {
      setFavoredBiomes([...favoredBiomes, biome]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Dna className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-white tracking-wide">
                Genesis of Sentient Races
              </h2>
              <p className="text-xs text-slate-400">
                Dawn of Worlds Creation Ritual • Cost:{' '}
                <span className="font-bold text-amber-400">{cost} Power</span>{' '}
                (Your Reserve: {playerPower})
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

        {/* Tab Controls */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/50">
          <button
            onClick={() => setActiveTab('synthesizer')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'synthesizer'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Genetic Synthesizer (Custom Species)
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'presets'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Classic Fantasy Archetypes
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {activeTab === 'presets' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PRESET_RACES.map((preset) => (
                <div
                  key={preset.id}
                  className="p-4 rounded-xl border border-slate-700/80 bg-slate-800/40 hover:border-indigo-500/60 hover:bg-slate-800/80 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-white" style={{ color: preset.color }}>
                        {preset.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-700 text-slate-300">
                        {preset.societalBehavior}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mb-3 leading-relaxed">
                      {preset.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {preset.traits.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300 text-[10px]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    disabled={!canAfford}
                    onClick={() => handleSelectPreset(preset)}
                    className="w-full mt-2 py-2 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Awaken {preset.name} ({cost} Pts)
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Subrace Toggle */}
              {existingRaces.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white">Mutate as Subrace?</span>
                    <p className="text-slate-400 text-[11px]">
                      Splinter an existing mortal species into an adapted offshoot (Subrace costs less: {cost} Pts).
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSubrace}
                      onChange={(e) => setIsSubrace(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 accent-indigo-500 cursor-pointer"
                    />
                    {isSubrace && (
                      <select
                        value={parentRaceId}
                        onChange={(e) => setParentRaceId(e.target.value)}
                        className="px-2.5 py-1 rounded bg-slate-900 border border-slate-600 text-white"
                      >
                        {existingRaces.map((r) => (
                          <option key={r.id} value={r.id}>
                            Parent: {r.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              )}

              {/* Identity & Demonym */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Species Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-indigo-500 outline-none"
                    placeholder="e.g. Aether-Kind"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Demonym / Collective</label>
                  <input
                    type="text"
                    value={demonym}
                    onChange={(e) => setDemonym(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-indigo-500 outline-none"
                    placeholder="e.g. The Celestial Vanguard"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Species Myth & Lore</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-indigo-500 outline-none resize-none"
                />
              </div>

              {/* Physiological Traits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Integument / Carapace</label>
                  <select
                    value={carapace}
                    onChange={(e) => setCarapace(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-indigo-500 outline-none"
                  >
                    {GENETIC_TRAIT_OPTIONS.carapaceOrSkin.map((opt) => (
                      <option key={opt.label} value={opt.label}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Locomotion & Anatomy</label>
                  <select
                    value={locomotion}
                    onChange={(e) => setLocomotion(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-indigo-500 outline-none"
                  >
                    {GENETIC_TRAIT_OPTIONS.locomotion.map((opt) => (
                      <option key={opt.label} value={opt.label}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sensory & Vision</label>
                  <select
                    value={sensory}
                    onChange={(e) => setSensory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-indigo-500 outline-none"
                  >
                    {GENETIC_TRAIT_OPTIONS.sensory.map((opt) => (
                      <option key={opt.label} value={opt.label}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Intelligence & Society */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cognitive Matrix</label>
                  <select
                    value={intelligence}
                    onChange={(e) => setIntelligence(e.target.value as IntelligenceLevel)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-indigo-500 outline-none"
                  >
                    {GENETIC_TRAIT_OPTIONS.intelligence.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label} ({opt.bonus})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Societal Philosophy</label>
                  <select
                    value={societal}
                    onChange={(e) => setSocietal(e.target.value as SocietalBehavior)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-indigo-500 outline-none"
                  >
                    {GENETIC_TRAIT_OPTIONS.societal.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preferred Biomes & Heraldry */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Favored Habitats</label>
                  <div className="flex flex-wrap gap-2">
                    {GENETIC_TRAIT_OPTIONS.favoredBiomes.map((b) => {
                      const active = favoredBiomes.includes(b.type);
                      return (
                        <button
                          key={b.type}
                          type="button"
                          onClick={() => toggleBiome(b.type)}
                          className={`px-2.5 py-1 rounded text-[11px] transition border ${
                            active
                              ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          {b.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Civilization Banner Color & Alignment
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-9 h-9 rounded cursor-pointer border border-slate-700 bg-transparent"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setBaseAlignment(-1)}
                        className={`px-2.5 py-1 rounded text-xs border ${
                          baseAlignment === -1
                            ? 'bg-red-950 border-red-500 text-red-200'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        Ruthless (-1)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBaseAlignment(0)}
                        className={`px-2.5 py-1 rounded text-xs border ${
                          baseAlignment === 0
                            ? 'bg-slate-800 border-slate-400 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        Neutral (0)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBaseAlignment(1)}
                        className={`px-2.5 py-1 rounded text-xs border ${
                          baseAlignment === 1
                            ? 'bg-amber-950 border-amber-500 text-amber-200'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        Righteous (+1)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calculated Genetic Stat Modifiers Summary */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-900/40 grid grid-cols-3 gap-3 text-center">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-slate-400 text-[11px] mb-0.5">
                    <Shield className="w-3.5 h-3.5 text-red-400" /> Martial Prowess
                  </div>
                  <span className="text-base font-bold text-red-300">+{militaryBonus} Bonus</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-slate-400 text-[11px] mb-0.5">
                    <Users className="w-3.5 h-3.5 text-emerald-400" /> Fertility / Growth
                  </div>
                  <span className="text-base font-bold text-emerald-300">
                    {(fertilityMultiplier * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-slate-400 text-[11px] mb-0.5">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Arcane/Tech Affinity
                  </div>
                  <span className="text-base font-bold text-cyan-300">
                    {(techAffinity * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Final Synthesis Button */}
              <button
                disabled={!canAfford}
                onClick={handleCreateCustom}
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 text-sm"
              >
                <Dna className="w-4 h-4" /> Synthesize & Bestow Breath of Life ({cost} Divine Power)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
