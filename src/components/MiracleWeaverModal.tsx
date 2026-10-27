/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ClimateType, CustomMiracleTemplate, TerrainType, WorldCell } from '../types/game';
import { AVAILABLE_TECHNOLOGIES } from '../simulation/dawnOfWorldsRules';
import { PRESET_MIRACLES } from '../simulation/miracles';
import { Sparkles, Wand2, X } from 'lucide-react';

interface MiracleWeaverModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCell: WorldCell | null;
  playerPower: number;
  onCastMiracle: (miracle: CustomMiracleTemplate) => void;
}

export const MiracleWeaverModal: React.FC<MiracleWeaverModalProps> = ({
  isOpen,
  onClose,
  targetCell,
  playerPower,
  onCastMiracle,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'weave'>('presets');
  const [name, setName] = useState('Boreal Aurora Awakening');
  const [description, setDescription] = useState(
    'A luminous celestial aurora descends, warming the frigid atmosphere into blooming temperate woodlands and instilling sacred harmony.'
  );
  const [targetType, setTargetType] = useState<'region' | 'cell'>('region');
  const [climateShift, setClimateShift] = useState<ClimateType | ''>('temperate');
  const [terrainShift, setTerrainShift] = useState<TerrainType | ''>('forest');
  const [fertilityDelta, setFertilityDelta] = useState(0.4);
  const [alignmentDelta, setAlignmentDelta] = useState(1);
  const [populationDeltaPct, setPopulationDeltaPct] = useState(20);
  const [grantTech, setGrantTech] = useState<string>('');
  const [vfxColor, setVfxColor] = useState('#10b981');

  if (!isOpen) return null;

  const cost = 5; // Dawn of Worlds custom miracle invocation cost
  const canAfford = playerPower >= cost;

  const handleCastCustom = () => {
    if (!canAfford) return;
    const miracle: CustomMiracleTemplate = {
      name: name.trim() || 'Divine Intervention',
      description: description.trim(),
      targetType,
      climateShift: climateShift ? (climateShift as ClimateType) : undefined,
      terrainShift: terrainShift ? (terrainShift as TerrainType) : undefined,
      fertilityDelta,
      alignmentDelta,
      populationDeltaPct,
      grantTechnology: grantTech || undefined,
      vfxColor,
      auraName: name.trim(),
    };
    onCastMiracle(miracle);
    onClose();
  };

  const handleCastPreset = (preset: CustomMiracleTemplate) => {
    if (!canAfford) return;
    onCastMiracle(preset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-amber-600/50 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-amber-200 tracking-wide">
                Weave Divine Miracle
              </h2>
              <p className="text-xs text-slate-400">
                Reshape Climate & Guide Mortal Destinies • Cost:{' '}
                <span className="font-bold text-amber-400">{cost} Power</span>{' '}
                {targetCell && (
                  <span className="text-slate-400">
                    | Target: [{targetCell.lat.toFixed(0)}°, {targetCell.lon.toFixed(0)}°] (
                    {targetCell.terrain})
                  </span>
                )}
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

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/40">
          <button
            onClick={() => setActiveTab('presets')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'presets'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Sanctified Presets
          </button>
          <button
            onClick={() => setActiveTab('weave')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'weave'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Custom Miracle Weaver
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === 'presets' ? (
            <div className="space-y-3">
              {PRESET_MIRACLES.map((preset) => (
                <div
                  key={preset.name}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 hover:border-amber-500/50 hover:bg-slate-800/80 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shadow"
                        style={{ backgroundColor: preset.vfxColor }}
                      ></span>
                      <span className="font-bold text-sm text-amber-200 font-serif">
                        {preset.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-700 text-slate-300 capitalize">
                        {preset.targetType} Scope
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                      {preset.description}
                    </p>
                    <div className="flex gap-2 text-[10px] text-slate-300 pt-1">
                      {preset.terrainShift && (
                        <span className="text-emerald-400">Terrain: {preset.terrainShift}</span>
                      )}
                      {preset.climateShift && (
                        <span className="text-cyan-400">Climate: {preset.climateShift}</span>
                      )}
                      {preset.fertilityDelta && (
                        <span className="text-amber-400">
                          Fertility +{(preset.fertilityDelta * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    disabled={!canAfford}
                    onClick={() => handleCastPreset(preset)}
                    className="px-4 py-2 rounded-lg font-bold bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 transition flex items-center gap-1.5 shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Cast Miracle
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Name & Scope */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Miracle Title</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Scope</label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as 'region' | 'cell')}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-amber-500 outline-none"
                  >
                    <option value="region">Regional Radius (7 Cells)</option>
                    <option value="cell">Focal Cell (1 Cell)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Incantation & Mythic Effect</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-amber-500 outline-none resize-none"
                />
              </div>

              {/* Climate & Terrain Metamorphosis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Climate Transformation</label>
                  <select
                    value={climateShift}
                    onChange={(e) => setClimateShift(e.target.value as ClimateType | '')}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-amber-500 outline-none"
                  >
                    <option value="">Maintain Current Climate</option>
                    <option value="temperate">Temperate (Balanced, High Agriculture)</option>
                    <option value="tropical">Tropical (Warm Rains & Jungle Canopies)</option>
                    <option value="arctic">Arctic Permafrost (Sub-zero Glaciation)</option>
                    <option value="arid">Arid Badlands (Scorched Sun)</option>
                    <option value="geothermal">Geothermal Caldera (Volcanic Fissures)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Terrain Metamorphosis</label>
                  <select
                    value={terrainShift}
                    onChange={(e) => setTerrainShift(e.target.value as TerrainType | '')}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-amber-500 outline-none"
                  >
                    <option value="">Preserve Existing Geography</option>
                    <option value="forest">Seed Primordial Forest</option>
                    <option value="plains">Cultivate Open Fertile Plains</option>
                    <option value="mountains">Erect Towering Mountain Spires</option>
                    <option value="volcanic">Ignite Volcanic Peaks</option>
                    <option value="tundra">Encase in Crystalline Tundra</option>
                    <option value="swamp">Sink into Miasmic Mire</option>
                  </select>
                </div>
              </div>

              {/* Civilization Blessing & Moral Alignment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Fertility Delta (+{(fertilityDelta * 100).toFixed(0)}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="0.8"
                    step="0.1"
                    value={fertilityDelta}
                    onChange={(e) => setFertilityDelta(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Demographic Surge (+{populationDeltaPct}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={populationDeltaPct}
                    onChange={(e) => setPopulationDeltaPct(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Alignment ({alignmentDelta > 0 ? `+${alignmentDelta} Holy` : alignmentDelta < 0 ? `${alignmentDelta} Void` : 'Neutral'})
                  </label>
                  <input
                    type="range"
                    min="-3"
                    max="3"
                    step="1"
                    value={alignmentDelta}
                    onChange={(e) => setAlignmentDelta(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Bestow Knowledge / Technology */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Gift Arcane Knowledge</label>
                  <select
                    value={grantTech}
                    onChange={(e) => setGrantTech(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-amber-500 outline-none"
                  >
                    <option value="">No Technology Gift</option>
                    {AVAILABLE_TECHNOLOGIES.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Celestial Aura Radiance</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={vfxColor}
                      onChange={(e) => setVfxColor(e.target.value)}
                      className="w-9 h-9 rounded cursor-pointer border border-slate-700 bg-transparent"
                    />
                    <span className="text-slate-400 font-mono text-[11px]">{vfxColor}</span>
                  </div>
                </div>
              </div>

              {/* Cast Action */}
              <button
                disabled={!canAfford}
                onClick={handleCastCustom}
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 shadow-lg shadow-amber-600/30 transition flex items-center justify-center gap-2 text-sm mt-3"
              >
                <Sparkles className="w-4 h-4" /> Manifest Custom Miracle ({cost} Divine Power)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
