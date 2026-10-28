/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Race } from '../types/game';

interface RaceArtworkProps {
  race?: Race | null;
  className?: string;
  showBadge?: boolean;
}

/**
 * High-fidelity graphical vector illustration for each race based on their myth,
 * culture, physiology, and environment.
 */
export const RaceArtwork: React.FC<RaceArtworkProps> = ({
  race,
  className = 'w-full h-36',
  showBadge = true,
}) => {
  if (!race) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center ${className}`}>
        <span className="text-slate-500 font-serif text-xs">Unknown Morton Folk</span>
      </div>
    );
  }

  const raceName = race.name.toLowerCase();
  const subraceType = (race.subraceType || '').toLowerCase();
  const category = race.category || 'civilized';

  // 1. High Elves / Wood Elves / Ethereal Elvenkind
  if (raceName.includes('elf') || raceName.includes('elven') || subraceType.includes('forest') || subraceType.includes('wood')) {
    return (
      <div className={`relative overflow-hidden rounded-xl border border-emerald-500/40 shadow-lg ${className}`}>
        <svg viewBox="0 0 400 220" className="w-full h-full object-cover select-none" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="elfSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#064e3b" />
              <stop offset="50%" stopColor="#065f46" />
              <stop offset="100%" stopColor="#022c22" />
            </linearGradient>
            <radialGradient id="starlightAura" cx="70%" cy="25%" r="40%">
              <stop offset="0%" stopColor="#a7f3d0" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#34d399" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="ivorySpire" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ecfdf5" />
              <stop offset="50%" stopColor="#a7f3d0" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="manaGlow" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Deep Twilight Canopy */}
          <rect width="400" height="220" fill="url(#elfSky)" />
          <circle cx="280" cy="55" r="90" fill="url(#starlightAura)" />

          {/* Constellations and Starlight */}
          <circle cx="60" cy="35" r="1.5" fill="#fef08a" opacity="0.8" />
          <circle cx="120" cy="20" r="1.2" fill="#fff" opacity="0.9" />
          <circle cx="190" cy="40" r="2" fill="#6ee7b7" opacity="0.9" />
          <circle cx="340" cy="30" r="1.8" fill="#a7f3d0" opacity="0.9" />
          <line x1="60" y1="35" x2="120" y2="20" stroke="#a7f3d0" strokeWidth="0.5" opacity="0.4" strokeDasharray="2,2" />
          <line x1="120" y1="20" x2="190" y2="40" stroke="#a7f3d0" strokeWidth="0.5" opacity="0.4" strokeDasharray="2,2" />

          {/* Ancient Elderwood Silhouette Background */}
          <path d="M-10,220 L25,110 L60,220 L110,95 L160,220 L210,120 L260,220" fill="#064e3b" opacity="0.6" />
          <path d="M140,220 L190,100 L240,220 L300,80 L350,220 L390,130 L420,220" fill="#047857" opacity="0.5" />

          {/* Ivory Spire of High Wisdom */}
          <path d="M260,220 L275,50 L285,18 L295,50 L310,220 Z" fill="url(#ivorySpire)" />
          {/* Spire Archway and Windows */}
          <polygon points="280,70 290,50 300,70 290,85" fill="#047857" opacity="0.8" />
          <path d="M282,100 Q285,90 288,100 L288,125 L282,125 Z" fill="#34d399" />
          <circle cx="285" cy="15" r="4" fill="#fef08a" filter="drop-shadow(0 0 6px #fef08a)" />

          {/* Foreground Ancient Tree with Luminous Runes */}
          <path d="M0,220 C40,180 30,120 15,80 C50,110 70,160 80,220 Z" fill="#022c22" />
          <path d="M15,80 C-10,60 -5,20 30,10 C50,40 45,70 15,80 Z" fill="#065f46" opacity="0.85" />
          <path d="M40,110 C80,80 120,85 135,110 C100,125 70,130 40,110 Z" fill="#047857" opacity="0.8" />

          {/* Arcane Mana Leyline Currents */}
          <path d="M0,180 Q100,140 200,165 T400,170 L400,220 L0,220 Z" fill="url(#manaGlow)" />
          <path d="M0,195 Q150,175 280,185 T400,180" stroke="#a7f3d0" strokeWidth="1.5" fill="none" opacity="0.7" />

          {/* Foreground Heraldic Crest: Crescent Arcane Willow */}
          <g transform="translate(60, 130)">
            <circle cx="35" cy="35" r="28" fill="#022c22" stroke="#34d399" strokeWidth="2" />
            <path d="M35,15 C45,15 52,24 52,35 C52,46 45,55 35,55 C41,47 43,39 40,31 C38,25 35,20 35,15 Z" fill="#6ee7b7" />
            <circle cx="30" cy="35" r="3" fill="#fef08a" />
            <path d="M22,35 Q28,25 35,28 T46,38" stroke="#a7f3d0" strokeWidth="1.5" fill="none" />
          </g>
        </svg>

        {showBadge && (
          <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-400/50 text-[10px] font-serif font-bold text-emerald-200 backdrop-blur-sm flex items-center gap-1.5 shadow">
            <span>🌿</span>
            <span>{race.name}</span>
          </div>
        )}
      </div>
    );
  }

  // 2. Mountain Dwarves / Subterranean Metalsmiths
  if (raceName.includes('dwarf') || raceName.includes('dwarven') || subraceType.includes('mountain') || subraceType.includes('magma')) {
    return (
      <div className={`relative overflow-hidden rounded-xl border border-amber-500/40 shadow-lg ${className}`}>
        <svg viewBox="0 0 400 220" className="w-full h-full object-cover select-none" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="dwarfCavern" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1c1917" />
              <stop offset="60%" stopColor="#292524" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
            <linearGradient id="moltenGold" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fef08a" />
            </linearGradient>
            <linearGradient id="stoneColumn" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#292524" />
              <stop offset="50%" stopColor="#57534e" />
              <stop offset="100%" stopColor="#1c1917" />
            </linearGradient>
          </defs>

          {/* Deep Subterranean Hall */}
          <rect width="400" height="220" fill="url(#dwarfCavern)" />

          {/* Vaulted Runic Arches */}
          <path d="M-20,0 Q90,90 200,0 Q310,90 420,0" stroke="#78716c" strokeWidth="8" fill="none" opacity="0.4" />
          <path d="M30,0 Q110,60 190,0" stroke="#fbbf24" strokeWidth="1.5" fill="none" opacity="0.3" strokeDasharray="4,4" />

          {/* Great Masonry Pillars */}
          <rect x="30" y="0" width="35" height="220" fill="url(#stoneColumn)" />
          <rect x="335" y="0" width="35" height="220" fill="url(#stoneColumn)" />
          {/* Pillar Runic Engravings */}
          <path d="M42,50 L52,60 L42,70 M42,90 L52,90 M42,120 L52,130" stroke="#fbbf24" strokeWidth="1.5" opacity="0.6" />
          <path d="M347,50 L357,60 L347,70 M347,90 L357,90 M347,120 L357,130" stroke="#fbbf24" strokeWidth="1.5" opacity="0.6" />

          {/* Molten Magma Channels at Base */}
          <path d="M0,195 Q100,185 200,205 T400,190 L400,220 L0,220 Z" fill="url(#moltenGold)" opacity="0.9" />
          <path d="M70,195 Q140,175 220,190 T350,180" stroke="#fff7ed" strokeWidth="2" fill="none" opacity="0.8" />

          {/* Great Anvil and Forge Core */}
          <g transform="translate(160, 95)">
            {/* Forge Glow */}
            <circle cx="40" cy="50" r="60" fill="#f59e0b" opacity="0.25" filter="blur(8px)" />
            {/* Massive Masterwork Anvil */}
            <path d="M15,40 L65,40 L78,50 L68,60 L55,60 L50,85 L65,95 L15,95 L30,85 L25,60 L12,60 Z" fill="#57534e" stroke="#fbbf24" strokeWidth="1.5" />
            <polygon points="50,25 56,38 24,38 30,25" fill="#f59e0b" />
            {/* Sparks Flying */}
            <circle cx="35" cy="22" r="2" fill="#fef08a" />
            <circle cx="48" cy="18" r="1.5" fill="#f97316" />
            <circle cx="22" cy="28" r="1.5" fill="#fef08a" />
            <circle cx="58" cy="26" r="2" fill="#fff" />
          </g>

          {/* Dwarven War Emblem: Crossed Hammers & Mountain Peak */}
          <g transform="translate(45, 125)">
            <polygon points="35,10 65,55 5,55" fill="#1c1917" stroke="#fbbf24" strokeWidth="2" />
            <rect x="27" y="24" width="16" height="24" fill="#78716c" stroke="#f59e0b" strokeWidth="1" />
            <line x1="20" y1="48" x2="50" y2="28" stroke="#fbbf24" strokeWidth="3" />
            <line x1="50" y1="48" x2="20" y2="28" stroke="#fbbf24" strokeWidth="3" />
          </g>
        </svg>

        {showBadge && (
          <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-400/50 text-[10px] font-serif font-bold text-amber-200 backdrop-blur-sm flex items-center gap-1.5 shadow">
            <span>⚒</span>
            <span>{race.name}</span>
          </div>
        )}
      </div>
    );
  }

  // 3. Steppe Orcs / Fierce Warrior Clans
  if (raceName.includes('orc') || category === 'monstrous' && raceName.includes('war')) {
    return (
      <div className={`relative overflow-hidden rounded-xl border border-red-500/40 shadow-lg ${className}`}>
        <svg viewBox="0 0 400 220" className="w-full h-full object-cover select-none" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="orcSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#450a0a" />
              <stop offset="50%" stopColor="#7f1d1d" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
            <linearGradient id="cragRock" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1f1f1f" />
              <stop offset="100%" stopColor="#0f0f0f" />
            </linearGradient>
          </defs>

          {/* Blood Moon / Storm Sky */}
          <rect width="400" height="220" fill="url(#orcSky)" />
          <circle cx="320" cy="55" r="45" fill="#f87171" opacity="0.5" />
          <circle cx="320" cy="55" r="35" fill="#ef4444" opacity="0.8" />

          {/* Storm Clouds */}
          <path d="M0,40 Q90,15 180,35 T360,25 L400,0 L0,0 Z" fill="#1c1917" opacity="0.7" />

          {/* Jagged Crags & Spiked War Palisades */}
          <polygon points="0,220 40,110 90,220" fill="url(#cragRock)" />
          <polygon points="70,220 130,80 190,220" fill="url(#cragRock)" />
          <polygon points="260,220 330,95 400,220" fill="url(#cragRock)" />

          {/* Iron-Spiked Frontier Palisade Wall */}
          <g stroke="#1c1917" strokeWidth="4">
            <line x1="120" y1="220" x2="120" y2="140" />
            <line x1="135" y1="220" x2="135" y2="130" />
            <line x1="150" y1="220" x2="150" y2="135" />
            <line x1="165" y1="220" x2="165" y2="125" />
            <line x1="180" y1="220" x2="180" y2="138" />
            <line x1="195" y1="220" x2="195" y2="128" />
            <line x1="210" y1="220" x2="210" y2="135" />
            <line x1="225" y1="220" x2="225" y2="120" />
            <line x1="240" y1="220" x2="240" y2="132" />
          </g>

          {/* Roaring War Bonfire */}
          <g transform="translate(190, 160)">
            <polygon points="10,25 25,5 40,25" fill="#ea580c" />
            <polygon points="15,25 25,0 35,25" fill="#f59e0b" />
            <polygon points="20,25 25,10 30,25" fill="#fef08a" />
            <line x1="5" y1="25" x2="45" y2="25" stroke="#451a03" strokeWidth="4" />
          </g>

          {/* Spiked War Totem / Tusks Emblem */}
          <g transform="translate(50, 125)">
            <circle cx="35" cy="35" r="26" fill="#1c1917" stroke="#ef4444" strokeWidth="2.5" />
            {/* Skull & Tusks */}
            <path d="M25,25 Q35,18 45,25 L45,40 L25,40 Z" fill="#fca5a5" />
            <circle cx="30" cy="30" r="2.5" fill="#450a0a" />
            <circle cx="40" cy="30" r="2.5" fill="#450a0a" />
            {/* Curved Tusks */}
            <path d="M23,40 Q18,35 18,25 Q23,32 26,38 Z" fill="#fef2f2" />
            <path d="M47,40 Q52,35 52,25 Q47,32 44,38 Z" fill="#fef2f2" />
          </g>
        </svg>

        {showBadge && (
          <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-500/50 text-[10px] font-serif font-bold text-red-200 backdrop-blur-sm flex items-center gap-1.5 shadow">
            <span>⚔</span>
            <span>{race.name}</span>
          </div>
        )}
      </div>
    );
  }

  // 4. Deep Goblins & Subterranean Tinkers / Scavengers
  if (raceName.includes('goblin') || raceName.includes('kobold')) {
    return (
      <div className={`relative overflow-hidden rounded-xl border border-lime-500/40 shadow-lg ${className}`}>
        <svg viewBox="0 0 400 220" className="w-full h-full object-cover select-none" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="goblinBg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#142109" />
              <stop offset="60%" stopColor="#1c2d0f" />
              <stop offset="100%" stopColor="#365314" />
            </linearGradient>
            <radialGradient id="shroomGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#bef264" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#65a30d" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Cavern Hollow */}
          <rect width="400" height="220" fill="url(#goblinBg)" />

          {/* Stalactites hanging from roof */}
          <polygon points="20,0 35,70 50,0" fill="#0f172a" />
          <polygon points="75,0 95,95 115,0" fill="#0f172a" />
          <polygon points="180,0 200,60 220,0" fill="#0f172a" />
          <polygon points="290,0 315,85 340,0" fill="#0f172a" />
          <polygon points="360,0 375,50 390,0" fill="#0f172a" />

          {/* Bioluminescent Fungal Colonies */}
          <g transform="translate(260, 130)">
            <circle cx="30" cy="30" r="45" fill="url(#shroomGlow)" />
            {/* Shroom 1 */}
            <path d="M10,45 C10,25 40,25 40,45 Z" fill="#a3e635" />
            <rect x="22" y="45" width="6" height="20" fill="#ecfccb" />
            <circle cx="20" cy="33" r="2" fill="#fff" />
            <circle cx="30" cy="30" r="2.5" fill="#fff" />
            {/* Shroom 2 */}
            <path d="M35,50 C35,35 60,35 60,50 Z" fill="#84cc16" />
            <rect x="45" y="50" width="5" height="15" fill="#ecfccb" />
          </g>

          {/* Makeshift Scrapper Gears & Pulleys */}
          <g transform="translate(130, 80)">
            <circle cx="40" cy="40" r="30" fill="#3f3f46" stroke="#ca8a04" strokeWidth="4" strokeDasharray="8,6" />
            <circle cx="40" cy="40" r="14" fill="#18181b" stroke="#ca8a04" strokeWidth="2" />
            <line x1="40" y1="26" x2="40" y2="54" stroke="#ca8a04" strokeWidth="2" />
            <line x1="26" y1="40" x2="54" y2="40" stroke="#ca8a04" strokeWidth="2" />
          </g>

          {/* Goblin Tinker Crest: Brass Goggles & Serrated Dagger */}
          <g transform="translate(45, 125)">
            <polygon points="35,10 65,55 5,55" fill="#142109" stroke="#a3e635" strokeWidth="2" />
            {/* Goggles */}
            <circle cx="27" cy="35" r="9" fill="#ca8a04" stroke="#facc15" strokeWidth="1.5" />
            <circle cx="43" cy="35" r="9" fill="#ca8a04" stroke="#facc15" strokeWidth="1.5" />
            <circle cx="27" cy="35" r="6" fill="#a3e635" />
            <circle cx="43" cy="35" r="6" fill="#a3e635" />
            <line x1="36" y1="35" x2="34" y2="35" stroke="#facc15" strokeWidth="2" />
          </g>
        </svg>

        {showBadge && (
          <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-lime-950/80 border border-lime-400/50 text-[10px] font-serif font-bold text-lime-200 backdrop-blur-sm flex items-center gap-1.5 shadow">
            <span>⚙</span>
            <span>{race.name}</span>
          </div>
        )}
      </div>
    );
  }

  // 5. Halflings / Bountiful Shires
  if (raceName.includes('halfling') || raceName.includes('shire') || subraceType.includes('meadow')) {
    return (
      <div className={`relative overflow-hidden rounded-xl border border-yellow-500/40 shadow-lg ${className}`}>
        <svg viewBox="0 0 400 220" className="w-full h-full object-cover select-none" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="halflingSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#bae6fd" />
              <stop offset="100%" stopColor="#fef08a" />
            </linearGradient>
            <linearGradient id="lushHill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
          </defs>

          {/* Radiant Sunlit Sky */}
          <rect width="400" height="220" fill="url(#halflingSky)" />
          <circle cx="330" cy="50" r="28" fill="#fef08a" opacity="0.9" filter="drop-shadow(0 0 10px #fef08a)" />

          {/* Gentle Rolling Hills */}
          <ellipse cx="80" cy="220" rx="160" ry="80" fill="url(#lushHill)" />
          <ellipse cx="320" cy="220" rx="180" ry="90" fill="url(#lushHill)" />
          <ellipse cx="200" cy="240" rx="220" ry="100" fill="#166534" />

          {/* Circular Thatched Burrow Door */}
          <g transform="translate(160, 130)">
            <ellipse cx="40" cy="40" rx="35" ry="30" fill="#713f12" stroke="#ca8a04" strokeWidth="3" />
            <ellipse cx="40" cy="40" rx="27" ry="24" fill="#15803d" />
            <circle cx="58" cy="40" r="3.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
            {/* Stone Path */}
            <ellipse cx="40" cy="72" rx="15" ry="6" fill="#cbd5e1" />
            <ellipse cx="40" cy="82" rx="18" ry="7" fill="#94a3b8" />
          </g>

          {/* Bountiful Wheat & Clover Crest */}
          <g transform="translate(45, 125)">
            <circle cx="35" cy="35" r="26" fill="#15803d" stroke="#facc15" strokeWidth="2" />
            {/* Crossed Golden Wheat Sheaves */}
            <path d="M25,50 Q30,30 45,20" stroke="#facc15" strokeWidth="3" fill="none" />
            <path d="M45,50 Q40,30 25,20" stroke="#facc15" strokeWidth="3" fill="none" />
            <circle cx="45" cy="20" r="3" fill="#fef08a" />
            <circle cx="25" cy="20" r="3" fill="#fef08a" />
          </g>
        </svg>

        {showBadge && (
          <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-yellow-950/80 border border-yellow-400/50 text-[10px] font-serif font-bold text-yellow-200 backdrop-blur-sm flex items-center gap-1.5 shadow">
            <span>🌾</span>
            <span>{race.name}</span>
          </div>
        )}
      </div>
    );
  }

  // 6. Graveborn Revenants & Aberrations / Undead
  if (raceName.includes('revenant') || raceName.includes('undead') || category === 'aberration') {
    return (
      <div className={`relative overflow-hidden rounded-xl border border-purple-500/40 shadow-lg ${className}`}>
        <svg viewBox="0 0 400 220" className="w-full h-full object-cover select-none" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="aberrantVoid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="50%" stopColor="#2e1065" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <radialGradient id="voidMoon" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#581c87" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Void Sky */}
          <rect width="400" height="220" fill="url(#aberrantVoid)" />
          <circle cx="280" cy="65" r="50" fill="url(#voidMoon)" />
          <circle cx="280" cy="65" r="25" fill="#f3e8ff" opacity="0.9" />

          {/* Eerie Whispering Souls / Wisps */}
          <ellipse cx="90" cy="80" rx="10" ry="18" fill="#a855f7" opacity="0.4" filter="blur(3px)" />
          <ellipse cx="160" cy="50" rx="8" ry="14" fill="#38bdf8" opacity="0.35" filter="blur(3px)" />

          {/* Crumbling Ruin Arches & Crypt Pillars */}
          <polygon points="210,220 220,100 235,100 245,220" fill="#0f172a" />
          <polygon points="310,220 320,110 335,110 345,220" fill="#0f172a" />
          <path d="M220,105 Q280,75 335,105" stroke="#334155" strokeWidth="8" fill="none" />

          {/* Obsidian Soul Scythe Crest */}
          <g transform="translate(45, 125)">
            <circle cx="35" cy="35" r="26" fill="#0f172a" stroke="#a855f7" strokeWidth="2.5" />
            <path d="M25,50 L45,20 Q30,15 15,30" stroke="#c084fc" strokeWidth="3" fill="none" />
            <circle cx="35" cy="35" r="4" fill="#a855f7" filter="drop-shadow(0 0 4px #c084fc)" />
          </g>
        </svg>

        {showBadge && (
          <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-400/50 text-[10px] font-serif font-bold text-purple-200 backdrop-blur-sm flex items-center gap-1.5 shadow">
            <span>💀</span>
            <span>{race.name}</span>
          </div>
        )}
      </div>
    );
  }

  // 7. Default / Humans / Versatile Mortal Kingdoms
  return (
    <div className={`relative overflow-hidden rounded-xl border border-blue-500/40 shadow-lg ${className}`}>
      <svg viewBox="0 0 400 220" className="w-full h-full object-cover select-none" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="humanSunrise" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="45%" stopColor="#3b82f6" />
            <stop offset="85%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <linearGradient id="stoneCastle" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>

        {/* Golden Dawn Sky */}
        <rect width="400" height="220" fill="url(#humanSunrise)" />
        <circle cx="280" cy="120" r="45" fill="#fef08a" opacity="0.6" filter="blur(6px)" />

        {/* Distant Mountain Peaks */}
        <polygon points="120,220 220,105 320,220" fill="#1e3a8a" opacity="0.4" />
        <polygon points="260,220 330,120 400,220" fill="#1e3a8a" opacity="0.5" />

        {/* Fortified Human Citadel & Towers */}
        <rect x="150" y="110" width="120" height="110" fill="url(#stoneCastle)" />
        {/* Battlements / Crenellations */}
        <rect x="150" y="98" width="16" height="15" fill="#475569" />
        <rect x="175" y="98" width="16" height="15" fill="#475569" />
        <rect x="202" y="98" width="16" height="15" fill="#475569" />
        <rect x="229" y="98" width="16" height="15" fill="#475569" />
        <rect x="254" y="98" width="16" height="15" fill="#475569" />

        {/* High Watchtower with Blue Royal Banners */}
        <rect x="270" y="70" width="35" height="150" fill="url(#stoneCastle)" />
        <polygon points="265,70 287,35 310,70" fill="#1e3a8a" />
        <line x1="287" y1="35" x2="287" y2="15" stroke="#f59e0b" strokeWidth="2" />
        {/* Fluttering Banner */}
        <path d="M287,17 L315,24 L287,31 Z" fill="#2563eb" />

        {/* City Gate & Portcullis */}
        <path d="M190,220 L190,170 Q210,150 230,170 L230,220 Z" fill="#0f172a" />

        {/* Heroic Lion & Shield Emblem */}
        <g transform="translate(45, 125)">
          <path d="M35,10 L60,22 L55,50 Q35,65 35,65 Q15,65 15,50 L10,22 Z" fill="#1e3a8a" stroke="#fbbf24" strokeWidth="2.5" />
          {/* Heraldic Crown */}
          <polygon points="25,32 28,24 35,28 42,24 45,32" fill="#fbbf24" />
          <rect x="25" y="34" width="20" height="3" fill="#fbbf24" />
          {/* Crossed Sword */}
          <line x1="23" y1="46" x2="47" y2="46" stroke="#fbbf24" strokeWidth="2" />
          <line x1="35" y1="36" x2="35" y2="55" stroke="#e2e8f0" strokeWidth="2.5" />
        </g>
      </svg>

      {showBadge && (
        <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-400/50 text-[10px] font-serif font-bold text-blue-200 backdrop-blur-sm flex items-center gap-1.5 shadow">
          <span>👑</span>
          <span>{race.name}</span>
        </div>
      )}
    </div>
  );
};
