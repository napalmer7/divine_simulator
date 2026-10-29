/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Globe,
  Map,
  Mountain,
  Layers,
  Dna,
  Crown,
  Scroll,
  ChevronRight,
  ChevronLeft,
  X,
  Minimize2,
  Maximize2,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Eye,
  Play,
  Flame,
  Shield,
  Users,
  Compass,
} from 'lucide-react';
import { MapViewMode } from '../types/game';

export interface TutorialStep {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  category: 'core' | 'navigation' | 'powers' | 'overlays' | 'races' | 'pantheon' | 'chronicles';
  description: string;
  bullets: string[];
  proTip: string;
  targetSelector?: string;
  actionButton?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  secondaryActionButton?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
}

interface TutorialWalkthroughProps {
  isActive: boolean;
  onClose: () => void;
  is3DMode: boolean;
  onToggle3DMode: () => void;
  mapViewMode: MapViewMode;
  onSelectMapViewMode: (mode: MapViewMode) => void;
  isPowersDrawerOpen: boolean;
  onTogglePowersDrawer: (open: boolean) => void;
  onOpenRaceModal: () => void;
  onOpenPantheon: () => void;
  onOpenChronicle: () => void;
  onSelectSampleCell: () => void;
  playerPower: number;
}

export const TutorialWalkthrough: React.FC<TutorialWalkthroughProps> = ({
  isActive,
  onClose,
  is3DMode,
  onToggle3DMode,
  mapViewMode,
  onSelectMapViewMode,
  isPowersDrawerOpen,
  onTogglePowersDrawer,
  onOpenRaceModal,
  onOpenPantheon,
  onOpenChronicle,
  onSelectSampleCell,
  playerPower,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  // Steps Curriculum
  const steps: TutorialStep[] = [
    {
      id: 'step_power_turns',
      title: 'Divine Essence & Turn System',
      subtitle: 'The Dawn of Worlds Engine',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      category: 'core',
      description:
        'You are an immortal shaper in the celestial pantheon. Every round, all deities roll 2d6 to receive Divine Power points to sculpt the world.',
      bullets: [
        'Divine Power Meter: Displayed in the top bar with your current roll.',
        'The Thrift Bonus: Save your power! Unspent points carry forward into future rounds with a +1 Thrift Bonus.',
        'Highest Roll Acts First: Turn order dynamically rotates each round based on who rolled the highest divine power.',
        'When finished with your divine acts, click "End Turn" in the top bar to let rival deities take their actions.',
      ],
      proTip:
        'In the First Age of Land, saving points lets you unleash massive regional cascades or continental surges on subsequent turns!',
      targetSelector: '[data-tutorial="power-meter"]',
    },
    {
      id: 'step_world_navigation',
      title: 'Surveying the Mortal Sphere',
      subtitle: '2D Cartographer’s Atlas & 3D Spherical Globe',
      icon: <Globe className="w-5 h-5 text-cyan-400" />,
      category: 'navigation',
      description:
        'Observe your creation through two seamless viewpoints: a tabletop 2D Cartographer’s Atlas and a continuous 3D Spherical Globe.',
      bullets: [
        'Navigation: Drag to pan, scroll wheel or pinch to zoom in/out.',
        'Inspect Cells: Click any hexagonal block to view elevation, biome, coordinates, temperature, and local resources.',
        'Multi-Tile Selection: Hold Shift while clicking adjacent blocks to select clusters for multi-cell divine acts.',
        'Settlement Tooltips: Hovering over cities displays demographic metrics, race illustrations, and the realm’s heraldic coat-of-arms.',
      ],
      proTip:
        'Switch between 2D Atlas and 3D Globe anytime using the top slider without losing your place or active cell selection.',
      targetSelector: '[data-tutorial="view-toggle"]',
      actionButton: {
        label: is3DMode ? 'Switch to 2D Atlas' : 'Switch to 3D Globe',
        icon: is3DMode ? <Map className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />,
        onClick: onToggle3DMode,
      },
      secondaryActionButton: {
        label: 'Inspect Center Cell',
        icon: <Eye className="w-3.5 h-3.5" />,
        onClick: onSelectSampleCell,
      },
    },
    {
      id: 'step_powers_drawer',
      title: 'Shaping Land, Waters & Climate',
      subtitle: 'The Table of Powers & Cascades',
      icon: <Mountain className="w-5 h-5 text-emerald-400" />,
      category: 'powers',
      description:
        'The side drawer holds your primordial shaping powers. In the First Age of Land, terraforming costs are at their lowest (1 Power for land, 2 for climate).',
      bullets: [
        'Three Shaping Scopes: Single Tile (precision), Regional Cascade (3-tile radius), and Continental Surge (7-tile upheaval).',
        'Riparian Hydration: Sinking ocean or carving lakes automatically hydrates adjacent drylands into fertile plains and lush forests.',
        'Similar Terrain Cascades: Elevating hills adjacent to mountains or volcanoes expands existing chains seamlessly.',
        'Natural Wonders: Place sacred World Spires, Leyline Wells, and Ancient Groves to attract special civilizations.',
      ],
      proTip:
        'Carving lakes has a 2-stage option: a 1-step descent for inland lakes, and a deep drop for oceanic trenches!',
      targetSelector: '[data-tutorial="powers-drawer"]',
      actionButton: {
        label: isPowersDrawerOpen ? 'Close Powers Drawer' : 'Open Powers Drawer',
        icon: <Mountain className="w-3.5 h-3.5" />,
        onClick: () => onTogglePowersDrawer(!isPowersDrawerOpen),
      },
    },
    {
      id: 'step_map_overlays',
      title: 'The 7 Geopolitical & Ecological Overlays',
      subtitle: 'Deep Data Visualizations',
      icon: <Layers className="w-5 h-5 text-indigo-400" />,
      category: 'overlays',
      description:
        'The world is a living simulation. The top filter buttons allow you to switch layers and examine ecological, demographic, and geopolitical forces.',
      bullets: [
        'Geography: Physical contours, elevations, and water bodies.',
        'Biomes & Climate: Arid deserts, temperate forests, wetlands, and frozen tundras.',
        'Resources: Veins of gold, iron, obsidian, timber, and arcane mana crystals.',
        'Territories: National borders, kingdom influence, and provincial spheres.',
        'Pop. Density & Trade: Visualizes population clusters and overland/nautical trade lanes.',
        'Conflicts: Highlights disputed border sectors and active military friction.',
      ],
      proTip:
        'Check the Resources overlay before planting sentient species so they can exploit precious ores for technological surges.',
      targetSelector: '[data-tutorial="map-layers"]',
      actionButton: {
        label: mapViewMode === 'climate' ? 'Show Resources' : 'Show Biomes & Climate',
        icon: <Layers className="w-3.5 h-3.5" />,
        onClick: () => onSelectMapViewMode(mapViewMode === 'climate' ? 'resources' : 'climate'),
      },
      secondaryActionButton: {
        label: 'Return to Geography',
        icon: <Map className="w-3.5 h-3.5" />,
        onClick: () => onSelectMapViewMode('physical'),
      },
    },
    {
      id: 'step_race_genesis',
      title: 'Genesis of Sentient Races & Realms',
      subtitle: 'The Second Age of Races',
      icon: <Dna className="w-5 h-5 text-pink-400" />,
      category: 'races',
      description:
        'Awaken mortal and monstrous species into the world. You can customize new lifeforms from scratch or awaken classic fantasy archetypes.',
      bullets: [
        'Genetic Synthesizer: Customize integument/skin, locomotion, sensory vision, cognition, and societal philosophy.',
        'Fantasy & Monster Archetypes: Choose Humans, High Elves, Mountain Dwarves, Orcs, Goblins, or Abyssal Horrors.',
        '✨ 1-Click Cradle Adaptation: Procedurally adapt canon myths to the exact cradle coordinates, biome, and resources!',
        'Realm Name & Coat of Arms: Roll unique civilization names; the world automatically generates unique heraldic crests.',
        'Subrace Mutations: Evolve specialized offshoots (e.g. Sandborne Humans, Frost Elves) directly from parent species.',
      ],
      proTip:
        'A race’s favored biomes dictate where they thrive; settling outside their biomes slows growth and lowers defense.',
      targetSelector: '[data-tutorial="race-button"]',
      actionButton: {
        label: 'Open Race Generator',
        icon: <Dna className="w-3.5 h-3.5" />,
        onClick: onOpenRaceModal,
      },
    },
    {
      id: 'step_pantheon_diplomacy',
      title: 'The Pantheon, Divine Politics & Avatars',
      subtitle: 'Cooperation, Rivalry & Demigods',
      icon: <Crown className="w-5 h-5 text-purple-400" />,
      category: 'pantheon',
      description:
        'You share Meglin with rival deities, each possessing distinct divine domains and personality traits (Aggression, Harmony, Expansion).',
      bullets: [
        'Pantheon Drawer: Inspect all deities, divine relationships, active avatars, and personality scores.',
        'Celestial Diplomacy: Form Sacred Pacts to secure borders, Provoke Rivals, or Bestow Divine Power as tribute (+relations).',
        'Living Avatars: Manifest physical demigods onto mortal soil to lead armies, inspire grand wonders, and conduct sieges.',
        'Catastrophes: Unleash meteors, volcanic eruptions, deluges, or wildfires upon defiant civilizations.',
      ],
      proTip:
        'Forming pacts with harmonious deities prevents them from destroying your civilizations with natural disasters.',
      targetSelector: '[data-tutorial="pantheon-button"]',
      actionButton: {
        label: 'Open Pantheon Drawer',
        icon: <Crown className="w-3.5 h-3.5" />,
        onClick: onOpenPantheon,
      },
    },
    {
      id: 'step_chronicle_epochs',
      title: 'The Great Chronicle & Advancing Ages',
      subtitle: 'Living History & Epochal Shifts',
      icon: <Scroll className="w-5 h-5 text-amber-300" />,
      category: 'chronicles',
      description:
        'Every miracle, mountain raised, race awakened, and war fought is inscribed for eternity in the Great Chronicle of Bede.',
      bullets: [
        'Chronicle of Bede: Filter historical logs by Age, Deity, or category (Creation, Warfare, Miracles, Civ).',
        'Advancing the Ages: After 5 rounds, deities can vote to progress from the Age of Land to the Age of Races, and then to the Age of Relations.',
        'Shifting Table of Powers: As epochs advance, land shaping becomes more expensive while civilization founding and diplomacy become cheaper!',
        'You are now ready to shape Meglin into an enduring legend!',
      ],
      proTip:
        'Review the Chronicle regularly to see how NPC deities responded to your actions behind the scenes.',
      targetSelector: '[data-tutorial="chronicle-button"]',
      actionButton: {
        label: 'Open The Chronicle',
        icon: <Scroll className="w-3.5 h-3.5" />,
        onClick: onOpenChronicle,
      },
    },
  ];

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  // Highlight target element on DOM
  useEffect(() => {
    if (!isActive || !currentStep.targetSelector) return;

    const el = document.querySelector(currentStep.targetSelector);
    if (el) {
      el.classList.add('tutorial-highlight');
      return () => {
        el.classList.remove('tutorial-highlight');
      };
    }
  }, [isActive, currentStepIndex, currentStep.targetSelector]);

  if (!isActive) return null;

  // Minimized Floating Pill
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-slate-950/95 border border-amber-500/60 shadow-2xl shadow-amber-500/20 px-3.5 py-2 rounded-2xl text-xs text-white backdrop-blur-md animate-fade-in">
        <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
          <Sparkles className="w-4 h-4 animate-spin-slow" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-amber-300">Divine Walkthrough</span>
          <span className="text-[10px] text-slate-400">
            Step {currentStepIndex + 1} of {steps.length}: {currentStep.title}
          </span>
        </div>
        <button
          onClick={() => setIsMinimized(false)}
          className="ml-2 p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          title="Expand Divine Guide"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          title="Exit Guide"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-[94vw] sm:w-[420px] max-w-full bg-slate-950/95 border border-indigo-500/50 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.85)] text-slate-100 backdrop-blur-xl flex flex-col overflow-hidden animate-slide-up select-none">
      {/* Golden progress bar */}
      <div className="w-full h-1.5 bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-amber-400 to-yellow-500 transition-all duration-300"
          style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
            {currentStep.icon}
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
              Interactive Guide • Step {currentStepIndex + 1} of {steps.length}
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-white font-serif leading-tight">
              {currentStep.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Minimize Guide to Corner"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Exit Walkthrough"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Step Content */}
      <div className="p-4 space-y-3 max-h-[58vh] overflow-y-auto text-xs">
        <p className="text-slate-300 leading-relaxed text-xs">
          {currentStep.description}
        </p>

        {/* Feature Highlights */}
        <div className="space-y-1.5 bg-slate-900/70 p-3 rounded-xl border border-slate-800">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Core Mechanics
          </div>
          {currentStep.bullets.map((b, idx) => (
            <div key={idx} className="flex items-start gap-2 text-slate-300 text-[11px] leading-relaxed">
              <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
              <span>{b}</span>
            </div>
          ))}
        </div>

        {/* Pro-Tip Box */}
        <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-600/40 text-[11px] text-amber-200/90 leading-relaxed flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300 font-semibold">Divine Counsel: </strong>
            {currentStep.proTip}
          </div>
        </div>

        {/* Interactive Try-It Actions */}
        {(currentStep.actionButton || currentStep.secondaryActionButton) && (
          <div className="pt-1 flex flex-wrap gap-2">
            {currentStep.actionButton && (
              <button
                type="button"
                onClick={currentStep.actionButton.onClick}
                className="flex-1 py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-1.5 text-xs transition shadow-md shadow-indigo-600/20"
              >
                {currentStep.actionButton.icon}
                <span>{currentStep.actionButton.label}</span>
              </button>
            )}
            {currentStep.secondaryActionButton && (
              <button
                type="button"
                onClick={currentStep.secondaryActionButton.onClick}
                className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center justify-center gap-1.5 text-xs transition border border-slate-700"
              >
                {currentStep.secondaryActionButton.icon}
                <span>{currentStep.secondaryActionButton.label}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="px-4 py-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-2">
        <button
          disabled={isFirstStep}
          onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition text-xs font-semibold flex items-center gap-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back
        </button>

        <div className="flex items-center gap-1.5">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStepIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentStepIndex
                  ? 'w-5 bg-amber-400'
                  : 'bg-slate-700 hover:bg-slate-500'
              }`}
              title={`Go to Step ${idx + 1}`}
            />
          ))}
        </div>

        {isLastStep ? (
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold flex items-center gap-1.5 text-xs shadow-md shadow-emerald-600/20 transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Finish Guide
          </button>
        ) : (
          <button
            onClick={() => setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold flex items-center gap-1 text-xs shadow-md shadow-amber-600/20 transition"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Welcome dialog shown on first launch or when starting a new game
 */
interface WelcomeTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTutorial: () => void;
}

export const WelcomeTutorialModal: React.FC<WelcomeTutorialModalProps> = ({
  isOpen,
  onClose,
  onStartTutorial,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-950 border border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.2)] text-slate-100 overflow-hidden flex flex-col">
        {/* Divine Banner */}
        <div className="relative p-6 bg-gradient-to-br from-indigo-950 via-slate-950 to-amber-950/40 border-b border-slate-800 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3 shadow-inner">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-white tracking-wide">
            Welcome to the Dawn of Worlds
          </h2>
          <p className="text-xs text-amber-300 font-mono mt-1">
            Cosmic Genesis & The Pantheon of Meglin
          </p>
        </div>

        {/* Body Description */}
        <div className="p-6 space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            You have awakened as an immortal shaper in the divine pantheon. Guided by the acclaimed rules of <em>Dawn of Worlds</em>, you will wield celestial power to sculpt continents, steer climatic bands, synthesize sentient races, and shape mortal history.
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                <Mountain className="w-3.5 h-3.5 text-emerald-400" />
                Table of Powers
              </div>
              <p className="text-[11px] text-slate-400">
                Raise mountain ranges, sink oceanic trenches, and trigger climatic cascades.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                <Dna className="w-3.5 h-3.5 text-pink-400" />
                Sentient Genesis
              </div>
              <p className="text-[11px] text-slate-400">
                Design genetic traits, adapt canon myths to cradles, and generate realm heraldry.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                <Crown className="w-3.5 h-3.5 text-purple-400" />
                Pantheon Politics
              </div>
              <p className="text-[11px] text-slate-400">
                Forge celestial pacts or provoke rivals across 3 progressive divine ages.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                2D & 3D Cartography
              </div>
              <p className="text-[11px] text-slate-400">
                Inspect 7 thematic overlays across the continuous globe or flat atlas.
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic text-center pt-1">
            Would you like an interactive step-by-step walkthrough of the controls and rules?
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition text-xs"
          >
            Skip (Explore Freely)
          </button>
          <button
            type="button"
            onClick={onStartTutorial}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-bold flex items-center gap-2 shadow-lg shadow-amber-600/30 transition text-xs"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            Begin Divine Walkthrough
          </button>
        </div>
      </div>
    </div>
  );
};
