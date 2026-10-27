/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  AgeId,
  IntelligenceLevel,
  Race,
  RaceCategory,
  SocietalBehavior,
  TerrainType,
  WorldCell,
} from '../types/game';
import { DAWN_OF_WORLDS_COSTS } from '../simulation/dawnOfWorldsRules';
import {
  GENETIC_TRAIT_OPTIONS,
  PRESET_RACES,
  generateSpeciesName,
  generateMythAndLore,
} from '../simulation/races';
import {
  X,
  Dna,
  Sparkles,
  Shield,
  Cpu,
  Users,
  Compass,
  Dice5,
  Scroll,
  Skull,
  Crown,
  Bug,
  Flame,
  Check,
} from 'lucide-react';

interface RaceGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAge: AgeId;
  playerPower: number;
  existingRaces: Race[];
  targetCell?: WorldCell | null;
  onCreateRace: (race: Race, isSubrace: boolean) => void;
}

export const RaceGeneratorModal: React.FC<RaceGeneratorModalProps> = ({
  isOpen,
  onClose,
  currentAge,
  playerPower,
  existingRaces,
  targetCell,
  onCreateRace,
}) => {
  const [activeTab, setActiveTab] = useState<'synthesizer' | 'presets'>('synthesizer');
  const [category, setCategory] = useState<RaceCategory>('civilized');
  const [isSubrace, setIsSubrace] = useState(false);
  const [parentRaceId, setParentRaceId] = useState<string>(existingRaces[0]?.id || '');

  // Synthesizer State
  const [name, setName] = useState('Humans');
  const [demonym, setDemonym] = useState('Humanity');
  const [description, setDescription] = useState(
    'Highly adaptable, ambitious, and prolific mortals known for establishing vast kingdoms and rapid technological innovation.'
  );
  const [carapace, setCarapace] = useState(
    'Normal Humanoid Skin (Standard Epidermis)'
  );
  const [locomotion, setLocomotion] = useState('Normal Bipedal Gait');
  const [sensory, setSensory] = useState('Normal Trichromatic Vision');
  const [intelligence, setIntelligence] = useState<IntelligenceLevel>('scholastic');
  const [societal, setSocietal] = useState<SocietalBehavior>('feudal_monarchy');
  const [favoredBiomes, setFavoredBiomes] = useState<TerrainType[]>(['plains', 'hills']);
  const [color, setColor] = useState('#60a5fa');
  const [baseAlignment, setBaseAlignment] = useState<number>(0);

  // Sync parent race selection when toggling subrace
  const applyParentRaceDetails = useCallback(
    (parentId: string) => {
      const parent = existingRaces.find((r) => r.id === parentId);
      if (!parent) return;

      setCarapace(parent.physiology.carapaceOrSkin);
      setLocomotion(parent.physiology.locomotion);
      setSensory(parent.physiology.sensory);
      setIntelligence(parent.intelligenceLevel);
      setSocietal(parent.societalBehavior);
      setFavoredBiomes([...parent.favoredBiomes]);
      setBaseAlignment(parent.baseAlignment);
      setCategory(parent.category || 'civilized');

      // Adjust shade of color for subrace
      setColor(parent.color || '#38bdf8');

      // Generate species name with parent in parentheses: e.g. Sandborne (Human)
      const targetBiome = targetCell?.terrain || parent.favoredBiomes[0] || 'plains';
      const gen = generateSpeciesName({
        category: parent.category || 'civilized',
        isSubrace: true,
        parentRaceName: parent.name,
        biome: targetBiome,
      });

      setName(gen.name);
      setDemonym(gen.demonym);

      // Pre-fill myth reflecting mutation
      const myth = generateMythAndLore({
        raceName: gen.name,
        category: parent.category || 'civilized',
        isSubrace: true,
        parentRaceName: parent.name,
        targetCell,
        carapace: parent.physiology.carapaceOrSkin,
        societal: parent.societalBehavior,
      });
      setDescription(myth);
    },
    [existingRaces, targetCell]
  );

  // Handle Subrace Checkbox Toggle
  const handleToggleSubrace = (checked: boolean) => {
    setIsSubrace(checked);
    if (checked && existingRaces.length > 0) {
      const defaultParentId = parentRaceId || existingRaces[0].id;
      setParentRaceId(defaultParentId);
      applyParentRaceDetails(defaultParentId);
    } else {
      // Revert to standalone species name without parentheses
      const gen = generateSpeciesName({
        category,
        isSubrace: false,
        biome: targetCell?.terrain || 'plains',
      });
      setName(gen.name);
      setDemonym(gen.demonym);
    }
  };

  // Handle Parent Race Dropdown Change
  const handleChangeParent = (newParentId: string) => {
    setParentRaceId(newParentId);
    if (isSubrace) {
      applyParentRaceDetails(newParentId);
    }
  };

  // Roll New Name
  const handleRollName = () => {
    const parent = existingRaces.find((r) => r.id === parentRaceId);
    const gen = generateSpeciesName({
      category,
      isSubrace,
      parentRaceName: parent?.name || 'Mortal',
      biome: targetCell?.terrain || favoredBiomes[0] || 'plains',
    });
    setName(gen.name);
    setDemonym(gen.demonym);
  };

  // Generate Myth and Lore
  const handleGenerateMythAndLore = () => {
    // If targetCell is available, ensure its biome is in favoredBiomes
    if (targetCell?.terrain && !favoredBiomes.includes(targetCell.terrain)) {
      setFavoredBiomes((prev) => [...prev, targetCell.terrain]);
    }

    const parent = existingRaces.find((r) => r.id === parentRaceId);
    const myth = generateMythAndLore({
      raceName: name.trim() || 'The Awakened',
      category,
      isSubrace,
      parentRaceName: parent?.name || 'Ancestors',
      targetCell,
      carapace,
      locomotion,
      intelligence,
      societal,
    });
    setDescription(myth);
  };

  // Handle Category Change (Civilized vs Monstrous vs Aberration)
  const handleChangeCategory = (newCat: RaceCategory) => {
    setCategory(newCat);
    if (newCat === 'monstrous') {
      setBaseAlignment(-1);
      setColor('#ef4444');
      setCarapace('Thick Scaled Reptilian Plates');
      setSocietal('militaristic');
      setIntelligence('cunning');
    } else if (newCat === 'aberration') {
      setBaseAlignment(-1);
      setColor('#a855f7');
      setCarapace('Chitinous Exoskeleton / Carapace');
      setSocietal('hive_collective');
      setIntelligence('arcane_network');
    } else {
      setBaseAlignment(0);
      setColor('#60a5fa');
      setCarapace('Normal Humanoid Skin (Standard Epidermis)');
      setSocietal('feudal_monarchy');
      setIntelligence('scholastic');
    }

    if (!isSubrace) {
      const gen = generateSpeciesName({
        category: newCat,
        isSubrace: false,
        biome: targetCell?.terrain || 'plains',
      });
      setName(gen.name);
      setDemonym(gen.demonym);
    }
  };

  if (!isOpen) return null;

  const cost = isSubrace
    ? DAWN_OF_WORLDS_COSTS.create_subrace[currentAge]
    : DAWN_OF_WORLDS_COSTS.create_race[currentAge];

  const canAfford = playerPower >= cost;

  // Calculate dynamic stats
  let militaryBonus = 1;
  let fertilityMultiplier = 1.0;
  let techAffinity = 1.0;

  if (category === 'monstrous') militaryBonus += 1;
  if (category === 'aberration') {
    militaryBonus += 1;
    techAffinity += 0.2;
  }

  if (carapace.includes('Chitinous')) {
    militaryBonus += 2;
    fertilityMultiplier -= 0.15;
  } else if (carapace.includes('Photosynthetic')) {
    fertilityMultiplier += 0.35;
    militaryBonus -= 1;
  } else if (carapace.includes('Crystalline')) {
    techAffinity += 0.3;
  } else if (carapace.includes('Basalt')) {
    militaryBonus += 1;
  } else if (carapace.includes('Necrotic')) {
    fertilityMultiplier -= 0.3;
    militaryBonus += 1;
  }

  if (locomotion.includes('Four-Armed')) militaryBonus += 1;
  if (locomotion.includes('Centauroid')) militaryBonus += 1;
  if (locomotion.includes('Flight')) techAffinity += 0.1;

  if (intelligence === 'instinctual') {
    militaryBonus += 1;
    techAffinity -= 0.3;
  } else if (intelligence === 'cunning') {
    fertilityMultiplier += 0.2;
  } else if (intelligence === 'scholastic') {
    techAffinity += 0.3;
  } else if (intelligence === 'arcane_network') {
    techAffinity += 0.4;
    fertilityMultiplier += 0.1;
  } else if (intelligence === 'transcendent') {
    techAffinity += 0.6;
    fertilityMultiplier -= 0.2;
  } else if (intelligence === 'feral_madness') {
    militaryBonus += 2;
    techAffinity -= 0.4;
  }

  if (societal === 'militaristic' || societal === 'raider_plunderers') militaryBonus += 1.5;
  if (societal === 'mercantile') fertilityMultiplier += 0.15;
  if (societal === 'scholarly') techAffinity += 0.3;
  if (societal === 'hive_collective') fertilityMultiplier += 0.25;

  const handleCreateCustom = () => {
    if (!canAfford) return;

    let finalName = name.trim() || 'Primordial Kind';
    // Ensure subrace strictly adheres to parent in parentheses format
    if (isSubrace && parentRaceId) {
      const parent = existingRaces.find((r) => r.id === parentRaceId);
      if (parent) {
        const cleanParent = parent.name.replace(/\s*\(.*?\)\s*/g, '').trim();
        if (!finalName.includes(`(${cleanParent})`)) {
          finalName = `${finalName.replace(/\s*\(.*?\)\s*/g, '').trim()} (${cleanParent})`;
        }
      }
    }

    const newRace: Race = {
      id: `race_custom_${Date.now()}`,
      name: finalName,
      demonym: demonym.trim() || 'The Awakened',
      creatorDeityId: 'deity_player',
      parentRaceId: isSubrace ? parentRaceId : null,
      category,
      description: description.trim(),
      traits: [
        carapace.split(' ')[0],
        locomotion.split(' ')[0],
        intelligence.replace('_', ' '),
        category,
      ],
      physiology: {
        carapaceOrSkin: carapace,
        locomotion,
        sensory,
        lifespanYears: intelligence === 'transcendent' ? 500 : category === 'monstrous' ? 60 : 90,
        metabolism: carapace.includes('Photosynthetic')
          ? 'Photosynthetic'
          : carapace.includes('Necrotic')
          ? 'Necromantic Essence'
          : 'Standard Organic',
      },
      intelligenceLevel: intelligence,
      societalBehavior: societal,
      favoredBiomes,
      baseAlignment,
      militaryBonus: Math.max(0, Math.round(militaryBonus)),
      fertilityMultiplier: Number(Math.max(0.4, fertilityMultiplier).toFixed(2)),
      techAffinity: Number(Math.max(0.4, techAffinity).toFixed(2)),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Dna className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif text-white tracking-wide flex items-center gap-2">
                Genesis of Sentient Races
                {targetCell && (
                  <span className="text-[11px] font-normal font-sans px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                    Cradle: [{targetCell.lat.toFixed(0)}°, {targetCell.lon.toFixed(0)}°] • {targetCell.terrain.replace('_', ' ')}
                  </span>
                )}
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
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/60 justify-between items-center">
          <div className="flex">
            <button
              onClick={() => setActiveTab('synthesizer')}
              className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'synthesizer'
                  ? 'border-indigo-500 text-indigo-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Dna className="w-3.5 h-3.5" /> Genetic Synthesizer
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'presets'
                  ? 'border-indigo-500 text-indigo-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Fantasy & Monster Archetypes
            </button>
          </div>

          {activeTab === 'synthesizer' && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => handleChangeCategory('civilized')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition ${
                  category === 'civilized'
                    ? 'bg-blue-600/30 text-blue-200 border border-blue-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Crown className="w-3 h-3 text-blue-400" /> Mortal Civilized
              </button>
              <button
                onClick={() => handleChangeCategory('monstrous')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition ${
                  category === 'monstrous'
                    ? 'bg-red-600/30 text-red-200 border border-red-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Skull className="w-3 h-3 text-red-400" /> Monstrous / Savage
              </button>
              <button
                onClick={() => handleChangeCategory('aberration')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition ${
                  category === 'aberration'
                    ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bug className="w-3 h-3 text-purple-400" /> Abyssal / Horror
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {activeTab === 'presets' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-slate-400">
                <span>Select a classic species archetype to awaken on the world:</span>
                <span className="text-[11px] text-amber-400">Creation Cost: {cost} Power</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {PRESET_RACES.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-3.5 rounded-xl border border-slate-700/80 bg-slate-800/40 hover:border-indigo-500/60 hover:bg-slate-800/80 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white" style={{ color: preset.color }}>
                            {preset.name}
                          </span>
                          {preset.category === 'monstrous' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-950 text-red-300 border border-red-800/60 flex items-center gap-0.5">
                              <Skull className="w-2.5 h-2.5" /> Monster
                            </span>
                          )}
                          {preset.category === 'aberration' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-950 text-purple-300 border border-purple-800/60 flex items-center gap-0.5">
                              <Bug className="w-2.5 h-2.5" /> Aberration
                            </span>
                          )}
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-700 text-slate-300">
                          {preset.societalBehavior.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mb-2.5 leading-relaxed">
                        {preset.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
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
                      className="w-full mt-1 py-1.5 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition flex items-center justify-center gap-1.5 text-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Awaken {preset.name} ({cost} Pts)
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Subrace & Classification Bar */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSubrace}
                      onChange={(e) => handleToggleSubrace(e.target.checked)}
                      disabled={existingRaces.length === 0}
                      className="w-4 h-4 rounded text-indigo-600 accent-indigo-500 cursor-pointer"
                    />
                    <span className="font-semibold text-white">Mutate as Subrace</span>
                  </label>
                  {isSubrace && existingRaces.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[11px]">Primary Parent:</span>
                      <select
                        value={parentRaceId}
                        onChange={(e) => handleChangeParent(e.target.value)}
                        className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-white font-semibold text-xs"
                      >
                        {existingRaces.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({r.category || 'mortal'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-400">
                  {isSubrace ? (
                    <span className="text-emerald-400">
                      Subrace creation cost: <strong>{cost} Power</strong> (Parent traits pre-filled)
                    </span>
                  ) : (
                    <span>
                      Standard species creation cost: <strong>{cost} Power</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Species Name & Demonym with Roll Name Generator */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-semibold">
                      Species Name {isSubrace && <span className="text-amber-400 font-normal">(Parent auto-formatted)</span>}
                    </label>
                    <button
                      type="button"
                      onClick={handleRollName}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      title="Roll an evocative fantasy or monstrous species name"
                    >
                      <Dice5 className="w-3.5 h-3.5" /> Roll Name
                    </button>
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-indigo-500 outline-none font-medium"
                    placeholder={isSubrace ? 'e.g. Sandborne (Human)' : 'e.g. Aethel-Kind'}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-semibold">Demonym / Collective</label>
                  </div>
                  <input
                    type="text"
                    value={demonym}
                    onChange={(e) => setDemonym(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-indigo-500 outline-none"
                    placeholder="e.g. The Celestial Vanguard"
                  />
                </div>
              </div>

              {/* Myth & Lore with Location-Based Generator Button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Scroll className="w-3.5 h-3.5 text-amber-400" /> Species Myth & Lore
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateMythAndLore}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-[11px] font-semibold flex items-center gap-1.5 transition"
                    title="Generate high-fantasy lore anchored in selected world location and traits"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Synthesize Myth & Lore from Location
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-indigo-500 outline-none resize-none leading-relaxed text-xs"
                  placeholder="The mythological awakening and cultural ethos of this species..."
                />
              </div>

              {/* Physiological Traits with Standard & Exotic Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Integument / Skin</label>
                  <select
                    value={carapace}
                    onChange={(e) => setCarapace(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-indigo-500 outline-none text-xs"
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
                    className="w-full px-2.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-indigo-500 outline-none text-xs"
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
                    className="w-full px-2.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-indigo-500 outline-none text-xs"
                  >
                    {GENETIC_TRAIT_OPTIONS.sensory.map((opt) => (
                      <option key={opt.label} value={opt.label}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cognitive Matrix & Expanded Societal Philosophy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cognitive Matrix / Thoughts</label>
                  <select
                    value={intelligence}
                    onChange={(e) => setIntelligence(e.target.value as IntelligenceLevel)}
                    className="w-full px-2.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-indigo-500 outline-none text-xs"
                  >
                    {GENETIC_TRAIT_OPTIONS.intelligence.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Societal Philosophy</label>
                  <select
                    value={societal}
                    onChange={(e) => setSocietal(e.target.value as SocietalBehavior)}
                    className="w-full px-2.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-indigo-500 outline-none text-xs"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Favored Habitats</label>
                  <div className="flex flex-wrap gap-1.5">
                    {GENETIC_TRAIT_OPTIONS.favoredBiomes.map((b) => {
                      const active = favoredBiomes.includes(b.type);
                      return (
                        <button
                          key={b.type}
                          type="button"
                          onClick={() => toggleBiome(b.type)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] transition border flex items-center gap-1 ${
                            active
                              ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          {active && <Check className="w-3 h-3 text-emerald-400" />}
                          {b.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Civilization Banner & Alignment
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-9 h-9 rounded-lg cursor-pointer border border-slate-700 bg-transparent"
                    />
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setBaseAlignment(-1)}
                        className={`px-2.5 py-1 rounded-lg text-xs border ${
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
                        className={`px-2.5 py-1 rounded-lg text-xs border ${
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
                        className={`px-2.5 py-1 rounded-lg text-xs border ${
                          baseAlignment === 1
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        Exalted (+1)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat Modifiers Display */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-red-500/20 text-red-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Military Bonus</div>
                    <div className="text-sm font-bold text-white">+{militaryBonus} Combat Dice</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-blue-500/20 text-blue-400">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Tech Affinity</div>
                    <div className="text-sm font-bold text-white">{techAffinity.toFixed(2)}x Innovation</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-emerald-500/20 text-emerald-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Fertility Multiplier</div>
                    <div className="text-sm font-bold text-white">{fertilityMultiplier.toFixed(2)}x Growth</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {activeTab === 'synthesizer' && (
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/80">
            <div className="text-xs text-slate-400">
              Required Power:{' '}
              <span className={`font-bold ${canAfford ? 'text-amber-400' : 'text-red-400'}`}>
                {cost}
              </span>{' '}
              / {playerPower} Points
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canAfford}
                onClick={handleCreateCustom}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition"
              >
                <Sparkles className="w-4 h-4" />
                {isSubrace ? `Mutate Subrace (${cost} Pts)` : `Awaken Species (${cost} Pts)`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
