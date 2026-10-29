/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AgeId, City, Civilization, Deity, OrderItem } from '../types/game';
import { DAWN_OF_WORLDS_COSTS } from '../simulation/dawnOfWorldsRules';
import {
  X,
  Sparkles,
  Shield,
  Crown,
  BookOpen,
  Dice5,
  TreePine,
  Eye,
  Check,
  Building2,
  Users,
} from 'lucide-react';

interface OrderCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAge: AgeId;
  playerPower: number;
  playerDeity: Deity;
  civilizations: Civilization[];
  cities: City[];
  onFoundOrder: (newOrder: OrderItem, cost: number) => void;
}

type OrderType = 'knightly_order' | 'religious_sect' | 'scholars' | 'druidic_circle' | 'thieves_guild';

const ORDER_TYPES: {
  id: OrderType;
  label: string;
  icon: React.ReactNode;
  bonuses: string;
  defaultPrefixes: string[];
}[] = [
  {
    id: 'knightly_order',
    label: 'Knightly Martial Order',
    icon: <Shield className="w-4 h-4 text-blue-400" />,
    bonuses: '+2 Host City Defense, +1 Realm Army Strength, Chivalric Code',
    defaultPrefixes: ['Knights of the Silver Chalice', 'Order of the Sun Vanguard', 'Iron Brotherhood', 'Aegis Templars', 'Paladins of the Dawn'],
  },
  {
    id: 'religious_sect',
    label: 'Sacred Temple / Religious Sect',
    icon: <Crown className="w-4 h-4 text-amber-400" />,
    bonuses: '+1 Faith & Piety, +1 Moral Alignment, Fortified Chapels',
    defaultPrefixes: ['The Sacred Synod', 'Disciples of the Golden Flame', 'Conclave of the Holy Dawn', 'Sisters of Mercy', 'The Primordial Ascetics'],
  },
  {
    id: 'scholars',
    label: 'Arcane College / Scholars Cabal',
    icon: <BookOpen className="w-4 h-4 text-purple-400" />,
    bonuses: '+25% Tech Affinity, +15 City Renown, Arcane Lore Keepers',
    defaultPrefixes: ['The Grand Archive Guild', 'Observatory of the Void', 'College of Leyline Weavers', 'The Alchemical Concordat', 'The Sages of Meglin'],
  },
  {
    id: 'druidic_circle',
    label: 'Druidic Nature Circle',
    icon: <TreePine className="w-4 h-4 text-emerald-400" />,
    bonuses: '+30% Agricultural Fertility, Wilderness Protection, Sacred Groves',
    defaultPrefixes: ['Circle of the Elder Oak', 'Guardians of the Emerald Mire', 'The Thorn-Wardens', 'Verdant Communion', 'The Mist-Striders'],
  },
  {
    id: 'thieves_guild',
    label: 'Shadow Syndicate / Merchant Cabal',
    icon: <Eye className="w-4 h-4 text-slate-400" />,
    bonuses: '+35 City Wealth, Smuggling & Trade Protection, Espionage Hub',
    defaultPrefixes: ['The Obsidian Syndicate', 'The Guild of Whispers', 'League of Merchant Mariners', 'The Black Key Consortium', 'Shadow-Brokers of Meglin'],
  },
];

