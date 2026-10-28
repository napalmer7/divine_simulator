/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CoatOfArms, ShieldShape, HeraldicDivision, HeraldicCharge } from '../types/game';

interface CoatOfArmsViewProps {
  coatOfArms?: CoatOfArms;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showMotto?: boolean;
  showBlazonTooltip?: boolean;
}

/**
 * Returns SVG path definition for various historical shield shapes
 */
function getShieldPath(shape: ShieldShape): string {
  switch (shape) {
    case 'heater':
      // Classic triangular-rounded medieval heater shield
      return 'M 10,6 C 45,6 75,6 90,6 C 90,45 80,82 50,96 C 20,82 10,45 10,6 Z';
    case 'classic':
      // Straight top with semi-circular base
      return 'M 10,6 L 90,6 L 90,55 C 90,78 72,96 50,96 C 28,96 10,78 10,55 Z';
    case 'gothic':
      // Pointed ogival top and sharp pointed tip
      return 'M 10,14 C 28,6 50,6 50,6 C 50,6 72,6 90,14 L 90,52 C 90,78 68,92 50,98 C 32,92 10,78 10,52 Z';
    case 'notched':
      // Tournament shield with spear notch on the right
      return 'M 10,6 L 70,6 C 70,14 78,18 88,18 L 90,18 L 90,58 C 90,78 72,94 50,97 C 28,94 10,78 10,58 Z';
    case 'kite':
      // Norman elongated kite shield
      return 'M 10,12 C 30,6 70,6 90,12 C 90,40 76,75 50,98 C 24,75 10,40 10,12 Z';
    case 'round':
      // Celtic / Viking circular buckler/targe
      return 'M 50,6 A 44,44 0 1,1 49.9,6 Z';
    default:
      return 'M 10,6 C 45,6 75,6 90,6 C 90,45 80,82 50,96 C 20,82 10,45 10,6 Z';
  }
}

/**
 * Render field divisions (pale, fess, bend, quarterly, etc.) inside the shield clip
 */
function renderDivision(division: HeraldicDivision, primary: string, secondary: string) {
  switch (division) {
    case 'pale':
      // Vertically divided
      return (
        <g>
          <rect x="0" y="0" width="50" height="100" fill={primary} />
          <rect x="50" y="0" width="50" height="100" fill={secondary} />
        </g>
      );
    case 'fess':
      // Horizontally divided
      return (
        <g>
          <rect x="0" y="0" width="100" height="50" fill={primary} />
          <rect x="0" y="50" width="100" height="50" fill={secondary} />
        </g>
      );
    case 'bend':
      // Diagonal division from top-left to bottom-right
      return (
        <g>
          <polygon points="0,0 100,0 0,100" fill={primary} />
          <polygon points="100,0 100,100 0,100" fill={secondary} />
        </g>
      );
    case 'quarterly':
      // Four quadrants
      return (
        <g>
          <rect x="0" y="0" width="50" height="50" fill={primary} />
          <rect x="50" y="0" width="50" height="50" fill={secondary} />
          <rect x="0" y="50" width="50" height="50" fill={secondary} />
          <rect x="50" y="50" width="50" height="50" fill={primary} />
        </g>
      );
    case 'chevron':
      // V-shaped inverted peak
      return (
        <g>
          <rect x="0" y="0" width="100" height="100" fill={primary} />
          <polygon points="0,75 50,30 100,75 100,100 0,100" fill={secondary} />
        </g>
      );
    case 'saltire':
      // Diagonal cross
      return (
        <g>
          <polygon points="0,0 100,100 0,100" fill={primary} />
          <polygon points="0,0 100,0 100,100" fill={secondary} />
          <polygon points="0,0 50,50 0,100" fill={primary} />
          <polygon points="100,0 50,50 100,100" fill={primary} />
        </g>
      );
    case 'solid':
    default:
      return <rect x="0" y="0" width="100" height="100" fill={primary} />;
  }
}

/**
 * Render heraldic charge symbols centered on the shield
 */
