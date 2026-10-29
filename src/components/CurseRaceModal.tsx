/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AgeId,
  Race,
  Civilization,
  City,
  WorldCell,
  Deity,
} from '../types/game';
import { DAWN_OF_WORLDS_COSTS } from '../simulation/dawnOfWorldsRules';
import {
  Skull,
  Ghost,
  Sparkles,
  X,
  Check,
  Flame,
  Moon,
  AlertTriangle,
  Crown,
  Castle,
  Dna,
  Dice5,
  Eye,
} from 'lucide-react';

interface CurseRaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  races: Race[];
  civilizations: Civilization[];
  cities: City[];
  cells: WorldCell[];
  selectedCellIndex: number | null;
  playerPower: number;
  currentAge: AgeId;
  playerDeity: Deity;
  onCurseRace: (params: {
    parentRace: Race;
    curasedRace: Race;
    corruptionScope: 'splinter_realm' | 'total_corruption';
    targetCityId?: string;
    targetCellIndex?: number;
    cost: number;
  }) => void;
}

interface EvilCorruptionTemplate {
  id: string;
  matchedKeywords: string[];
  name: string;
  demonym: string;
  subraceSuffix: string;
  description: string;
  traits: string[];
  skinTrait: string;
  color: string;
  alignment: number;
  societalBehavior: any;
  physiology: any;
  intelligenceLevel: any;
  militaryDelta: number;
  procreationRate: number;
}

const EVIL_TEMPLATES: EvilCorruptionTemplate[] = [
  {
    id: 'dark_elves',
    matchedKeywords: ['elf', 'elves', 'elven'],
    name: 'Dark Elves (Drow)',
    demonym: 'Drow',
    subraceSuffix: 'Dark Elves',
    description:
      'Banished into abyssal subterranean vaults and venomous cavernous cities. Worshipping dark spider-goddesses, they command deadly shadow magic, poison needles, and cutthroat court intrigues.',
    traits: ['Sunlight Sensitivity', 'Abyssal Darkvision', 'Venom Crafters', 'Spider-Silk Weaving', 'Ruthless Treachery'],
    skinTrait: 'Obsidian Black / Ash-Grey Epidermis & Alabaster Hair',
    color: '#8b5cf6',
    alignment: -2,
    societalBehavior: 'theocracy',
    physiology: 'humanoid',
    intelligenceLevel: 'cunning',
    militaryDelta: 2,
    procreationRate: 0.9,
  },
  {
    id: 'deep_dwarves',
    matchedKeywords: ['dwarf', 'dwarves', 'dwarven'],
    name: 'Deep Dwarves (Duergar)',
    demonym: 'Duergar',
    subraceSuffix: 'Deep Dwarves',
    description:
      'Corrupted by relentless subterranean despair and dark psionic entities in the deepest tectonic mantles. They forge cursed black-iron weaponry and enforce grim slave labor in soot-choked magma pits.',
    traits: ['Grim Indomitable Will', 'Psionic Invisibility', 'Brimstone Metallurgy', 'Subterranean Slavers', 'Hatred of Surface Stone'],
    skinTrait: 'Slate-Grey Calloused Granite Hide',
    color: '#64748b',
    alignment: -2,
    societalBehavior: 'feudal_monarchy',
    physiology: 'humanoid',
    intelligenceLevel: 'cunning',
    militaryDelta: 2,
    procreationRate: 0.8,
  },
  {
    id: 'undead',
    matchedKeywords: ['human', 'mankind', 'humanity'],
    name: 'Restless Undead (Necrotic Host)',
    demonym: 'Deathless',
    subraceSuffix: 'The Undying',
    description:
      'Transmuted by forbidden necromancy and cosmic rot. Impervious to starvation, cold, or mortal pain, they march under immortal vampire aristocrats and skeletal necromancer kings.',
    traits: ['Deathless Fortitude', 'Immunity to Pestilence & Cold', 'Soul Harvesting', 'Terror Visage', 'Hunger for Living Flesh'],
    skinTrait: 'Desiccated Pale Rot / Skeletal Pallor',
    color: '#a855f7',
    alignment: -3,
    societalBehavior: 'necrocracy',
    physiology: 'undead',
    intelligenceLevel: 'feral_madness',
    militaryDelta: 3,
    procreationRate: 1.6,
  },
  {
    id: 'fell_orcs',
    matchedKeywords: ['orc', 'orcs', 'orcish', 'goblin'],
    name: 'Fell Blood-Orcs',
    demonym: 'Fellblood',
    subraceSuffix: 'Blood Orcs',
    description:
      'Infused with boiling demonic magma and infernal ichor. Sprouting spiked obsidian bone ridges across their backs, they enter unstoppable berserk rages that tear siege gates asunder.',
    traits: ['Demonic Bloodrage', 'Infernal Heat Tolerance', 'Spiked Bone Armor', 'Cannibalistic Feasting'],
    skinTrait: 'Charred Crimson & Obsidian Spiked Carapace',
    color: '#b91c1c',
    alignment: -2,
    societalBehavior: 'raider_plunderers',
    physiology: 'monstrous',
    intelligenceLevel: 'cunning',
    militaryDelta: 3,
    procreationRate: 1.3,
  },
  {
    id: 'void_touched',
    matchedKeywords: [],
    name: 'Abyssal Void-Touched',
    demonym: 'Voidborn',
    subraceSuffix: 'Voidborn',
    description:
      'Minds shattered and bodies warped by primordial cosmic rifts. Tendrils of living shadow ripple from their limbs, whispering madness to nearby mortal minds.',
    traits: ['Cosmic Madness Aura', 'Shadow Phasing', 'Void Sorcery', 'Eldritch Whispers'],
    skinTrait: 'Translucent Ethereal Void & Chitinous Shadow',
    color: '#3b0764',
    alignment: -3,
    societalBehavior: 'hive_collective',
    physiology: 'monstrous',
    intelligenceLevel: 'arcane_network',
    militaryDelta: 2,
    procreationRate: 1.0,
  },
];

