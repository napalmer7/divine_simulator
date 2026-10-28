/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Deity, WorldStructureType } from '../types/game';
import {
  CANDIDATE_NPC_DEITIES,
  CANONICAL_DEITY_PAIRS,
  generateRandomDeity,
  DeityPair,
} from '../simulation/npcDeities';
import {
  X,
  Globe,
  Sparkles,
  Dice5,
  Crown,
  Scroll,
  Users,
  Compass,
  Flame,
  Waves,
  Mountain,
  Zap,
  Plus,
  Trash2,
  Check,
  Swords,
  HeartHandshake,
  Layers,
  Wand2,
} from 'lucide-react';

import {
  DEFAULT_TECH_TREE,
  TECH_CATEGORIES,
  TechCategory,
  TechItem,
} from '../simulation/techTree';

interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNewGame: (params: {
    worldStructure: WorldStructureType;
    playerDeity: Deity;
    totalDeityCount: number;
    selectedNpcIds: string[];
    customNpcs?: Deity[];
    customTechTree?: Record<TechCategory, TechItem[]>;
  }) => void;
}

const DIVINE_SYMBOLS = ['✧', '⚒', '☼', '☠', '❧', '⚡', '🜂', '🜄', '☾', '👁', '⚜', '⚔', '❂', '✦', '❄', '♒'];

const NAME_PRESETS = [
  { name: 'Aethelgard', title: 'The Prime Shaper', domain: 'Creation & Will', symbol: '✧', color: '#818cf8' },
  { name: 'Solaria', title: 'Lady of the Dawning Sun', domain: 'Light & Radiance', symbol: '☼', color: '#f59e0b' },
  { name: 'Ignis-Khan', title: 'The Pyre Sovereign', domain: 'Magma & Transformation', symbol: '🜂', color: '#ef4444' },
  { name: 'Zephyros', title: 'Lord of the Roaring Winds', domain: 'Skies & Tempests', symbol: '⚡', color: '#38bdf8' },
  { name: 'Gorgoroth', title: 'The World-Breaker', domain: 'Crags & Destruction', symbol: '⚒', color: '#b45309' },
  { name: 'Elysia', title: 'The Verdant Mother', domain: 'Nature & Harmony', symbol: '❧', color: '#10b981' },
  { name: 'Nyxathor', title: 'The Void Gazer', domain: 'Shadows & Mysteries', symbol: '👁', color: '#a855f7' },
];

