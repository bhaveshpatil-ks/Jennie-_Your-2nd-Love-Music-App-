/**
 * Sanitizes music titles by stripping video/audio tag noise
 * @param {string} title
 * @returns {string}
 */
export function cleanTitle(title) {
  if (!title) return 'Untitled Track';
  return title
    .replace(/\[.*?\]/g, '')
    .replace(/\(Official (Music )?Video\)/gi, '')
    .replace(/\(Official Audio\)/gi, '')
    .replace(/\(Audio\)/gi, '')
    .replace(/\(Lyric(s)? Video\)/gi, '')
    .replace(/\(Visualizer\)/gi, '')
    .replace(/\(HD\)/gi, '')
    .replace(/\(4K\)/gi, '')
    .replace(/\|.*$/g, '')
    .trim();
}

/**
 * Sanitizes HTML entities in strings
 * @param {string} str
 * @returns {string}
 */
export function cleanString(str) {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}