export const CurseRaceModal: React.FC<CurseRaceModalProps> = ({
  isOpen,
  onClose,
  races,
  civilizations,
  cities,
  cells,
  selectedCellIndex,
  playerPower,
  currentAge,
  playerDeity,
  onCurseRace,
}) => {
  if (!isOpen) return null;

  // Dawn of worlds curse race costs 4 power in Age 2 (same as subrace/corrupt)
  const cost = DAWN_OF_WORLDS_COSTS.create_subrace[currentAge] || 4;
  const canAfford = playerPower >= cost;

  // State
  const [selectedParentRaceId, setSelectedParentRaceId] = useState<string>(() =>
    races.length > 0 ? races[0].id : ''
  );
  const selectedParentRace = races.find((r) => r.id === selectedParentRaceId) || races[0];

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('auto');
  const [customName, setCustomName] = useState<string>('');
  const [customDemonym, setCustomDemonym] = useState<string>('');
  const [customTraits, setCustomTraits] = useState<string[]>([]);
  const [customDesc, setCustomDesc] = useState<string>('');
  const [customSkin, setCustomSkin] = useState<string>('');
  const [alignment, setAlignment] = useState<number>(-2);
  const [color, setColor] = useState<string>('#8b5cf6');
  const [corruptionScope, setCorruptionScope] = useState<'splinter_realm' | 'total_corruption'>('splinter_realm');
  const [targetCityId, setTargetCityId] = useState<string>('');

  // Find best matching template for the parent race
  const getRecommendedTemplate = (race: Race | undefined): EvilCorruptionTemplate => {
    if (!race) return EVIL_TEMPLATES[0];
    const lowerName = race.name.toLowerCase();
    for (const t of EVIL_TEMPLATES) {
      if (t.matchedKeywords.some((kw) => lowerName.includes(kw))) {
        return t;
      }
    }
    return EVIL_TEMPLATES[EVIL_TEMPLATES.length - 1]; // Void touched fallback
  };

  // Sync defaults when parent race or template changes
  useEffect(() => {
    if (!selectedParentRace) return;
    const template =
      selectedTemplateId === 'auto'
        ? getRecommendedTemplate(selectedParentRace)
        : EVIL_TEMPLATES.find((t) => t.id === selectedTemplateId) || EVIL_TEMPLATES[0];

    setCustomName(template.name.replace(/Elves|Dwarves|Humans/, selectedParentRace.name));
    setCustomDemonym(template.demonym);
    setCustomDesc(template.description);
    setCustomTraits(template.traits);
    setCustomSkin(template.skinTrait);
    setColor(template.color);
    setAlignment(template.alignment);

    // Pick first city belonging to this race if available
    const raceCities = cities.filter((c) => c.raceId === selectedParentRace.id);
    if (raceCities.length > 0) {
      setTargetCityId(raceCities[0].id);
    }
  }, [selectedParentRaceId, selectedTemplateId]);

  const handleExecuteCurse = () => {
    if (!canAfford || !selectedParentRace) return;

    const template =
      selectedTemplateId === 'auto'
        ? getRecommendedTemplate(selectedParentRace)
        : EVIL_TEMPLATES.find((t) => t.id === selectedTemplateId) || EVIL_TEMPLATES[0];

    const cursedRaceId = `race_cursed_${Date.now()}`;
    const finalCursedRace: Race = {
      ...selectedParentRace,
      id: cursedRaceId,
      name: customName.trim() || `Corrupted ${selectedParentRace.name}`,
      demonym: customDemonym.trim() || `Cursed ${selectedParentRace.demonym}`,
      creatorDeityId: playerDeity.id,
      parentRaceId: selectedParentRace.id,
      description: customDesc.trim() || template.description,
      traits: customTraits.length > 0 ? customTraits : template.traits,
      physiology: {
        ...selectedParentRace.physiology,
        carapaceOrSkin: customSkin.trim() || template.skinTrait,
      },
      intelligenceLevel: template.intelligenceLevel,
      societalBehavior: template.societalBehavior,
      baseAlignment: alignment,
      militaryBonus: selectedParentRace.militaryBonus + template.militaryDelta,
      procreationRate: template.procreationRate,
      color,
      subraceType: `Curse of ${template.subraceSuffix}`,
    };

    onCurseRace({
      parentRace: selectedParentRace,
      curasedRace: finalCursedRace,
      corruptionScope,
      targetCityId: targetCityId || undefined,
      targetCellIndex: selectedCellIndex !== null ? selectedCellIndex : undefined,
      cost,
    });

    onClose();
  };

  const parentRaceCities = cities.filter((c) => c.raceId === selectedParentRace?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-950 border border-purple-900/60 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-950/80 bg-gradient-to-r from-purple-950/90 via-slate-950 to-red-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/40 animate-pulse">
              <Skull className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-serif text-white tracking-wide">
                  Curse & Corrupt Mortal Race
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-500/40">
                  Evil Evolution
                </span>
              </div>
              <p className="text-xs text-purple-300/80">
                Afflict a living lineage with dark malice, birthing sinister branches (Elves → Dark Elves, Dwarves → Deep Dwarves, Humans → Undead)
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Step 1: Select Target Race to Curse */}
          <div className="space-y-2">
            <label className="text-xs font-bold font-serif text-purple-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-purple-400" /> 1. Select Lineage to Curse
            </label>
            {races.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-center">
                No mortal races have been synthesized yet in this world. Awaken a race first!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {races.map((race) => {
                  const isSelected = selectedParentRaceId === race.id;
                  const raceCitiesCount = cities.filter((c) => c.raceId === race.id).length;
                  return (
                    <button
                      key={race.id}
                      type="button"
                      onClick={() => setSelectedParentRaceId(race.id)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-purple-950/60 border-purple-500 shadow-md shadow-purple-900/30'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: race.color }}
                          />
                          <span className="font-bold text-white text-xs truncate">{race.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight">
                          {raceCitiesCount} settlement{raceCitiesCount === 1 ? '' : 's'} · Align:{' '}
                          {race.baseAlignment > 0 ? `+${race.baseAlignment}` : race.baseAlignment}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="mt-2 text-[10px] font-bold text-purple-300 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Selected Target
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 2: Choose Corruption Archetype Template */}
          <div className="space-y-2">
            <label className="text-xs font-bold font-serif text-purple-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-red-400" /> 2. Choose Evil Corruption Archetype
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedTemplateId('auto')}
                className={`p-3 rounded-xl border text-left transition ${
                  selectedTemplateId === 'auto'
                    ? 'bg-purple-950/70 border-purple-500 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-purple-300 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Thematic Canonical Curse
                </div>
                <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Auto-adapts to target race (e.g. Elves → Drow, Dwarves → Duergar, Humans → Undead).
                </div>
              </button>

              {EVIL_TEMPLATES.map((tmpl) => {
                const isSelected = selectedTemplateId === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(tmpl.id)}
                    className={`p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-purple-950/70 border-purple-500 shadow-md'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-white text-xs">{tmpl.name}</div>
                    <div className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-snug">
                      {tmpl.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Customization of the Corrupted Identity */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-xs font-serif text-amber-300 flex items-center gap-1.5">
                <Dna className="w-3.5 h-3.5 text-amber-400" /> 3. Customize Sinister Evolution Details
              </span>
              <span className="text-[10px] text-purple-400 font-mono">
                Alignment: {alignment} (Evil / Malevolent)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-300 font-semibold mb-1 block">
                  Corrupted Race Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Dark Elves, Deep Dwarves"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-purple-900/60 text-white text-xs outline-none focus:border-purple-500 font-serif"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-semibold mb-1 block">
                  Demonym
                </label>
                <input
                  type="text"
                  value={customDemonym}
                  onChange={(e) => setCustomDemonym(e.target.value)}
                  placeholder="e.g. Drow, Duergar, Deathless"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-purple-900/60 text-white text-xs outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-semibold mb-1 block">
                Corrupted Physiology & Visage
              </label>
              <input
                type="text"
                value={customSkin}
                onChange={(e) => setCustomSkin(e.target.value)}
                placeholder="e.g. Obsidian Epidermis, Skeletal Pallor, Ash-Hardened Hide"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-purple-900/60 text-purple-200 text-xs outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-semibold mb-1 block">
                Dark Mythos & Divine Curse Origin
              </label>
              <textarea
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                rows={2}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-purple-900/60 text-slate-300 text-xs outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-semibold mb-1.5 block">
                Sinister Traits & Powers
              </label>
              <div className="flex flex-wrap gap-1.5">
                {customTraits.map((trait, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-purple-950/80 text-purple-300 border border-purple-800/60 text-[10px] font-semibold flex items-center gap-1"
                  >
                    <Skull className="w-2.5 h-2.5 text-purple-400" /> {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Step 4: Corruption Scope */}
          <div className="space-y-2">
            <label className="text-xs font-bold font-serif text-purple-300 flex items-center gap-1.5">
              <Castle className="w-3.5 h-3.5 text-purple-400" /> 4. Manifestation & Territory Scope
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCorruptionScope('splinter_realm')}
                className={`p-3 rounded-xl border text-left transition ${
                  corruptionScope === 'splinter_realm'
                    ? 'bg-purple-950/70 border-purple-500 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Ghost className="w-3.5 h-3.5 text-purple-400" />
                  Corrupted Splinter Faction (Deep Lair)
                </div>
                <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Branches an evil heresy realm starting at a selected city, leaving other settlements untouched.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCorruptionScope('total_corruption')}
                className={`p-3 rounded-xl border text-left transition ${
                  corruptionScope === 'total_corruption'
                    ? 'bg-red-950/70 border-red-500 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-red-200 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  Empire-Wide Great Curse
                </div>
                <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Afflicts ALL settlements and mortals of this civilization simultaneously, casting the entire empire into darkness.
                </div>
              </button>
            </div>

            {corruptionScope === 'splinter_realm' && parentRaceCities.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 mt-2">
                <label className="text-[11px] text-slate-300 font-semibold mb-1 block">
                  Select Epicenter / Capital Settlement to Corrupt:
                </label>
                <select
                  value={targetCityId}
                  onChange={(e) => setTargetCityId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 text-xs outline-none"
                >
                  {parentRaceCities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Pop: {c.population}, Def: {c.defense})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-purple-950/80 bg-slate-950">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              Required Power:{' '}
              <span className="font-bold font-mono text-purple-400">{cost} Power</span>
            </span>
            <span className="text-xs text-slate-400">
              Available:{' '}
              <span
                className={`font-bold font-mono ${
                  canAfford ? 'text-amber-400' : 'text-red-400'
                }`}
              >
                {playerPower} Power
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleExecuteCurse}
              disabled={!canAfford || !selectedParentRace}
              className="px-5 py-2.5 rounded-xl text-xs font-bold font-serif text-white bg-gradient-to-r from-purple-700 via-purple-600 to-red-700 hover:from-purple-600 hover:to-red-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-900/40 flex items-center gap-2 transition"
            >
              <Skull className="w-4 h-4" />
              Cast Divine Curse ({cost} Power)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