export const OrderCreationModal: React.FC<OrderCreationModalProps> = ({
  isOpen,
  onClose,
  currentAge,
  playerPower,
  playerDeity,
  civilizations,
  cities,
  onFoundOrder,
}) => {
  const cost = DAWN_OF_WORLDS_COSTS.create_order[currentAge] || 6;
  const canAfford = playerPower >= cost;

  const validCities = cities.filter((c) => c.status !== 'ruined');
  const [selectedCityId, setSelectedCityId] = useState<string>(
    validCities[0]?.id || ''
  );
  const [orderType, setOrderType] = useState<OrderType>('knightly_order');
  const [name, setName] = useState<string>('The Radiant Templars of the Dawn');
  const [description, setDescription] = useState<string>(
    'An elite sworn brotherhood founded under celestial mandate to defend mortal settlements against wild terrors and champion divine virtue.'
  );

  // Roll evocative order name
  const handleRollName = (type = orderType) => {
    const config = ORDER_TYPES.find((t) => t.id === type) || ORDER_TYPES[0];
    const prefix = config.defaultPrefixes[Math.floor(Math.random() * config.defaultPrefixes.length)];
    const chosenCity = validCities.find((c) => c.id === selectedCityId) || validCities[0];
    const locationSuffix = chosenCity ? ` of ${chosenCity.name}` : ` of ${playerDeity.name}`;
    const newName = `${prefix}${Math.random() > 0.5 ? locationSuffix : ''}`;
    setName(newName);

    if (type === 'knightly_order') {
      setDescription(`Sworn defenders founded under the holy guidance of ${playerDeity.name}, wielding enchanted weaponry to safeguard mortal borders.`);
    } else if (type === 'religious_sect') {
      setDescription(`Devout acolytes and inquisitors dedicated to spreading the faith of ${playerDeity.name} and erecting grand sanctuaries.`);
    } else if (type === 'scholars') {
      setDescription(`Philosophers, historians, and arcanists unlocking the primordial secrets of reality and advising monarchs.`);
    } else if (type === 'druidic_circle') {
      setDescription(`Shamans attuned to the elemental pulse of the earth, blessing crops and communing with ancient spirits.`);
    } else {
      setDescription(`A shadowy network operating in secret across markets and alleys, accumulating vast riches and geopolitical leverage.`);
    }
  };

  const handleSelectType = (type: OrderType) => {
    setOrderType(type);
    handleRollName(type);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAfford || !name.trim() || !selectedCityId) return;

    const hostCity = validCities.find((c) => c.id === selectedCityId) || validCities[0];
    const newOrder: OrderItem = {
      id: `order_${Date.now()}`,
      name: name.trim(),
      type: orderType,
      creatorDeityId: playerDeity.id,
      civilizationId: hostCity ? hostCity.civilizationId : civilizations[0]?.id || 'civ_player',
      cityId: selectedCityId,
      description: description.trim(),
      renown: 10,
    };

    onFoundOrder(newOrder, cost);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif text-white tracking-wide flex items-center gap-2">
                Found Holy / Arcane Order
              </h2>
              <p className="text-xs text-slate-400">
                Dawn of Worlds Chapter • Cost:{' '}
                <span className="font-bold text-amber-400">{cost} Power</span> (Your Reserve: {playerPower})
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

        {validCities.length === 0 ? (
          /* Empty State if No Cities Exist */
          <div className="p-8 text-center space-y-4">
            <div className="p-4 rounded-full bg-slate-800/80 text-slate-400 inline-block border border-slate-700">
              <Building2 className="w-8 h-8 opacity-70" />
            </div>
            <h3 className="text-sm font-bold text-white">Settlement Required</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              An Order requires a permanent mortal settlement to establish its grand chapter house or sanctum. Awaken a sentient species or found a city first!
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
            >
              Understood
            </button>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* Order Classification Selector */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Order Classification & Ethos
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ORDER_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectType(t.id)}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 ${
                      orderType === t.id
                        ? 'bg-purple-950/60 border-purple-500 text-white shadow-md'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-white">
                      {t.icon}
                      <span>{t.label}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 leading-tight">
                      {t.bonuses}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Host City Selector */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" /> Host Settlement (Chapter Headquarters)
              </label>
              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-purple-500 outline-none text-xs font-semibold"
              >
                {validCities.map((c) => {
                  const civ = civilizations.find((cv) => cv.id === c.civilizationId);
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} — Pop: {c.population.toLocaleString()} ({civ?.name || 'Independent'})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Order Name with Randomizer */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">Order Title</label>
                <button
                  type="button"
                  onClick={() => handleRollName(orderType)}
                  className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
                >
                  <Dice5 className="w-3.5 h-3.5" /> Roll Name
                </button>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-purple-500 outline-none font-medium text-xs"
                placeholder="e.g. The Silver Templars of Meglin"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Mission & Creed</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:border-purple-500 outline-none resize-none leading-relaxed text-xs"
                placeholder="The sacred charter and purpose of this order..."
              />
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className={`text-xs ${canAfford ? 'text-amber-400' : 'text-red-400'} font-bold`}>
                Cost: {cost} Power (Your Reserve: {playerPower})
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canAfford || !name.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold flex items-center gap-2 shadow-lg shadow-purple-600/20 transition text-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  Found Order
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
