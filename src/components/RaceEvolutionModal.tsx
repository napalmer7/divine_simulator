/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AgeId,
  Race,
  TerrainType,
  WorldCell,
  Civilization,
} from '../types/game';
import { Dna, Sparkles, X, Check, Compass, Shield, Trees, Flame, Snowflake, Waves, Mountain } from 'lucide-react';

interface RaceEvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  races: Race[];
  civilizations: Civilization[];
  cells: WorldCell[];
  selectedCellIndex: number | null;
  playerPower: number;
  currentAge: AgeId;
  onEvolveRace: (newRace: Race, targetCellIndices: number[]) => void;
}

interface AdaptationPreset {
  id: string;
  name: string;
  subraceSuffix: string;
  description: string;
  icon: any;
  favoredBiomes: TerrainType[];
  traits: string[];
  skinTrait: string;
  color: string;
  militaryDelta: number;
  fertilityDelta: number;
}

const ADAPTATION_PRESETS: AdaptationPreset[] = [
  {
    id: 'forest',
    name: 'Verdant Wood Adaptation',
    subraceSuffix: 'Wood Kin',
    description: 'Generations under dense ancient canopies bestow tree-whispering empathy, unmatched camouflage, and herbal archery.',
    icon: Trees,
    favoredBiomes: ['forest', 'swamp'],
    traits: ['Canopy Camouflage', 'Elder Tree Communion', 'Forest Stride'],
    skinTrait: 'Barked / Silken Chlorophyll Epidermis',
    color: '#10b981',
    militaryDelta: 1,
    fertilityDelta: 0.2,
  },
  {
    id: 'desert',
    name: 'Desert Nomad Adaptation',
    subraceSuffix: 'Dune Nomads',
    description: 'Hardened by scorching sun and arid winds, developing moisture retention, sand navigation, and caravan resilience.',
    icon: Compass,
    favoredBiomes: ['desert', 'plains'],
    traits: ['Water-Wise', 'Sand Strider', 'Mirage Instincts'],
    skinTrait: 'Sun-Hardened Leathery Hide',
    color: '#f59e0b',
    militaryDelta: 1,
    fertilityDelta: 0.1,
  },
  {
    id: 'volcanic',
    name: 'Magma & Ash Adaptation',
    subraceSuffix: 'Magma Forged',
    description: 'Imbued with subterranean thermal fury, impervious to molten basalt, tempering obsidian arms and fiery spirits.',
    icon: Flame,
    favoredBiomes: ['volcanic', 'mountains'],
    traits: ['Fire Immunity', 'Obsidian Bones', 'Smelting Vitality'],
    skinTrait: 'Basalt / Obsidian Plated Carapace',
    color: '#ef4444',
    militaryDelta: 2,
    fertilityDelta: -0.1,
  },
  {
    id: 'frost',
    name: 'Glacial Permafrost Adaptation',
    subraceSuffix: 'Frostborn',
    description: 'Adapting to howling blizzards and tundra wastes with thick insulating pelts, cold endurance, and ice stalking.',
    icon: Snowflake,
    favoredBiomes: ['tundra', 'mountains'],
    traits: ['Frost Resistance', 'Snowblind Sight', 'Relentless March'],
    skinTrait: 'Dense Fur & Subcutaneous Fat',
    color: '#06b6d4',
    militaryDelta: 1,
    fertilityDelta: 0.1,
  },
  {
    id: 'mountain',
    name: 'Deep Delver Subterranean Adaptation',
    subraceSuffix: 'Deep Delvers',
    description: 'Descending into abyssal subterranean caverns, mastering tremorsense, bioluminescence, and stone singing.',
    icon: Mountain,
    favoredBiomes: ['mountains', 'hills'],
    traits: ['Tremorsense Darkvision', 'Stonebound', 'Deep Mining'],
    skinTrait: 'Weathered Leathery Hide',
    color: '#d97706',
    militaryDelta: 1,
    fertilityDelta: 0.0,
  },
  {
    id: 'marine',
    name: 'Aquatic / Tidal Adaptation',
    subraceSuffix: 'Tidecallers',
    description: 'Communing with coastal shallows and turquoise coral waters, gaining webbed digits and amphibious grace.',
    icon: Waves,
    favoredBiomes: ['shallow_water', 'plains'],
    traits: ['Amphibious Breathing', 'Current Swimming', 'Pearl Dowsing'],
    skinTrait: 'Slime-Coated Amphibious Skin',
    color: '#38bdf8',
    militaryDelta: 0,
    fertilityDelta: 0.3,
  },
];

