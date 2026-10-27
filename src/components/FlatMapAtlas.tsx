/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { City, Civilization, MapViewMode, WorldCell } from '../types/game';
import { GRID_COLS, GRID_ROWS } from '../simulation/worldGrid';

interface FlatMapAtlasProps {
  cells: WorldCell[];
  cities: City[];
  civilizations: Civilization[];
  selectedCellIndex: number | null;
  onSelectCell: (cellIndex: number) => void;
  viewMode: MapViewMode;
}

export const FlatMapAtlas: React.FC<FlatMapAtlasProps> = ({
  cells,
  cities,
  civilizations,
  selectedCellIndex,
  onSelectCell,
  viewMode,
}) => {
  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-slate-950 overflow-auto">
      <div className="relative border border-amber-900/60 rounded-xl p-3 bg-[#1e1c18] shadow-2xl max-w-5xl w-full">
        {/* Parchment Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-800/40 text-amber-200">
          <div className="text-sm font-serif font-bold tracking-wider uppercase">
            Cartographer's Table: Dawn of Worlds Cylindrical Projection
          </div>
          <div className="text-xs text-amber-300/70 font-mono">
            {GRID_ROWS} Latitudinal Bands × {GRID_COLS} Meridians
          </div>
        </div>

        {/* The Grid Canvas */}
        <div
          className="grid gap-[1px] bg-amber-950/40 rounded overflow-hidden select-none"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
            aspectRatio: '2 / 1',
          }}
        >
          {cells.map((cell) => {
            const isSelected = selectedCellIndex === cell.index;
            const city = cell.cityId ? cities.find((c) => c.id === cell.cityId) : null;
            const civ = cell.civilizationId ? civilizations.find((cv) => cv.id === cell.civilizationId) : null;

            let bgColor = '#0f172a';
            if (viewMode === 'physical') {
              if (cell.terrain === 'deep_ocean') bgColor = '#082f49';
              else if (cell.terrain === 'ocean') bgColor = '#0369a1';
              else if (cell.terrain === 'shallow_water') bgColor = '#38bdf8';
              else if (cell.terrain === 'mountains') bgColor = '#57534e';
              else if (cell.terrain === 'hills') bgColor = '#78716c';
              else if (cell.terrain === 'forest') bgColor = '#15803d';
              else if (cell.terrain === 'desert') bgColor = '#b45309';
              else if (cell.terrain === 'tundra') bgColor = '#94a3b8';
              else if (cell.terrain === 'swamp') bgColor = '#3f6212';
              else if (cell.terrain === 'volcanic') bgColor = '#991b1b';
              else bgColor = '#22c55e';
            } else if (viewMode === 'political' && civ) {
              bgColor = civ.color;
            } else if (viewMode === 'climate') {
              if (cell.climate === 'arctic') bgColor = '#93c5fd';
              else if (cell.climate === 'cold') bgColor = '#67e8f9';
              else if (cell.climate === 'temperate') bgColor = '#22c55e';
              else if (cell.climate === 'arid') bgColor = '#d97706';
              else if (cell.climate === 'tropical') bgColor = '#15803d';
              else bgColor = '#ef4444';
            } else {
              if (cell.elevation <= 0) bgColor = '#0369a1';
              else bgColor = cell.population > 100 ? '#eab308' : '#334155';
            }

            return (
              <button
                key={cell.index}
                onClick={() => onSelectCell(cell.index)}
                style={{ backgroundColor: bgColor }}
                className={`relative group transition-transform duration-75 flex items-center justify-center ${
                  isSelected ? 'ring-2 ring-amber-400 z-10 scale-125 shadow-lg' : 'hover:opacity-90'
                }`}
                title={`[${cell.lat.toFixed(0)}°, ${cell.lon.toFixed(0)}°] ${cell.terrain}${
                  city ? ` - City: ${city.name}` : ''
                }`}
              >
                {city && <span className="text-[9px] drop-shadow">🏛</span>}
                {cell.resource && !city && cell.elevation > 0 && (
                  <span className="w-1 h-1 rounded-full bg-amber-300"></span>
                )}
                {cell.miracleAura && (
                  <span
                    className="absolute inset-0 border border-purple-400/80 rounded"
                    style={{ borderColor: cell.miracleAura.color }}
                  ></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 pt-3 text-xs text-amber-200/80">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#0369a1] inline-block border border-slate-700"></span> Ocean
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#22c55e] inline-block border border-slate-700"></span> Plains
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#15803d] inline-block border border-slate-700"></span> Forest
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#57534e] inline-block border border-slate-700"></span> Mountain
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#b45309] inline-block border border-slate-700"></span> Desert
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#991b1b] inline-block border border-slate-700"></span> Volcanic
          </div>
          <div className="flex items-center gap-1.5 text-amber-300">🏛 Settlement</div>
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">• Resource Node</div>
        </div>
      </div>
    </div>
  );
};