function renderCharge(charge: HeraldicCharge, metalColor: string) {
  const isGold = metalColor.includes('f5') || metalColor.includes('fb');
  const strokeColor = isGold ? '#78350f' : '#334155';
  const highlightColor = isGold ? '#fef08a' : '#ffffff';

  switch (charge) {
    case 'lion':
      return (
        <g transform="translate(30, 22) scale(0.4)" fill={metalColor} stroke={strokeColor} strokeWidth="1.5">
          {/* Stylized Heraldic Lion Rampant */}
          <path d="M 50,15 C 55,10 65,12 68,18 C 72,15 78,16 78,22 C 72,24 70,30 68,35 C 75,32 82,34 85,38 C 80,42 75,42 68,42 C 72,48 78,54 84,55 C 80,58 74,56 68,52 C 65,65 62,75 50,85 C 55,88 62,90 65,95 C 58,96 52,94 48,88 C 42,92 38,96 32,98 C 34,92 38,86 42,82 C 35,82 28,80 25,75 C 30,74 36,75 42,76 C 45,68 46,58 45,48 C 38,50 32,55 25,60 C 28,54 34,48 42,45 C 38,38 36,30 40,22 C 45,22 48,25 50,30 Z" />
          <circle cx="62" cy="20" r="2.5" fill={strokeColor} />
          <path d="M 68,26 L 76,28 L 70,32 Z" fill="#ef4444" stroke="none" />
        </g>
      );

    case 'dragon':
      return (
        <g transform="translate(28, 20) scale(0.44)" fill={metalColor} stroke={strokeColor} strokeWidth="1.5">
          {/* Stylized Heraldic Wyrm / Dragon */}
          <path d="M 45,15 C 55,8 68,12 72,20 C 78,18 85,22 88,30 C 82,32 75,30 70,32 C 80,38 88,48 92,60 C 82,54 75,48 68,48 C 72,60 68,75 55,88 C 62,90 70,92 72,98 C 62,96 55,92 50,85 C 42,90 35,95 28,98 C 32,90 38,82 42,75 C 35,74 25,72 20,65 C 28,64 36,66 42,68 C 42,55 38,45 32,38 C 22,44 14,52 8,62 C 12,50 22,40 32,32 C 34,24 38,18 45,15 Z" />
          <circle cx="68" cy="22" r="2.5" fill={highlightColor} />
          <path d="M 72,25 L 82,24" stroke="#ef4444" strokeWidth="2" />
        </g>
      );

    case 'sacred_tree':
      return (
        <g transform="translate(26, 20) scale(0.48)" fill={metalColor} stroke={strokeColor} strokeWidth="1.5">
          {/* Tree of Life Eradicated */}
          <path d="M 50,10 C 65,10 78,22 75,38 C 88,42 94,55 88,68 C 82,78 70,80 60,78 L 62,95 L 72,98 L 62,96 L 50,92 L 38,96 L 28,98 L 38,95 L 40,78 C 30,80 18,78 12,68 C 6,55 12,42 25,38 C 22,22 35,10 50,10 Z" />
          <path d="M 50,75 L 50,30 M 50,45 L 35,35 M 50,55 L 65,42 M 50,65 L 32,55" stroke={strokeColor} strokeWidth="2.5" fill="none" />
        </g>
      );

    case 'crown':
      return (
        <g transform="translate(25, 26) scale(0.5)" fill={metalColor} stroke={strokeColor} strokeWidth="1.5">
          {/* Sovereign Celestial Crown */}
          <path d="M 15,65 L 20,25 L 38,45 L 50,15 L 62,45 L 80,25 L 85,65 Z" />
          <rect x="15" y="65" width="70" height="12" rx="2" fill={metalColor} stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="20" cy="24" r="3" fill={highlightColor} />
          <circle cx="50" cy="14" r="4" fill={highlightColor} />
          <circle cx="80" cy="24" r="3" fill={highlightColor} />
          <circle cx="32" cy="71" r="2.5" fill="#ef4444" />
          <circle cx="50" cy="71" r="3" fill="#3b82f6" />
          <circle cx="68" cy="71" r="2.5" fill="#10b981" />
        </g>
      );

    case 'eagle':
      return (
        <g transform="translate(25, 22) scale(0.5)" fill={metalColor} stroke={strokeColor} strokeWidth="1.5">
          {/* Imperial Eagle Displayed */}
          <path d="M 50,12 C 55,12 60,16 62,22 L 75,20 L 68,26 L 85,25 L 72,35 L 92,42 L 70,50 L 88,60 L 65,65 L 68,78 L 58,74 L 56,88 L 50,82 L 44,88 L 42,74 L 32,78 L 35,65 L 12,60 L 30,50 L 8,42 L 28,35 L 15,25 L 32,26 L 25,20 L 38,22 C 40,16 45,12 50,12 Z" />
          <circle cx="56" cy="18" r="2" fill={strokeColor} />
        </g>
      );

    case 'anvil':
      return (
        <g transform="translate(25, 24) scale(0.5)" fill={metalColor} stroke={strokeColor} strokeWidth="1.5">
          {/* Anvil & Crossed Hammers */}
          <path d="M 20,40 L 80,40 C 88,40 94,46 95,50 L 78,55 L 70,55 C 65,65 65,72 75,80 L 25,80 C 35,72 35,65 30,55 L 10,48 C 10,42 14,40 20,40 Z" />
          {/* Crossed war hammers saltirewise */}
          <path d="M 25,20 L 75,70 M 28,15 L 18,25 M 75,20 L 25,70 M 72,15 L 82,25" stroke={strokeColor} strokeWidth="3" fill="none" />
        </g>
      );

    case 'sunburst':
      return (
        <g transform="translate(28, 22) scale(0.44)" fill={metalColor} stroke={strokeColor} strokeWidth="1.5">
          {/* Radiant Solar Sunburst */}
          <circle cx="50" cy="50" r="16" fill={metalColor} />
          <circle cx="50" cy="50" r="12" fill={highlightColor} stroke="none" />
          <path d="M 50,10 L 50,26 M 50,74 L 50,90 M 10,50 L 26,50 M 74,50 L 90,50 M 22,22 L 34,34 M 66,66 L 78,78 M 78,22 L 66,34 M 34,66 L 22,78" stroke={metalColor} strokeWidth="4" strokeLinecap="round" />
        </g>
      );

    case 'twin_axes':
      return (
        <g transform="translate(25, 22) scale(0.5)" stroke={strokeColor} strokeWidth="2" fill={metalColor}>
          {/* Crossed Battleaxes */}
          <line x1="20" y1="20" x2="80" y2="80" stroke={strokeColor} strokeWidth="4" />
          <path d="M 15,10 C 28,15 32,28 20,38 C 22,28 15,22 10,25 Z" fill={metalColor} />
          <line x1="80" y1="20" x2="20" y2="80" stroke={strokeColor} strokeWidth="4" />
          <path d="M 85,10 C 72,15 68,28 80,38 C 78,28 85,22 90,25 Z" fill={metalColor} />
        </g>
      );

    case 'serpent':
      return (
        <g transform="translate(30, 20) scale(0.4)" fill="none" stroke={metalColor} strokeWidth="7" strokeLinecap="round">
          {/* Coiled Serpent */}
          <path d="M 50,18 C 65,18 72,28 65,40 C 58,52 38,48 35,62 C 32,76 48,85 62,82 C 72,80 75,70 68,65" />
          <circle cx="48" cy="18" r="4" fill={metalColor} stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="46" cy="17" r="1.5" fill="#ef4444" />
        </g>
      );

    case 'chalice':
      return (
        <g transform="translate(30, 22) scale(0.4)" fill={metalColor} stroke={strokeColor} strokeWidth="1.5">
          {/* Holy Consecrated Chalice */}
          <path d="M 25,20 C 25,48 42,60 46,65 L 46,80 L 32,88 L 68,88 L 54,80 L 54,65 C 58,60 75,48 75,20 Z" />
          <ellipse cx="50" cy="20" rx="25" ry="6" fill={highlightColor} stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="50" cy="40" r="4" fill="#3b82f6" />
        </g>
      );

    case 'tower':
      return (
        <g transform="translate(28, 22) scale(0.44)" fill={metalColor} stroke={strokeColor} strokeWidth="1.5">
          {/* Citadel Keep Tower */}
          <path d="M 25,85 L 30,30 L 22,30 L 22,18 L 32,18 L 32,24 L 44,24 L 44,18 L 56,18 L 56,24 L 68,24 L 68,18 L 78,18 L 78,30 L 70,30 L 75,85 Z" />
          <rect x="44" y="60" width="12" height="25" rx="6" fill={strokeColor} />
          <rect x="46" y="38" width="8" height="12" rx="4" fill={strokeColor} />
        </g>
      );

    case 'griffin':
      return (
        <g transform="translate(28, 20) scale(0.44)" fill={metalColor} stroke={strokeColor} strokeWidth="1.5">
          {/* Mythic Griffin Rampant */}
          <path d="M 50,15 C 58,10 68,14 70,22 C 78,18 84,24 82,32 C 75,34 70,32 68,36 C 78,42 86,52 90,65 C 80,58 72,52 68,52 C 68,65 65,75 52,85 C 58,88 65,90 68,95 C 58,96 52,94 48,88 C 42,92 38,96 30,98 C 34,90 38,84 42,78 C 35,76 26,74 22,68 C 30,66 38,68 44,70 C 44,58 40,48 35,42 C 25,48 18,55 12,65 C 16,52 26,42 36,35 C 38,26 42,18 50,15 Z" />
          <circle cx="66" cy="22" r="2.5" fill={highlightColor} />
        </g>
      );

    case 'wolf':
      return (
        <g transform="translate(28, 22) scale(0.44)" fill={metalColor} stroke={strokeColor} strokeWidth="1.5">
          {/* Dire Wolf Statant */}
          <path d="M 75,25 C 72,15 62,20 58,26 C 52,24 45,28 40,35 C 32,32 24,35 20,42 C 26,44 32,45 38,48 C 35,58 32,70 30,85 C 34,88 40,88 42,82 C 45,72 48,65 52,65 C 58,72 62,82 68,85 C 72,82 74,74 72,68 C 78,62 82,54 85,42 C 80,45 74,45 70,42 C 75,36 78,30 75,25 Z" />
          <circle cx="62" cy="28" r="2" fill="#ef4444" />
        </g>
      );

    case 'stag':
      return (
        <g transform="translate(28, 20) scale(0.44)" fill={metalColor} stroke={strokeColor} strokeWidth="1.5">
          {/* Noble Stag with Antlers */}
          <path d="M 50,42 C 55,42 60,46 62,54 L 62,85 L 56,85 L 56,65 L 44,65 L 44,85 L 38,85 L 38,54 C 40,46 45,42 50,42 Z" />
          {/* Broad Antlers */}
          <path d="M 50,42 L 50,30 M 50,30 L 68,14 M 68,14 L 75,8 M 68,14 L 74,20 M 60,22 L 68,26 M 50,30 L 32,14 M 32,14 L 25,8 M 32,14 L 26,20 M 40,22 L 32,26" stroke={metalColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      );

    case 'flame':
      return (
        <g transform="translate(28, 20) scale(0.44)" fill={metalColor} stroke={strokeColor} strokeWidth="1.5">
          {/* Sacred Primordial Flame */}
          <path d="M 50,10 C 60,25 75,38 75,55 C 75,72 62,85 50,85 C 38,85 25,72 25,55 C 25,38 40,25 50,10 Z" />
          <path d="M 50,32 C 56,42 64,50 64,62 C 64,72 58,78 50,78 C 42,78 36,72 36,62 C 36,50 44,42 50,32 Z" fill="#ef4444" stroke="none" />
          <path d="M 50,50 C 53,56 56,62 56,68 C 56,74 53,76 50,76 C 47,76 44,74 44,68 C 44,62 47,56 50,50 Z" fill={highlightColor} stroke="none" />
        </g>
      );

    case 'crescent':
    default:
      return (
        <g transform="translate(28, 22) scale(0.44)" fill={metalColor} stroke={strokeColor} strokeWidth="1.5">
          {/* Increscent Moon */}
          <path d="M 60,18 C 42,22 30,38 32,58 C 34,75 48,88 65,88 C 52,82 45,70 45,55 C 45,38 52,26 60,18 Z" />
          <circle cx="68" cy="38" r="3" fill={highlightColor} stroke="none" />
          <circle cx="72" cy="62" r="2" fill={highlightColor} stroke="none" />
        </g>
      );
  }
}

export const CoatOfArmsView: React.FC<CoatOfArmsViewProps> = ({
  coatOfArms,
  size = 'md',
  className = '',
  showMotto = false,
  showBlazonTooltip = true,
}) => {
  if (!coatOfArms) {
    return null;
  }

  const { shieldShape, division, primaryColor, secondaryColor, metalColor, charge, motto, blazon } = coatOfArms;

  // Size styling presets
  const sizeMap = {
    xs: { w: 'w-6', h: 'h-7', text: 'text-[9px]' },
    sm: { w: 'w-8', h: 'h-9', text: 'text-[10px]' },
    md: { w: 'w-12', h: 'h-14', text: 'text-xs' },
    lg: { w: 'w-20', h: 'h-24', text: 'text-sm' },
    xl: { w: 'w-28', h: 'h-32', text: 'text-base' },
  };

  const selectedSize = sizeMap[size] || sizeMap.md;
  const clipId = `shield_clip_${Math.abs(shieldShape.length + division.length + charge.length)}_${metalColor.replace(/[^a-z0-9]/gi, '')}`;
  const shieldPath = getShieldPath(shieldShape);

  const isGold = metalColor.includes('f5') || metalColor.includes('fb');
  const borderGradientId = `metal_border_${clipId}`;

  return (
    <div
      className={`inline-flex flex-col items-center select-none ${className}`}
      title={showBlazonTooltip ? `Coat of Arms: ${blazon}\nMotto: "${motto}"` : undefined}
    >
      <div className={`relative ${selectedSize.w} ${selectedSize.h} filter drop-shadow-md`}>
        <svg viewBox="0 0 100 105" className="w-full h-full overflow-visible">
          <defs>
            {/* Shield Outline Clip Path */}
            <clipPath id={clipId}>
              <path d={shieldPath} />
            </clipPath>

            {/* Metallic Gold / Silver Border Gradient */}
            <linearGradient id={borderGradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={isGold ? '#fef08a' : '#ffffff'} />
              <stop offset="35%" stopColor={metalColor} />
              <stop offset="70%" stopColor={isGold ? '#b45309' : '#94a3b8'} />
              <stop offset="100%" stopColor={isGold ? '#78350f' : '#475569'} />
            </linearGradient>

            {/* Subtle Inner Volumetric Convex Shading */}
            <radialGradient id={`shield_depth_${clipId}`} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="65%" stopColor="#000000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.45" />
            </radialGradient>
          </defs>

          {/* 1. Shield Background with Field Division */}
          <g clipPath={`url(#${clipId})`}>
            {renderDivision(division, primaryColor, secondaryColor)}
            {/* Volumetric Depth Overlay */}
            <rect x="0" y="0" width="100" height="100" fill={`url(#shield_depth_${clipId})`} />
            {/* 2. Central Heraldic Charge */}
            {renderCharge(charge, metalColor)}
          </g>

          {/* 3. Metallic Outer Border Trim & Crest Rivets */}
          <path
            d={shieldPath}
            fill="none"
            stroke={`url(#${borderGradientId})`}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Inner Accent Inset Line */}
          <path
            d={shieldPath}
            fill="none"
            stroke={isGold ? '#78350f' : '#1e293b'}
            strokeWidth="0.8"
            opacity="0.75"
          />
        </svg>
      </div>

      {/* Optional Motto Ribbon Banner */}
      {showMotto && (
        <div className="mt-1 px-2 py-0.5 rounded bg-amber-950/90 border border-amber-600/50 text-[10px] text-amber-200 font-serif italic tracking-wider text-center max-w-[160px] truncate shadow">
          "{motto}"
        </div>
      )}
    </div>
  );
};