export const NewGameModal: React.FC<NewGameModalProps> = ({
  isOpen,
  onClose,
  onStartNewGame,
}) => {
  const [worldStructure, setWorldStructure] = useState<WorldStructureType>('continental');

  // Player Deity State
  const [name, setName] = useState('Aethelgard');
  const [title, setTitle] = useState('The Prime Shaper');
  const [domain, setDomain] = useState('Creation & Will');
  const [symbol, setSymbol] = useState('✧');
  const [color, setColor] = useState('#818cf8');
  const [myth, setMyth] = useState(
    'First to awaken in the celestial expanse, Aethelgard perceives the latent potential within raw matter and calls forth continents, climates, and sentient species through pure divine will.'
  );
  const [ethos, setEthos] = useState('Cosmic Genesis, Free Will, and Creative Transcendence');

  // Personality Sliders (0.0 to 1.0)
  const [aggression, setAggression] = useState(0.4);
  const [harmony, setHarmony] = useState(0.6);
  const [expansion, setExpansion] = useState(0.5);
  const [curiosity, setCuriosity] = useState(0.8);

  // Selected NPC IDs (pre-canned or custom)
  const [selectedNpcIds, setSelectedNpcIds] = useState<string[]>([
    'deity_vulcanus',
    'deity_sylvana',
    'deity_morvath',
    'deity_aurelia',
  ]);

  // User-created or rolled custom deities
  const [customNpcs, setCustomNpcs] = useState<Deity[]>([]);

  // Navigation tabs between World & Pantheon and 5-Tier Tech Trees
  const [activeMainTab, setActiveMainTab] = useState<'world_pantheon' | 'tech_trees'>('world_pantheon');
  const [techTreeData, setTechTreeData] = useState<Record<TechCategory, TechItem[]>>(DEFAULT_TECH_TREE);
  const [activeTechCategory, setActiveTechCategory] = useState<TechCategory>('combat');

  // Active view in deity selection section
  const [pantheonTab, setPantheonTab] = useState<'precanned' | 'pairs' | 'generator'>('precanned');

  // Creator state for new custom deity
  const [customName, setCustomName] = useState('Valerius');
  const [customTitle, setCustomTitle] = useState('The Star-Weaver');
  const [customDomain, setCustomDomain] = useState('Astral Leylines & Runes');
  const [customSymbol, setCustomSymbol] = useState('✦');
  const [customColor, setCustomColor] = useState('#ec4899');
  const [customAggression, setCustomAggression] = useState(0.4);
  const [customHarmony, setCustomHarmony] = useState(0.6);
  const [customExpansion, setCustomExpansion] = useState(0.5);
  const [customCuriosity, setCustomCuriosity] = useState(0.85);

  const handleUpdateTechName = (category: TechCategory, techId: string, newName: string) => {
    setTechTreeData((prev) => ({
      ...prev,
      [category]: prev[category].map((item) => (item.id === techId ? { ...item, name: newName } : item)),
    }));
  };

  const handleUpdateTechDesc = (category: TechCategory, techId: string, newDesc: string) => {
    setTechTreeData((prev) => ({
      ...prev,
      [category]: prev[category].map((item) => (item.id === techId ? { ...item, description: newDesc } : item)),
    }));
  };

  const handleResetTechTrees = () => {
    setTechTreeData(DEFAULT_TECH_TREE);
  };

  if (!isOpen) return null;

  const handleRollPlayerDeity = () => {
    const preset = NAME_PRESETS[Math.floor(Math.random() * NAME_PRESETS.length)];
    setName(preset.name);
    setTitle(preset.title);
    setDomain(preset.domain);
    setSymbol(preset.symbol);
    setColor(preset.color);
  };

  const handleGeneratePlayerMyth = () => {
    setMyth(
      `Manifesting upon the nascent world of Meglin, ${name} embodies the divine domain of ${domain}. Guiding divine will through cosmic celestial currents, this immortal shaper seeks to mold the bedrock, sculpt the climates, and awaken races to achieve ${ethos.toLowerCase()}.`
    );
  };

  // Toggle pre-canned deity selection
  const handleToggleNpc = (npcId: string) => {
    if (selectedNpcIds.includes(npcId)) {
      if (selectedNpcIds.length <= 1) return; // Keep at least 1 NPC deity
      setSelectedNpcIds(selectedNpcIds.filter((id) => id !== npcId));
    } else {
      setSelectedNpcIds([...selectedNpcIds, npcId]);
    }
  };

  // Toggle deity pair selection (adds both if neither or only one is selected, removes both if both are selected)
  const handleTogglePair = (pair: DeityPair) => {
    const [d1, d2] = pair.deityIds;
    const hasD1 = selectedNpcIds.includes(d1);
    const hasD2 = selectedNpcIds.includes(d2);

    if (hasD1 && hasD2) {
      // Remove pair, but ensure at least 1 remains
      const filtered = selectedNpcIds.filter((id) => id !== d1 && id !== d2);
      setSelectedNpcIds(filtered.length > 0 ? filtered : [d1]);
    } else {
      // Add both
      const updated = new Set([...selectedNpcIds, d1, d2]);
      setSelectedNpcIds(Array.from(updated));
    }
  };

  // Quick select presets
  const handleSelectCanonicalFour = () => {
    setSelectedNpcIds(['deity_vulcanus', 'deity_sylvana', 'deity_morvath', 'deity_aurelia']);
  };

  const handleSelectAllPrecanned = () => {
    setSelectedNpcIds(CANDIDATE_NPC_DEITIES.map((d) => d.id));
  };

  // 1-Click Generate Random Deity
  const handleRollAndAddRandomDeity = () => {
    const rolled = generateRandomDeity(customNpcs.length + 1);
    setCustomNpcs((prev) => [...prev, rolled]);
    setSelectedNpcIds((prev) => [...prev, rolled.id]);
  };

  // Add custom deity from builder
  const handleAddCustomDeityFromForm = () => {
    if (!customName.trim()) return;
    const newCustomDeity: Deity = {
      id: `deity_custom_${Date.now()}`,
      name: customName.trim(),
      title: customTitle.trim() || 'The Immortal',
      domain: customDomain.trim() || 'Arcana',
      symbol: customSymbol,
      isPlayer: false,
      power: 12,
      thriftBonus: 0,
      lastRoll: [4, 4],
      personality: {
        aggression: customAggression,
        harmony: customHarmony,
        expansion: customExpansion,
        curiosity: customCuriosity,
      },
      color: customColor,
      avatarId: null,
      relationships: {},
      myth: `Awakening from cosmic reverie, ${customName} embodies ${customDomain}. Guided by their divine purpose, they sculpt continents, spark civilizations, and shape immortal history.`,
      ethos: `Sacred mastery of ${customDomain.toLowerCase()} and eternal celestial legacy.`,
      historicalGoals: [
        `Establish eternal dominion through ${customDomain}`,
        'Shepherd mortal followers into an era of prosperity',
        'Outwit rival deities in the celestial council',
      ],
    };

    setCustomNpcs((prev) => [...prev, newCustomDeity]);
    setSelectedNpcIds((prev) => [...prev, newCustomDeity.id]);

    // Reset generator form with another random seed
    const nextSeed = generateRandomDeity();
    setCustomName(nextSeed.name);
    setCustomTitle(nextSeed.title);
    setCustomDomain(nextSeed.domain);
    setCustomSymbol(nextSeed.symbol);
    setCustomColor(nextSeed.color);
  };

  const handleDeleteCustomDeity = (id: string) => {
    setCustomNpcs((prev) => prev.filter((d) => d.id !== id));
    setSelectedNpcIds((prev) => prev.filter((npcId) => npcId !== id));
  };

  const handleStart = () => {
    const playerDeity: Deity = {
      id: 'deity_player',
      name: name.trim() || 'The Prime Shaper',
      title: title.trim() || 'Architect of the World',
      domain: domain.trim() || 'Creation',
      symbol,
      isPlayer: true,
      power: 12,
      thriftBonus: 0,
      lastRoll: [4, 4],
      personality: {
        aggression,
        harmony,
        expansion,
        curiosity,
      },
      color,
      avatarId: null,
      relationships: {},
      myth,
      ethos,
      historicalGoals: [
        `Establish eternal dominion through ${domain}`,
        'Shape continents, climates, and prosperous civilizations',
        'Surpass rival deities and claim the highest seat in the Pantheon',
      ],
    };

    const totalDeityCount = 1 + selectedNpcIds.length;

    onStartNewGame({
      worldStructure,
      playerDeity,
      totalDeityCount,
      selectedNpcIds,
      customNpcs,
      customTechTree: techTreeData,
    });
    onClose();
  };

  const allAvailableDeities = [...CANDIDATE_NPC_DEITIES, ...customNpcs];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-white tracking-wide">
                Start New Genesis
              </h2>
              <p className="text-xs text-slate-400">
                Configure World Structure, Assemble Rival Deities & Sculpt Your Divine Avatar
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-2 bg-slate-950/60 border-b border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveMainTab('world_pantheon')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeMainTab === 'world_pantheon'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            1. World & Pantheon Setup
          </button>
          <button
            type="button"
            onClick={() => setActiveMainTab('tech_trees')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeMainTab === 'tech_trees'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            2. 5-Tier Tech Trees (Customizable)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {activeMainTab === 'world_pantheon' ? (
            <>
              {/* 1. World Structure Archetype Selection */}
              <div className="space-y-2">
                <label className="text-sm font-bold font-serif text-amber-300 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-400" /> 1. Select World Structure Archetype
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                {
                  id: 'continental' as WorldStructureType,
                  label: 'Continental',
                  desc: 'Dual organic continents & island chains',
                  icon: <Globe className="w-4 h-4 text-blue-400" />,
                },
                {
                  id: 'pangea' as WorldStructureType,
                  label: 'Pangea',
                  desc: 'One grand central supercontinent & ocean',
                  icon: <Mountain className="w-4 h-4 text-amber-400" />,
                },
                {
                  id: 'archipelago' as WorldStructureType,
                  label: 'Archipelago',
                  desc: 'Hundreds of islands & seafaring atolls',
                  icon: <Waves className="w-4 h-4 text-cyan-400" />,
                },
                {
                  id: 'shattered' as WorldStructureType,
                  label: 'Shattered Rift',
                  desc: 'High-frequency tectonic faults & rift valleys',
                  icon: <Zap className="w-4 h-4 text-purple-400" />,
                },
                {
                  id: 'waterworld' as WorldStructureType,
                  label: 'Waterworld',
                  desc: 'Deep oceanic abyss & volcanic hotspot isles',
                  icon: <Flame className="w-4 h-4 text-red-400" />,
                },
              ].map((struct) => (
                <button
                  key={struct.id}
                  type="button"
                  onClick={() => setWorldStructure(struct.id)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                    worldStructure === struct.id
                      ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    {struct.icon}
                    {worldStructure === struct.id && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">{struct.label}</div>
                    <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                      {struct.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Player Deity Customization */}
          <div className="space-y-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <label className="text-sm font-bold font-serif text-amber-300 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" /> 2. Customize Your Divine Profile
              </label>
              <button
                type="button"
                onClick={handleRollPlayerDeity}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
              >
                <Dice5 className="w-3.5 h-3.5" /> Roll Random Identity
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Deity Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-semibold outline-none focus:border-amber-500 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Sacred Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none focus:border-amber-500 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Primary Domain</label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none focus:border-amber-500 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-slate-400 mb-1.5 block">Divine Sacred Symbol</label>
                <div className="flex flex-wrap gap-1.5">
                  {DIVINE_SYMBOLS.map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => setSymbol(sym)}
                      className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center font-bold transition border ${
                        symbol === sym
                          ? 'bg-amber-500 text-slate-950 border-amber-300 shadow'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 mb-1.5 block">Aura & Radiance Tint</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-9 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="font-mono text-slate-300 uppercase text-[11px]">{color}</span>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm shadow ml-auto"
                    style={{ backgroundColor: `${color}30`, color }}
                  >
                    {symbol}
                  </div>
                </div>
              </div>
            </div>

            {/* Personality Matrix */}
            <div>
              <div className="text-[11px] font-semibold text-slate-300 mb-2">
                Personality & Divine Alignment:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Aggression</span>
                    <span className="font-bold text-red-400">{Math.round(aggression * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={aggression}
                    onChange={(e) => setAggression(parseFloat(e.target.value))}
                    className="w-full accent-red-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Harmony</span>
                    <span className="font-bold text-emerald-400">{Math.round(harmony * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={harmony}
                    onChange={(e) => setHarmony(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Expansion</span>
                    <span className="font-bold text-amber-400">{Math.round(expansion * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={expansion}
                    onChange={(e) => setExpansion(parseFloat(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Curiosity</span>
                    <span className="font-bold text-cyan-400">{Math.round(curiosity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={curiosity}
                    onChange={(e) => setCuriosity(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Myth & Lore */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Scroll className="w-3.5 h-3.5 text-amber-400" /> Divine Myth & Cosmic Origin
                </label>
                <button
                  type="button"
                  onClick={handleGeneratePlayerMyth}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Generate Myth Narrative
                </button>
              </div>
              <textarea
                rows={2}
                value={myth}
                onChange={(e) => setMyth(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none focus:border-amber-500 resize-none text-xs leading-relaxed"
              />
            </div>
          </div>

          {/* 3. Assemble The Pantheon (Select Deities, Thematic Pairs, or Generate Your Own) */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div>
                <label className="text-sm font-bold font-serif text-amber-300 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-400" /> 3. Assemble the Rival Pantheon
                </label>
                <p className="text-[11px] text-slate-400">
                  Select canonical deities, activate thematic rivalry pairs, or generate custom deities
                </p>
              </div>

              {/* Total Deity Badge */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/50 text-indigo-200 font-bold text-xs shadow">
                  Pantheon: 1 Player + {selectedNpcIds.length} NPCs ({1 + selectedNpcIds.length} Total)
                </span>
              </div>
            </div>

            {/* Navigation Tabs for Pantheon Setup */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPantheonTab('precanned')}
                  className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition text-xs ${
                    pantheonTab === 'precanned'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" /> Pre-canned Deities ({CANDIDATE_NPC_DEITIES.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPantheonTab('pairs')}
                  className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition text-xs ${
                    pantheonTab === 'pairs'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Swords className="w-3.5 h-3.5 text-purple-400" /> Thematic Rivalry Pairs ({CANONICAL_DEITY_PAIRS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPantheonTab('generator')}
                  className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition text-xs ${
                    pantheonTab === 'generator'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Wand2 className="w-3.5 h-3.5 text-emerald-400" /> Custom Deity Generator ({customNpcs.length})
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={handleSelectCanonicalFour}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition"
                >
                  Default 4
                </button>
                <button
                  type="button"
                  onClick={handleSelectAllPrecanned}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleRollAndAddRandomDeity}
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-600/60 text-emerald-300 hover:bg-emerald-900/60 transition flex items-center gap-1 font-bold"
                >
                  <Dice5 className="w-3 h-3" /> Quick Roll
                </button>
              </div>
            </div>

            {/* TAB 1: Individual Pre-canned Deities */}
            {pantheonTab === 'precanned' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                {CANDIDATE_NPC_DEITIES.map((npc) => {
                  const isSelected = selectedNpcIds.includes(npc.id);
                  return (
                    <button
                      key={npc.id}
                      type="button"
                      onClick={() => handleToggleNpc(npc.id)}
                      className={`p-3 rounded-xl border text-left flex items-start gap-3 transition ${
                        isSelected
                          ? 'bg-slate-900 border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base shadow flex-shrink-0"
                        style={{ backgroundColor: `${npc.color}25`, color: npc.color }}
                      >
                        {npc.symbol}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs truncate">{npc.name}</span>
                          <span
                            className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                              isSelected ? 'bg-amber-500 text-slate-950 font-black' : 'border border-slate-700'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </span>
                        </div>
                        <div className="text-[10px] text-amber-300/90 truncate font-medium">
                          {npc.domain}
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {npc.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-[9px] text-slate-400 font-mono">
                          <span>Agg: {Math.round(npc.personality.aggression * 100)}%</span>
                          <span>Har: {Math.round(npc.personality.harmony * 100)}%</span>
                          <span>Exp: {Math.round(npc.personality.expansion * 100)}%</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* TAB 2: Canonical Deity Pairs */}
            {pantheonTab === 'pairs' && (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] text-slate-400">
                  Deity Pairs represent eternal metaphysical rivalries and complementary opposing domains. Toggle a pair to add or remove both deities simultaneously.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CANONICAL_DEITY_PAIRS.map((pair) => {
                    const [d1Id, d2Id] = pair.deityIds;
                    const deity1 = CANDIDATE_NPC_DEITIES.find((d) => d.id === d1Id);
                    const deity2 = CANDIDATE_NPC_DEITIES.find((d) => d.id === d2Id);
                    const isBothSelected = selectedNpcIds.includes(d1Id) && selectedNpcIds.includes(d2Id);
                    const isPartial =
                      (selectedNpcIds.includes(d1Id) || selectedNpcIds.includes(d2Id)) && !isBothSelected;

                    return (
                      <div
                        key={pair.id}
                        className={`p-3 rounded-xl border transition ${
                          isBothSelected
                            ? 'bg-slate-900 border-purple-500/80 shadow-md ring-1 ring-purple-500/30'
                            : isPartial
                            ? 'bg-slate-950/80 border-purple-800/50'
                            : 'bg-slate-950/60 border-slate-800 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-white text-xs flex items-center gap-1.5">
                            <Swords className="w-3.5 h-3.5 text-purple-400" /> {pair.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleTogglePair(pair)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                              isBothSelected
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:text-white'
                            }`}
                          >
                            {isBothSelected ? 'Pair Active' : 'Add Pair'}
                          </button>
                        </div>
                        <div className="text-[10px] text-purple-300 font-semibold mb-1">
                          {pair.theme}
                        </div>
                        <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
                          {pair.description}
                        </p>

                        {/* Deity Badges */}
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                          {deity1 && (
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-200">
                              <span
                                className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold"
                                style={{ backgroundColor: `${deity1.color}25`, color: deity1.color }}
                              >
                                {deity1.symbol}
                              </span>
                              <span>{deity1.name}</span>
                            </div>
                          )}
                          <span className="text-slate-500 font-bold">vs</span>
                          {deity2 && (
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-200">
                              <span
                                className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold"
                                style={{ backgroundColor: `${deity2.color}25`, color: deity2.color }}
                              >
                                {deity2.symbol}
                              </span>
                              <span>{deity2.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: Custom Deity Generator & List */}
            {pantheonTab === 'generator' && (
              <div className="space-y-4 pt-1">
                {/* Custom Deity Creation Form */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                      <Wand2 className="w-3.5 h-3.5" /> Divine Shaper Synthesizer
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const r = generateRandomDeity();
                        setCustomName(r.name);
                        setCustomTitle(r.title);
                        setCustomDomain(r.domain);
                        setCustomSymbol(r.symbol);
                        setCustomColor(r.color);
                      }}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                    >
                      <Dice5 className="w-3 h-3" /> Roll Values
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[10px] text-slate-400 mb-1 block">NPC Name</label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-semibold outline-none focus:border-emerald-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 mb-1 block">Title / Epithet</label>
                      <input
                        type="text"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white outline-none focus:border-emerald-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 mb-1 block">Domain</label>
                      <input
                        type="text"
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white outline-none focus:border-emerald-500 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">Symbol:</span>
                      <div className="flex gap-1">
                        {['✧', '⚒', '☼', '☠', '❧', '⚡', '🜂', '☾', '👁', '✦'].map((sym) => (
                          <button
                            key={sym}
                            type="button"
                            onClick={() => setCustomSymbol(sym)}
                            className={`w-6 h-6 rounded text-xs flex items-center justify-center font-bold ${
                              customSymbol === sym
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-950 text-slate-300'
                            }`}
                          >
                            {sym}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">Aura Color:</span>
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="w-7 h-6 rounded cursor-pointer bg-transparent border-0"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddCustomDeityFromForm}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition ml-auto"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Deity to Pantheon
                    </button>
                  </div>
                </div>

                {/* List of Custom Deities Created */}
                {customNpcs.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-300">
                      User-Generated Deities ({customNpcs.length}):
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {customNpcs.map((cDeity) => {
                        const isSelected = selectedNpcIds.includes(cDeity.id);
                        return (
                          <div
                            key={cDeity.id}
                            className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow flex-shrink-0"
                                style={{ backgroundColor: `${cDeity.color}25`, color: cDeity.color }}
                              >
                                {cDeity.symbol}
                              </div>
                              <div className="overflow-hidden">
                                <div className="font-bold text-white text-xs truncate">
                                  {cDeity.name}
                                </div>
                                <div className="text-[10px] text-emerald-300 truncate">
                                  {cDeity.domain}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleNpc(cDeity.id)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isSelected
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                              >
                                {isSelected ? 'Active' : 'Bench'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCustomDeity(cDeity.id)}
                                className="p-1 rounded text-slate-400 hover:text-red-400 transition"
                                title="Remove custom deity"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pantheon Lineup Preview Summary */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="text-[11px] font-semibold text-slate-300 mb-1.5">
                Current Council Lineup ({1 + selectedNpcIds.length} Shapers):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {/* Player Chip */}
                <div
                  className="px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 shadow"
                  style={{ backgroundColor: `${color}25`, borderColor: color, color }}
                >
                  <span>{symbol}</span>
                  <span>{name} (You)</span>
                </div>

                {/* Selected NPC Chips */}
                {selectedNpcIds.map((id) => {
                  const deity = allAvailableDeities.find((d) => d.id === id);
                  if (!deity) return null;
                  return (
                    <div
                      key={deity.id}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-[11px] flex items-center gap-1.5"
                    >
                      <span style={{ color: deity.color }}>{deity.symbol}</span>
                      <span className="font-medium">{deity.name}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleNpc(deity.id)}
                        className="text-slate-400 hover:text-white ml-0.5"
                        title="Remove from council"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
            </>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-amber-300 font-serif flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" /> 5-Tier Technological Advancement Trees
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Pre-define & customize the civilizational breakthroughs across all domains. Mortals progress sequentially or can skip tiers at 1.5× Power.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetTechTrees}
                  className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 font-medium transition"
                >
                  Reset to Defaults
                </button>
              </div>

              {/* Category tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {Object.values(TECH_CATEGORIES).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveTechCategory(cat.id)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                      activeTechCategory === cat.id
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-md'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      {cat.description}
                    </div>
                  </button>
                ))}
              </div>

              {/* Tiers for selected category */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Advancement Tiers: {TECH_CATEGORIES[activeTechCategory]?.name}</span>
                  <span className="text-[11px] text-amber-400/80 bg-amber-950/40 px-2.5 py-0.5 rounded border border-amber-800/40 font-mono">
                    Tier skipping cost multiplier: 1.5×
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {techTreeData[activeTechCategory].map((tech) => (
                    <div
                      key={tech.id}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center gap-3"
                    >
                      <div className="flex sm:flex-col items-center justify-center min-w-[75px] px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-center shrink-0">
                        <span className="text-amber-400 font-bold text-xs">Tier {tech.tier}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{tech.baseCost} Pts</span>
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 w-12">Name:</label>
                          <input
                            type="text"
                            value={tech.name}
                            onChange={(e) => handleUpdateTechName(activeTechCategory, tech.id, e.target.value)}
                            className="flex-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white font-semibold text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 w-12">Desc:</label>
                          <input
                            type="text"
                            value={tech.description}
                            onChange={(e) => handleUpdateTechDesc(activeTechCategory, tech.id, e.target.value)}
                            className="flex-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStart}
            disabled={selectedNpcIds.length === 0}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold flex items-center gap-2 shadow-lg shadow-amber-600/20 transition text-xs disabled:opacity-40"
          >
            <Sparkles className="w-4 h-4" />
            Begin Cosmic Genesis ({1 + selectedNpcIds.length} Deities)
          </button>
        </div>
      </div>
    </div>
  );
};
