/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import { HistoryLogEntry } from '../types/game';

/**
 * Generates an epic mythological chronicler saga using Gemini 2.5 Flash
 * or falls back gracefully to a procedural mythic chronicle format if key is absent.
 */
export async function generateMythicChronicle(
  history: HistoryLogEntry[],
  worldName: string = 'Meglin'
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are the Venerable Bede, an ancient chronicler transcribing the sacred mythological history of the fantasy world of "${worldName}".
Here is the recorded timeline of divine actions and mortal events by the gods (Dawn of Worlds game):
${JSON.stringify(
  history.slice(-15).map((h) => ({
    age: h.age,
    round: h.round,
    deity: h.deityName,
    action: h.actionType,
    title: h.title,
    impact: h.impact,
  })),
  null,
  2
)}

Write a stirring, epic mythological saga in 3-4 vivid paragraphs in the tone of The Silmarillion or an ancient Norse/Homeric Edda, detailing the creation of the lands, the awakening of races, the rivalries of the deities, and the grand destiny of the world.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn('Gemini chronicle generation fallback:', err);
    }
  }

  // Fallback procedural mythic saga
  return `# The Great Saga of ${worldName}
*Recorded by the Venerable Bede, Chronicler of the Immortals*

In the First Dawn, when the cosmos was yet barren stone and primeval sea, the Immortals cast their divine gaze upon the firmament. Continental spires of granite and volcanic crags were hurled into the ether, while whispering forests took root under celestial rainfall.

Then dawned the Awakening of Mortal Kind. Diverse lineages arose from the soil—some carved from obsidian and mountain roots, others whispered from the deep emerald groves. Cities of stone and marble raised their banners, delving into the mysteries of metallurgy, agriculture, and high arcana.

Now the winds of destiny carry the march of armies and the clashes of divine will. Alliances form and shatter across contested borderlands, while miracles and catastrophes alike shape the unfolding ages.`;
}
