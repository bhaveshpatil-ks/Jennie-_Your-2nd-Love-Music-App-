/**
 * Generates synthetic waveform audio visualization bars (0 to 100)
 * @param {number} length Number of bars (default 48)
 * @param {number} seed Offset frequency
 * @returns {number[]} Array of bar heights
 */
export function generateWaveform(length = 48, seed = 0.4) {
  return Array.from({ length }, (_, i) => {
    const base = 25 + Math.sin(i * seed) * 25 + Math.cos(i * 0.75) * 15;
    return Math.max(10, Math.min(95, Math.round(base + (i % 3) * 10)));
  });
}
