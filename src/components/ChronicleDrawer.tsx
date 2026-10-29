/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HistoryLogEntry } from '../types/game';
import { generateMythicChronicle, generateMythicChronicleStream } from '../services/geminiStoryteller';
import { BookOpen, X, Download, Copy, Sparkles, Filter, Check } from 'lucide-react';

interface ChronicleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryLogEntry[];
}

export const ChronicleDrawer: React.FC<ChronicleDrawerProps> = ({
  isOpen,
  onClose,
  history,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'saga'>('timeline');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sagaText, setSagaText] = useState<string | null>(null);
  const [isGeneratingSaga, setIsGeneratingSaga] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const filteredHistory = filterCategory === 'all'
    ? history
    : history.filter((h) => h.category === filterCategory);

  const handleGenerateSaga = async () => {
    setIsGeneratingSaga(true);
    setActiveTab('saga');
    setSagaText('');
    const text = await generateMythicChronicleStream(history, (chunk) => {
      setSagaText((prev) => (prev ? prev + chunk : chunk));
    });
    setSagaText(text);
    setIsGeneratingSaga(false);
  };

  const handleCopyHistory = () => {
    const markdown = history
      .map(
        (h) =>
          `### [Round ${h.round} • Year ${h.year}] ${h.title}\n**Deity:** ${h.deityName} (${h.actionType})\n${h.description}\n*Impact:* ${h.impact}\n`
      )
      .join('\n---\n\n');

    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-slate-950/95 border-l border-slate-800 shadow-2xl backdrop-blur-md flex flex-col text-slate-100 animate-slide-left">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-serif text-amber-200 tracking-wide">
              The Venerable Bede Chronicles
            </h2>
            <p className="text-xs text-slate-400">
              Dawn of Worlds History Log • {history.length} Recorded Epochs
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyHistory}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 text-xs px-2.5"
            title="Copy entire history as Markdown for worldbuilding notes"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Export'}</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation & Scribe Button */}
      <div className="flex items-center justify-between border-b border-slate-800 px-6 py-2.5 bg-slate-900/40 text-xs">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'timeline'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Timeline Log
          </button>
          <button
            onClick={() => setActiveTab('saga')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'saga'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mythic Prose Saga
          </button>
        </div>

        <button
          onClick={handleGenerateSaga}
          disabled={isGeneratingSaga}
          className="px-3 py-1.5 rounded-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center gap-1.5 shadow transition disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          {isGeneratingSaga ? 'Scribing Saga...' : 'Scribe Mythic Saga'}
        </button>
      </div>

      {/* Filter Bar (if timeline tab) */}
      {activeTab === 'timeline' && (
        <div className="px-6 py-2 border-b border-slate-800/80 bg-slate-950/60 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-500 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {['all', 'creation', 'life', 'civilization', 'conflict', 'miracle', 'avatar'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2 py-0.5 rounded capitalize transition ${
                filterCategory === cat
                  ? 'bg-slate-700 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
        {activeTab === 'saga' ? (
          <div className="prose prose-invert max-w-none space-y-4">
            {sagaText ? (
              <div className="p-5 rounded-2xl bg-[#1c1917] border border-amber-900/50 text-amber-100 font-serif leading-relaxed whitespace-pre-line shadow-inner">
                {sagaText}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 space-y-3">
                <BookOpen className="w-10 h-10 mx-auto text-slate-600" />
                <p>Click "Scribe Mythic Saga" above to compile the deeds of the Immortals into an epic chronicle.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="relative border-l border-slate-800 ml-3 space-y-6">
            {filteredHistory.map((entry) => (
              <div key={entry.id} className="relative pl-6">
                {/* Timeline node */}
                <span
                  className="absolute -left-1.5 top-1 w-3 h-3 rounded-full border-2 border-slate-950 shadow"
                  style={{ backgroundColor: entry.deityColor }}
                />

                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span
                      className="font-bold text-xs uppercase tracking-wider"
                      style={{ color: entry.deityColor }}
                    >
                      {entry.deityName} • {entry.actionType}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      R{entry.round} • Yr {entry.year.toLocaleString()}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white font-serif">{entry.title}</h4>
                  <p className="text-slate-300 leading-relaxed">{entry.description}</p>

                  <div className="pt-1.5 border-t border-slate-800/80 text-[11px] text-amber-300/90 font-medium">
                    ✦ {entry.impact}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
