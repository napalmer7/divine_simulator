/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SavedGameSlot } from '../types/game';

const STORAGE_KEY = 'dawn_of_worlds_saved_games';
const QUICK_SAVE_KEY = 'dawn_of_worlds_quicksave';

export function getAllSaveSlots(): SavedGameSlot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse saved games:', err);
    return [];
  }
}

export function saveGame(slot: Omit<SavedGameSlot, 'id' | 'timestamp' | 'saveDateFormatted'> & { id?: string }): SavedGameSlot {
  const currentSlots = getAllSaveSlots();
  const id = slot.id || `save_${Date.now()}`;
  const now = Date.now();
  const dateFormatted = new Date(now).toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const newRecord: SavedGameSlot = {
    ...slot,
    id,
    timestamp: now,
    saveDateFormatted: dateFormatted,
  };

  const filtered = currentSlots.filter((s) => s.id !== id);
  const updated = [newRecord, ...filtered];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Storage quota exceeded, removing oldest save:', err);
    if (updated.length > 2) {
      updated.pop();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  }

  return newRecord;
}

export function loadGame(slotId: string): SavedGameSlot | null {
  const slots = getAllSaveSlots();
  return slots.find((s) => s.id === slotId) || null;
}

export function deleteSaveSlot(slotId: string): void {
  const slots = getAllSaveSlots();
  const updated = slots.filter((s) => s.id !== slotId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function exportSaveToJSON(slot: SavedGameSlot): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(slot, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `dawn_of_worlds_${slot.saveName.toLowerCase().replace(/\s+/g, '_')}_r${slot.round}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function parseSaveFileJSON(jsonText: string): SavedGameSlot {
  const data = JSON.parse(jsonText);
  if (!data.cells || !data.deities || !data.round) {
    throw new Error('Invalid Dawn of Worlds save file structure');
  }
  return data as SavedGameSlot;
}
