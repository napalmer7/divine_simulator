/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HistoryLogEntry } from '../types/game';

/**
 * Procedural fallback saga if the server is offline or lacks API key
 */
function getProceduralFallbackSaga(worldName: string): string {
  return `# The Great Saga of ${worldName}
*Recorded by the Venerable Bede, Chronicler of the Immortals*

In the First Dawn, when the cosmos was yet barren stone and primeval sea, the Immortals cast their divine gaze upon the firmament. Continental spires of granite and volcanic crags were hurled into the ether, while whispering forests took root under celestial rainfall.

Then dawned the Awakening of Mortal Kind. Diverse lineages arose from the soil—some carved from obsidian and mountain roots, others whispered from the deep emerald groves. Cities of stone and marble raised their banners, delving into the mysteries of metallurgy, agriculture, and high arcana.

Now the winds of destiny carry the march of armies and the clashes of divine will. Alliances form and shatter across contested borderlands, while miracles and catastrophes alike shape the unfolding ages.`;
}

/**
 * Generates an epic mythological chronicler saga by delegating to the backend server
 * API endpoint (`/api/chronicle`), which securely calls Gemini on the server.
 */
export async function generateMythicChronicle(
  history: HistoryLogEntry[],
  worldName: string = 'Meglin'
): Promise<string> {
  try {
    const res = await fetch('/api/chronicle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ history, worldName }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.text) {
        return data.text;
      }
    }
  } catch (err) {
    console.warn('Server mythic chronicle generation failed, falling back:', err);
  }

  return getProceduralFallbackSaga(worldName);
}

/**
 * Streams an epic mythological chronicler saga from the backend server
 * API endpoint (`/api/chronicle/stream`) via Server-Sent Events.
 */
export async function generateMythicChronicleStream(
  history: HistoryLogEntry[],
  onChunk: (textChunk: string) => void,
  worldName: string = 'Meglin'
): Promise<string> {
  try {
    const res = await fetch('/api/chronicle/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ history, worldName }),
    });

    if (!res.ok || !res.body) {
      // Fallback to standard request
      return generateMythicChronicle(history, worldName);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const payload = trimmed.slice(6);
          if (payload === '[DONE]') break;
          try {
            const parsed = JSON.parse(payload);
            if (parsed.text) {
              accumulatedText += parsed.text;
              onChunk(parsed.text);
            }
          } catch {
            // Ignore non-json chunk
          }
        }
      }
    }

    if (accumulatedText.trim().length > 0) {
      return accumulatedText;
    }
  } catch (err) {
    console.warn('Streaming chronicle failed, falling back to standard generation:', err);
  }

  const fallback = await generateMythicChronicle(history, worldName);
  onChunk(fallback);
  return fallback;
}