export const RaceEvolutionModal: React.FC<RaceEvolutionModalProps> = ({
  isOpen,
  onClose,
  races,
  civilizations,
  cells,
  selectedCellIndex,
  playerPower,
  currentAge,
  onEvolveRace,
}) => {
  if (!isOpen) return null;

  const evolutionCost = 6;
  const canAfford = playerPower >= evolutionCost;

  const [selectedParentRaceId, setSelectedParentRaceId] = useState<string>(
    races.length > 0 ? races[0].id : ''
  );
  const [selectedPresetId, setSelectedPresetId] = useState<string>('forest');

  const parentRace = races.find((r) => r.id === selectedParentRaceId) || races[0];
  const preset = ADAPTATION_PRESETS.find((p) => p.id === selectedPresetId) || ADAPTATION_PRESETS[0];

  const defaultEvolvedName = `${parentRace?.name.replace(/High |Mountain |Steppe |Meadow |Deep |Cavern /g, '')} ${preset.subraceSuffix}`;
  const [customName, setCustomName] = useState(defaultEvolvedName);
  const [customDemonym, setCustomDemonym] = useState(`The ${defaultEvolvedName}`);

  // Determine affected cells: cells owned by parent civ or in the selected region matching the favored biomes
  const targetCiv = civilizations.find((c) => c.raceId === parentRace?.id);
  const candidateCells = cells.filter(
    (c) =>
      c.elevation > 0 &&
      ((targetCiv && c.civilizationId === targetCiv.id) ||
        (selectedCellIndex !== null && Math.abs(c.index - selectedCellIndex) <= 4))
  );

  const matchedBiomesCells = candidateCells.filter((c) =>
    preset.favoredBiomes.includes(c.terrain)
  );

  const affectedCells = matchedBiomesCells.length > 0 ? matchedBiomesCells : candidateCells.slice(0, 3);

  const handleApplyEvolution = () => {
    if (!parentRace || !canAfford) return;

    const evolvedRace: Race = {
      id: `race_evolved_${Date.now()}`,
      name: customName || defaultEvolvedName,
      demonym: customDemonym || `The ${customName || defaultEvolvedName}`,
      creatorDeityId: parentRace.creatorDeityId,
      parentRaceId: parentRace.id,
      category: parentRace.category,
      description: `An evolved lineage of ${parentRace.name}. ${preset.description}`,
      traits: Array.from(new Set([...parentRace.traits.slice(0, 2), ...preset.traits])),
      physiology: {
        ...parentRace.physiology,
        carapaceOrSkin: preset.skinTrait,
      },
      intelligenceLevel: parentRace.intelligenceLevel,
      societalBehavior: parentRace.societalBehavior,
      favoredBiomes: Array.from(new Set([...parentRace.favoredBiomes, ...preset.favoredBiomes])),
      baseAlignment: parentRace.baseAlignment,
      militaryBonus: parentRace.militaryBonus + preset.militaryDelta,
      fertilityMultiplier: Math.max(0.4, parentRace.fertilityMultiplier + preset.fertilityDelta),
      procreationRate: Math.max(0.4, (parentRace.procreationRate || 1.0) + preset.fertilityDelta),
      expansionInclination: parentRace.expansionInclination || 0.5,
      settlementTendency: parentRace.settlementTendency || 0.5,
      naturalWonderAffinity: parentRace.naturalWonderAffinity,
      subraceType: preset.name,
      techAffinity: parentRace.techAffinity + 0.1,
      color: preset.color,
    };

    onEvolveRace(evolvedRace, affectedCells.map((c) => c.index));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-purple-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border-b border-purple-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
              <Dna className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-white tracking-wide flex items-center gap-2">
                Divine Evolution & Subrace Divergence
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                  {evolutionCost} Power
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Guide a mortal populace to diverge and adapt into an evolved subrace across new territories.
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
          {/* Step 1: Select Ancestral / Parent Race */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-2 font-serif">
              1. Select Ancestral Mortal Race
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {races.map((r) => {
                const isSelected = r.id === selectedParentRaceId;
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedParentRaceId(r.id);
                      const newDef = `${r.name.replace(/High |Mountain |Steppe |Meadow |Deep |Cavern /g, '')} ${preset.subraceSuffix}`;
                      setCustomName(newDef);
                      setCustomDemonym(`The ${newDef}`);
                    }}
                    className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-950/50 text-white shadow-lg shadow-purple-950/50 ring-1 ring-purple-400'
                        : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                      <span className="font-bold text-xs">{r.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate">{r.demonym}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Choose Environmental Adaptation Archetype */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-2 font-serif">
              2. Choose Environmental Adaptation Biome
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ADAPTATION_PRESETS.map((p) => {
                const isSelected = p.id === selectedPresetId;
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPresetId(p.id);
                      const newDef = `${parentRace?.name.replace(/High |Mountain |Steppe |Meadow |Deep |Cavern /g, '')} ${p.subraceSuffix}`;
                      setCustomName(newDef);
                      setCustomDemonym(`The ${newDef}`);
                    }}
                    className={`p-3 rounded-xl border text-left transition flex gap-3 ${
                      isSelected
                        ? 'border-purple-400 bg-purple-900/30 text-white ring-1 ring-purple-400 shadow-md'
                        : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div
                      className="p-2 rounded-lg flex items-center justify-center h-fit"
                      style={{ backgroundColor: `${p.color}25`, color: p.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs" style={{ color: p.color }}>
                          {p.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          +{p.militaryDelta ? `${p.militaryDelta} War ` : ''}
                          {p.fertilityDelta > 0 ? `+${(p.fertilityDelta * 100).toFixed(0)}% Pop` : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Name & Demonym Customization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Evolved Race Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-purple-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Demonym / Title
              </label>
              <input
                type="text"
                value={customDemonym}
                onChange={(e) => setCustomDemonym(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-purple-500 text-xs"
              />
            </div>
          </div>

          {/* Impact Preview */}
          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-bold text-purple-200">Evolution Forecast: </span>
              Converts <span className="text-white font-bold">{affectedCells.length} matching territory zones</span> and their population from{' '}
              <span className="text-amber-300 font-bold">{parentRace?.name}</span> into the newly evolved{' '}
              <span className="text-purple-300 font-bold">{customName}</span>, gaining favored biomes (
              {preset.favoredBiomes.join(', ')}) and distinct ancestral culture.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs font-mono">
            <span className="text-slate-400">Your Power: </span>
            <span className={canAfford ? 'text-amber-300 font-bold' : 'text-red-400 font-bold'}>
              {playerPower} Pts
            </span>
            <span className="text-slate-500"> (Requires {evolutionCost})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyEvolution}
              disabled={!canAfford}
              className={`px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-lg ${
                canAfford
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/50'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Consecrate Evolution ({evolutionCost} Power)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
