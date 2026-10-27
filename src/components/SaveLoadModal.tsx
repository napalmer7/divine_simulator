/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SavedGameSlot } from '../types/game';
import {
  getAllSaveSlots,
  saveGame,
  deleteSaveSlot,
  exportSaveToJSON,
  parseSaveFileJSON,
} from '../simulation/saveManager';
import {
  X,
  Save,
  FolderOpen,
  Download,
  Upload,
  Trash2,
  Sparkles,
  Clock,
  Calendar,
  Crown,
  Globe,
  Check,
} from 'lucide-react';

interface SaveLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGameState: Omit<SavedGameSlot, 'id' | 'saveName' | 'timestamp' | 'saveDateFormatted'>;
  onLoadGame: (savedSlot: SavedGameSlot) => void;
}

export const SaveLoadModal: React.FC<SaveLoadModalProps> = ({
  isOpen,
  onClose,
  currentGameState,
  onLoadGame,
}) => {
  const [activeTab, setActiveTab] = useState<'save' | 'load'>('load');
  const [saveName, setSaveName] = useState(
    `Genesis of ${currentGameState.playerDeityName} - Round ${currentGameState.round}`
  );
  const [savedSlots, setSavedSlots] = useState<SavedGameSlot[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const refreshSlots = () => {
    setSavedSlots(getAllSaveSlots());
  };

  useEffect(() => {
    if (isOpen) {
      refreshSlots();
      setSaveName(
        `Genesis of ${currentGameState.playerDeityName} - Round ${currentGameState.round}`
      );
      setFeedbackMsg(null);
    }
  }, [isOpen, currentGameState]);

  if (!isOpen) return null;

  const handleSaveCurrent = () => {
    if (!saveName.trim()) return;

    saveGame({
      saveName: saveName.trim(),
      ...currentGameState,
    });

    refreshSlots();
    setFeedbackMsg('World progress saved successfully!');
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this save slot?')) {
      deleteSaveSlot(id);
      refreshSlots();
    }
  };

  const handleExport = (slot: SavedGameSlot, e: React.MouseEvent) => {
    e.stopPropagation();
    exportSaveToJSON(slot);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const importedSlot = parseSaveFileJSON(text);
        saveGame(importedSlot);
        refreshSlots();
        setFeedbackMsg(`Imported "${importedSlot.saveName}" successfully!`);
        setTimeout(() => setFeedbackMsg(null), 3000);
      } catch (err) {
        alert('Failed to import save file. Invalid or corrupted JSON structure.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Save className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-white tracking-wide">
                Chronicles Archive (Save & Load)
              </h2>
              <p className="text-xs text-slate-400">
                Preserve world state, map topography, deity memories & history logs
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

        {/* Tab Controls & File Import */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 bg-slate-900/60">
          <div className="flex">
            <button
              onClick={() => setActiveTab('load')}
              className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'load'
                  ? 'border-amber-500 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" /> Load Saved World ({savedSlots.length})
            </button>
            <button
              onClick={() => setActiveTab('save')}
              className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'save'
                  ? 'border-amber-500 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Save className="w-3.5 h-3.5" /> Save Current World
            </button>
          </div>

          <label className="cursor-pointer text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-700/50 transition">
            <Upload className="w-3.5 h-3.5" /> Import .json Save
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className="mx-6 mt-3 px-4 py-2 rounded-xl bg-emerald-950/70 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" /> {feedbackMsg}
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === 'save' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <label className="block text-slate-300 font-semibold text-xs">
                  Save Slot Name
                </label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium outline-none focus:border-amber-500"
                  placeholder="e.g. My World - Age of Life"
                />
                <div className="text-[11px] text-slate-400 flex flex-wrap gap-4 pt-1">
                  <span>Player Deity: <strong className="text-white">{currentGameState.playerDeityName}</strong></span>
                  <span>Age: <strong className="text-amber-300 capitalize">{currentGameState.age.replace(/_/g, ' ')}</strong></span>
                  <span>Round: <strong className="text-white">{currentGameState.round}</strong></span>
                  <span>Year: <strong className="text-white">{currentGameState.year}</strong></span>
                  <span>Deities: <strong className="text-white">{currentGameState.deityCount}</strong></span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleSaveCurrent}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold flex items-center gap-2 shadow-lg transition"
                >
                  <Save className="w-4 h-4" /> Save Game Now
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {savedSlots.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Save className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="font-semibold text-slate-300">No saved worlds found.</p>
                  <p className="text-xs text-slate-500">
                    Switch to the "Save Current World" tab or import an external JSON save file to preserve your progress.
                  </p>
                </div>
              ) : (
                savedSlots.map((slot) => (
                  <div
                    key={slot.id}
                    onClick={() => {
                      onLoadGame(slot);
                      onClose();
                    }}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-amber-500/70 hover:bg-slate-900 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm group-hover:text-amber-300 transition">
                          {slot.saveName}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950/60 text-amber-300 border border-amber-600/40 font-mono">
                          Round {slot.round} • Year {slot.year}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Crown className="w-3 h-3 text-indigo-400" /> {slot.playerDeityName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-cyan-400" /> {slot.worldStructure || 'continental'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" /> {slot.saveDateFormatted}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={(e) => handleExport(slot, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="Download JSON Backup"
                      >
                        <Download className="w-4 h-4 text-cyan-400" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(slot.id, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                        title="Delete Save Slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onLoadGame(slot);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-600/30 group-hover:bg-amber-600 border border-amber-500/50 group-hover:text-slate-950 text-amber-200 font-semibold transition flex items-center gap-1"
                      >
                        <FolderOpen className="w-3.5 h-3.5" /> Load
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
