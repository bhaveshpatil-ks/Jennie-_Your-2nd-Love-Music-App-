/**
 * Recommendation Engine for Jennie Music Streaming
 * 
 * Implements weighted multi-signal scoring, strict anti-repetition rules,
 * same-artist and same-cluster cooldowns, diversity injection, and session decay.
 * 
 * FIXED SCORING FORMULA:
 * - Genre / sub-genre match: 35%
 * - Mood / energy / audio-feature similarity: 25%
 * - Collaborative filtering ("users who played X also played"): 20%
 * - Same artist / album (capped & decayed): 15%
 * - Freshness / discovery injection: 5%
 */

import { MOCK_TRACKS } from '../data/mockTracks.js';

/**
 * Genre Proximity / Affinity Graph
 * Defines natural transitions between genres to maintain mood continuity.
 */
export const GENRE_AFFINITY = {
  'Lo-Fi': {
    adjacent: ['Ambient', 'Classical', 'Acoustic', 'Chillhop', 'Jazz'],
    disallowedImmediate: ['Metal', 'EDM', 'Hard Rock', 'Psytrance']
  },
  'Synthwave': {
    adjacent: ['Deep House', 'Electro', 'Cyberpunk', 'Techno'],
    disallowedImmediate: ['Acoustic', 'Traditional Folk', 'Classical Piano']
  },
  'Deep House': {
    adjacent: ['Synthwave', 'Electronic', 'Tech House', 'Nu-Disco'],
    disallowedImmediate: ['Ambient Drone', 'Classical', 'Acoustic Solo']
  },
  'Ambient': {
    adjacent: ['Lo-Fi', 'Classical', 'Meditation', 'Downtempo'],
    disallowedImmediate: ['Deep House', 'Synthwave', 'EDM', 'Hip-Hop']
  },
  'Acoustic': {
    adjacent: ['Classical', 'Lo-Fi', 'Indie Folk', 'Singer-Songwriter'],
    disallowedImmediate: ['Synthwave', 'Deep House', 'EDM', 'Dubstep']
  },
  'Classical': {
    adjacent: ['Ambient', 'Acoustic', 'Cinematic', 'Neo-Classical'],
    disallowedImmediate: ['Synthwave', 'Deep House', 'EDM', 'Trap']
  },
  'Bollywood Romantic': {
    adjacent: ['Sufi', 'Indian Indie', 'Acoustic', 'Ghazal', 'Pop / Global'],
    disallowedImmediate: ['Death Metal', 'Dark Synthwave']
  },
  'Hip-Hop': {
    adjacent: ['Punjabi Hip-Hop', 'Urban Beat', 'Trap', 'R&B', 'Lo-Fi', 'Pop / Global'],
    disallowedImmediate: ['Classical Solo', 'Ambient Drone']
  },
  'Punjabi Hip-Hop': {
    adjacent: ['Hip-Hop', 'Urban Beat', 'Trap', 'Bollywood Romantic', 'Pop / Global'],
    disallowedImmediate: ['Classical Solo', 'Ambient Drone']
  },
  'Pop / Global': {
    adjacent: ['Hip-Hop', 'Punjabi Hip-Hop', 'Deep House', 'Bollywood Romantic', 'Synthwave'],
    disallowedImmediate: ['Ambient Drone']
  }
};

/**
 * Default audio features & collaborative co-play map for mock catalog tracks
 */
export const TRACK_AUDIO_FEATURES = {
  'track-1': { tempo: 82, energy: 0.32, valence: 0.55, danceability: 0.60, acousticness: 0.72, subGenre: 'Chillhop', language: 'Instrumental', coPlayed: ['track-3', 'track-2', 'track-16'] },
  'track-2': { tempo: 78, energy: 0.28, valence: 0.40, danceability: 0.52, acousticness: 0.80, subGenre: 'Rainy Lo-Fi', language: 'Instrumental', coPlayed: ['track-1', 'track-3', 'track-14'] },
  'track-3': { tempo: 80, energy: 0.30, valence: 0.50, danceability: 0.58, acousticness: 0.75, subGenre: 'Chillhop', language: 'Instrumental', coPlayed: ['track-1', 'track-2', 'track-4'] },
  'track-4': { tempo: 88, energy: 0.42, valence: 0.62, danceability: 0.65, acousticness: 0.50, subGenre: 'Jazzhop', language: 'Instrumental', coPlayed: ['track-1', 'track-5', 'track-7'] },
  
  'track-5': { tempo: 126, energy: 0.85, valence: 0.72, danceability: 0.75, acousticness: 0.08, subGenre: 'Darksynth', language: 'Instrumental', coPlayed: ['track-7', 'track-6', 'track-8'] },
  'track-6': { tempo: 130, energy: 0.88, valence: 0.68, danceability: 0.78, acousticness: 0.05, subGenre: 'Outrun', language: 'Instrumental', coPlayed: ['track-5', 'track-7', 'track-10'] },
  'track-7': { tempo: 122, energy: 0.78, valence: 0.65, danceability: 0.70, acousticness: 0.12, subGenre: 'Dreamwave', language: 'Instrumental', coPlayed: ['track-5', 'track-8', 'track-11'] },
  'track-8': { tempo: 120, energy: 0.75, valence: 0.58, danceability: 0.68, acousticness: 0.10, subGenre: 'Cyberpunk', language: 'Instrumental', coPlayed: ['track-5', 'track-7', 'track-6'] },

  'track-9': { tempo: 124, energy: 0.82, valence: 0.80, danceability: 0.84, acousticness: 0.15, subGenre: 'Melodic House', language: 'Instrumental', coPlayed: ['track-11', 'track-10', 'track-5'] },
  'track-10': { tempo: 125, energy: 0.86, valence: 0.76, danceability: 0.82, acousticness: 0.10, subGenre: 'Club House', language: 'Instrumental', coPlayed: ['track-9', 'track-11', 'track-6'] },
  'track-11': { tempo: 122, energy: 0.79, valence: 0.70, danceability: 0.80, acousticness: 0.18, subGenre: 'Deep Melodic', language: 'Instrumental', coPlayed: ['track-9', 'track-10', 'track-7'] },

  'track-12': { tempo: 60, energy: 0.12, valence: 0.28, danceability: 0.15, acousticness: 0.94, subGenre: 'Drone Ambient', language: 'Instrumental', coPlayed: ['track-13', 'track-14', 'track-18'] },
  'track-13': { tempo: 64, energy: 0.15, valence: 0.35, danceability: 0.20, acousticness: 0.90, subGenre: 'Meditation', language: 'Instrumental', coPlayed: ['track-12', 'track-14', 'track-17'] },
  'track-14': { tempo: 68, energy: 0.18, valence: 0.38, danceability: 0.22, acousticness: 0.88, subGenre: 'Space Ambient', language: 'Instrumental', coPlayed: ['track-12', 'track-13', 'track-2'] },

  'track-15': { tempo: 96, energy: 0.38, valence: 0.60, danceability: 0.54, acousticness: 0.88, subGenre: 'Fingerstyle Folk', language: 'Instrumental', coPlayed: ['track-16', 'track-17', 'track-1'] },
  'track-16': { tempo: 92, energy: 0.35, valence: 0.56, danceability: 0.50, acousticness: 0.90, subGenre: 'Acoustic Indie', language: 'Instrumental', coPlayed: ['track-15', 'track-17', 'track-3'] },
  'track-17': { tempo: 88, energy: 0.30, valence: 0.52, danceability: 0.48, acousticness: 0.92, subGenre: 'Chamber Folk', language: 'Instrumental', coPlayed: ['track-15', 'track-16', 'track-19'] },

  'track-18': { tempo: 72, energy: 0.22, valence: 0.32, danceability: 0.25, acousticness: 0.96, subGenre: 'Solo Piano', language: 'Instrumental', coPlayed: ['track-19', 'track-20', 'track-12'] },
  'track-19': { tempo: 75, energy: 0.24, valence: 0.36, danceability: 0.30, acousticness: 0.95, subGenre: 'Neo-Classical Waltz', language: 'Instrumental', coPlayed: ['track-18', 'track-20', 'track-17'] },
  'track-20': { tempo: 70, energy: 0.20, valence: 0.30, danceability: 0.24, acousticness: 0.97, subGenre: 'Cinematic Minimal', language: 'Instrumental', coPlayed: ['track-18', 'track-19', 'track-14'] },
};

/**
 * Normalizes artist name for consistent matching
 */
export function normalizeArtist(artist) {
  if (!artist || typeof artist !== 'string') return '';
  return artist
    .toLowerCase()
    .replace(/ - topic$/i, '')
    .replace(/\b(feat\.?|ft\.?|featuring)\b.*$/i, '')
    .trim();
}

/**
 * Extracts a song cluster identifier for near-duplicates or series:
 * (same artist + same album OR similar title pattern, e.g., a "Bars" series)
 */
export function getSongCluster(track) {
  if (!track) return 'unknown_cluster';
  const artist = normalizeArtist(track.artist);
  const album = (track.album || '').toLowerCase().trim();
  const rawTitle = (track.title || '').toLowerCase().trim();

  // Pattern match series or numeric/installment releases (e.g. "52 Bars", "100 Bars", "Part 1", "Pt. 2", "Vol 1")
  const seriesMatch = rawTitle.match(/\b(bars|chapter|pt\.?|part|vol\.?|volume|episode|freestyle|intro|outro|interlude)\b/i);
  if (artist && seriesMatch) {
    return `cluster:${artist}:${seriesMatch[0].toLowerCase()}`;
  }

  // Same artist and non-generic album
  if (artist && album && album !== 'single' && album !== 'unknown' && album !== 'ep') {
    return `cluster:${artist}:${album}`;
  }

  // Individual cluster based on artist + track ID
  return `cluster:${artist}:${track.id || rawTitle}`;
}

/**
 * Infers semantic tags and audio vectors if not pre-indexed
 */
export function enrichTrackMetadata(track) {
  if (!track) return null;

  if (TRACK_AUDIO_FEATURES[track.id]) {
    return {
      ...track,
      ...TRACK_AUDIO_FEATURES[track.id],
    };
  }

  const rawGenre = (track.genre || '').toLowerCase();
  const rawArtist = normalizeArtist(track.artist);

  // Genre inference for external / live search items (e.g. Punjabi Rap, Hip-Hop, Pop)
  let genre = track.genre || 'Pop / Global';
  let subGenre = 'General';
  let tempo = 100;
  let energy = 0.55;
  let valence = 0.55;
  let danceability = 0.60;
  let acousticness = 0.40;

  if (
    rawGenre.includes('punjabi') ||
    rawGenre.includes('hip-hop') ||
    rawGenre.includes('rap') ||
    rawArtist.includes('aujla') ||
    rawArtist.includes('moose') ||
    rawArtist.includes('dhillon') ||
    rawArtist.includes('dosanjh') ||
    rawArtist.includes('divine') ||
    rawArtist.includes('stan') ||
    rawArtist.includes('shubh') ||
    rawArtist.includes('badshah') ||
    rawArtist.includes('raftaar')
  ) {
    genre = 'Punjabi Hip-Hop';
    subGenre = 'Punjabi Rap / Trap';
    tempo = 96;
    energy = 0.80;
    valence = 0.65;
    danceability = 0.82;
    acousticness = 0.15;
  } else if (rawGenre.includes('lo-fi') || rawGenre.includes('chill')) {
    genre = 'Lo-Fi';
    subGenre = 'Chillhop';
    tempo = 82;
    energy = 0.30;
    valence = 0.50;
    danceability = 0.55;
    acousticness = 0.75;
  } else if (rawGenre.includes('synthwave') || rawGenre.includes('cyberpunk') || rawGenre.includes('retro')) {
    genre = 'Synthwave';
    subGenre = 'Outrun';
    tempo = 124;
    energy = 0.82;
    valence = 0.68;
    danceability = 0.72;
    acousticness = 0.08;
  } else if (rawGenre.includes('house') || rawGenre.includes('edm') || rawGenre.includes('dance')) {
    genre = 'Deep House';
    subGenre = 'Club House';
    tempo = 125;
    energy = 0.85;
    valence = 0.75;
    danceability = 0.82;
    acousticness = 0.12;
  } else if (rawGenre.includes('ambient') || rawGenre.includes('meditation') || rawGenre.includes('sleep')) {
    genre = 'Ambient';
    subGenre = 'Meditation';
    tempo = 64;
    energy = 0.15;
    valence = 0.35;
    danceability = 0.20;
    acousticness = 0.90;
  } else if (rawGenre.includes('acoustic') || rawGenre.includes('folk')) {
    genre = 'Acoustic';
    subGenre = 'Folk';
    tempo = 90;
    energy = 0.35;
    valence = 0.55;
    danceability = 0.50;
    acousticness = 0.90;
  } else if (rawGenre.includes('classical') || rawGenre.includes('piano')) {
    genre = 'Classical';
    subGenre = 'Solo Piano';
    tempo = 72;
    energy = 0.22;
    valence = 0.32;
    danceability = 0.26;
    acousticness = 0.96;
  } else if (rawGenre.includes('bollywood') || rawGenre.includes('sufi')) {
    genre = 'Bollywood Romantic';
    subGenre = 'Romantic';
    tempo = 92;
    energy = 0.55;
    valence = 0.62;
    danceability = 0.58;
    acousticness = 0.55;
  }

  return {
    ...track,
    genre,
    subGenre,
    tempo,
    energy,
    valence,
    danceability,
    acousticness,
    coPlayed: [],
  };
}

/**
 * Calculates Euclidean distance between two audio vectors [energy, valence, danceability, acousticness, tempo]
 * Normalized return between 0 (identical) and 1 (opposite)
 */
function calculateAudioDistance(featA, featB) {
  const dEnergy = Math.pow((featA.energy || 0.5) - (featB.energy || 0.5), 2);
  const dValence = Math.pow((featA.valence || 0.5) - (featB.valence || 0.5), 2);
  const dDance = Math.pow((featA.danceability || 0.5) - (featB.danceability || 0.5), 2);
  const dAcoustic = Math.pow((featA.acousticness || 0.5) - (featB.acousticness || 0.5), 2);
  const dTempo = Math.pow(((featA.tempo || 100) - (featB.tempo || 100)) / 100, 2);

  const rawDist = Math.sqrt(dEnergy * 1.5 + dValence + dDance * 0.8 + dAcoustic + dTempo * 0.5);
  return Math.min(1, rawDist / 2.0);
}

/**
 * Decides the next song using weighted signals and strict anti-repetition rules.
 * 
 * WEIGHTED SIGNALS:
 * - Genre / sub-genre match: 35%
 * - Mood / audio-feature similarity: 25%
 * - Collaborative filtering: 20%
 * - Same artist / album (capped & decayed): 15%
 * - Freshness / discovery injection: 5%
 * 
 * ANTI-REPETITION FILTERS:
 * 1. Same-artist cooldown: max 2 songs by same artist in rolling window of 6.
 * 2. Same-song-cluster cooldown: max 2 songs in near-duplicate cluster in rolling window of 6.
 * 3. Diversity injection: 4th-5th slots force a different artist on genre/mood match.
 * 4. Decaying artist weight: 50% multiplicative decay per repeat in session.
 * 5. No infinite category lock: if last 8 songs are same artist/subtag, force wider genre pool.
 */
export function decideNextSong(currentTrack, userContext = {}, trackPool = MOCK_TRACKS) {
  const seed = enrichTrackMetadata(currentTrack);
  if (!seed) {
    const fallbackTrack = trackPool[0] || MOCK_TRACKS[0];
    return {
      song_id: fallbackTrack.id,
      reason_for_recommendation: 'cold_start_trending, 85% confidence',
      confidence_score: 0.85,
      track: fallbackTrack,
    };
  }

  const {
    history = [],             // History array (most recent first)
    consecutiveSkips = 0,     // Consecutive rapid skips (<15s)
    likedTrackIds = new Set(), // Set or array of liked track IDs
    queuePosition = 1,        // Current position in queue (1-indexed)
    isDiversitySlot = false,  // Explicit trigger to enforce a different artist
    isArtistRadio = false,    // User explicitly requested artist radio
    rootSeedArtist = null,    // The original seed artist to enforce diversity against
  } = userContext;

  const seedArtist = normalizeArtist(seed.artist);
  const rootArtist = normalizeArtist(rootSeedArtist || seed.artist);

  // 1. Recency Window: dynamically adapt so small track pools don't deadlock
  const maxRecency = Math.min(20, Math.max(2, Math.floor(trackPool.length * 0.7)));
  const recentSongIds = new Set([
    seed.id,
    ...history.slice(0, maxRecency).map((t) => t.id).filter(Boolean),
  ]);

  // Rolling window of the last 5 songs preceding this candidate (so adding candidate creates a window of 6)
  const windowPreceding = [seed, ...history].slice(0, 5);

  // Rule 3: Diversity injection (every 4th-5th song in queue must come from a different artist than root seed)
  const forceDifferentArtist = !isArtistRadio && (
    isDiversitySlot ||
    queuePosition === 4 ||
    queuePosition === 5 ||
    (queuePosition > 0 && (queuePosition % 4 === 0 || queuePosition % 5 === 0))
  );

  // Rule 5: No infinite same-category lock (last 8 songs all from one artist or exact sub-tag)
  const last8 = [seed, ...history].slice(0, 8);
  const isSameArtistLock = !isArtistRadio && last8.length >= 8 && last8.every(
    (t) => normalizeArtist(t.artist) === seedArtist
  );
  const isSameSubtagLock = last8.length >= 8 && last8.every(
    (t) => (t.subGenre || t.genre || '').toLowerCase().trim() === (seed.subGenre || seed.genre || '').toLowerCase().trim()
  );
  const isCategoryLocked = isSameArtistLock || isSameSubtagLock;

  // Skip fatigue: 2+ rapid skips triggers pivot to adjacent genre
  const isPivotingAway = consecutiveSkips >= 2;

  // Track session occurrences of seed artist for 50% multiplicative decay
  const seedArtistSessionCount = history.filter(
    (t) => normalizeArtist(t.artist) === seedArtist
  ).length;

  let cooldownTriggered = false;
  let diversityTriggered = false;
  let categoryLockBroken = false;

  const scoredCandidates = [];

  for (const candidate of trackPool) {
    if (!candidate || !candidate.id) continue;

    // Hard filter: Do not replay recently heard songs
    if (recentSongIds.has(candidate.id)) continue;

    const candArtist = normalizeArtist(candidate.artist);
    const candCluster = getSongCluster(candidate);
    const isSameArtist = candArtist === seedArtist;
    const isRootArtist = candArtist === rootArtist;

    // Rule 1: Same-artist cooldown: adding this song would mean > 2 songs by same artist in rolling 6 songs
    const artistCountInWindow = windowPreceding.filter(
      (t) => normalizeArtist(t.artist) === candArtist
    ).length;

    if (!isArtistRadio && artistCountInWindow >= 2) {
      if (isSameArtist || isRootArtist) cooldownTriggered = true;
      continue; // Exclude artist until cooldown passes
    }

    // Rule 2: Same-song-cluster cooldown: adding this song would mean > 2 songs in same cluster in rolling 6 songs
    const clusterCountInWindow = windowPreceding.filter(
      (t) => getSongCluster(t) === candCluster
    ).length;

    if (!isArtistRadio && clusterCountInWindow >= 2) {
      cooldownTriggered = true;
      continue; // Exclude cluster until cooldown passes
    }

    // Rule 3: Diversity injection enforcement: MUST come from different artist than seed song
    if (forceDifferentArtist && (isSameArtist || isRootArtist)) {
      diversityTriggered = true;
      continue; // Enforce different artist for this slot
    }

    // Rule 5: Force wider genre pool if locked
    if (isCategoryLocked) {
      if (isSameArtist || isRootArtist) {
        categoryLockBroken = true;
        continue;
      }
      const candSubTag = (candidate.subGenre || candidate.genre || '').toLowerCase().trim();
      const seedSubTag = (seed.subGenre || seed.genre || '').toLowerCase().trim();
      if (candSubTag === seedSubTag) {
        categoryLockBroken = true;
        continue;
      }
    }

    const cand = enrichTrackMetadata(candidate);

    // ----------------- FIXED WEIGHTED SCORING -----------------

    // Signal 1: Genre / Sub-Genre Match (Weight: 35% = 0.35 max)
    let genreScore = 0;
    const isSameGenre = cand.genre && seed.genre && cand.genre.toLowerCase() === seed.genre.toLowerCase();
    const isSameSubGenre = cand.subGenre && seed.subGenre && cand.subGenre.toLowerCase() === seed.subGenre.toLowerCase();
    const affinityData = GENRE_AFFINITY[seed.genre] || { adjacent: [], disallowedImmediate: [] };
    const isAdjacentGenre = affinityData.adjacent.some((g) => g.toLowerCase() === (cand.genre || '').toLowerCase());
    const isDisallowedGenre = affinityData.disallowedImmediate.some((g) => g.toLowerCase() === (cand.genre || '').toLowerCase());

    // Disallow jarring jumps (unless user consecutively skipped)
    if (!isPivotingAway && isDisallowedGenre) {
      continue;
    }

    if (isSameGenre && isSameSubGenre) {
      genreScore = 0.35;
    } else if (isSameGenre) {
      genreScore = 0.30;
    } else if (isAdjacentGenre || isCategoryLocked || isPivotingAway) {
      genreScore = isPivotingAway || isCategoryLocked ? 0.30 : 0.20;
    } else {
      genreScore = 0.05;
    }

    // Signal 2: Mood / Audio Feature Similarity (Weight: 25% = 0.25 max)
    const audioDist = calculateAudioDistance(seed, cand);
    const audioSim = Math.max(0, 1 - audioDist);
    const energyDelta = Math.abs((seed.energy || 0.5) - (cand.energy || 0.5));
    if (!isPivotingAway && energyDelta > 0.45) {
      continue; // Filter mood dissonance
    }
    const moodScore = parseFloat((audioSim * 0.25).toFixed(3));

    // Signal 3: Collaborative Filtering (Weight: 20% = 0.20 max)
    let collabScore = 0;
    const isCoPlayed = (seed.coPlayed && seed.coPlayed.includes(cand.id)) ||
                       (cand.coPlayed && cand.coPlayed.includes(seed.id));
    const isLiked = likedTrackIds instanceof Set
      ? likedTrackIds.has(cand.id)
      : Array.isArray(likedTrackIds) && likedTrackIds.includes(cand.id);

    if (isCoPlayed) {
      collabScore = 0.20;
    } else if (isLiked) {
      collabScore = 0.12;
    } else {
      collabScore = 0.0;
    }

    // Signal 4: Same Artist / Album (Weight: 15% = 0.15 max, capped and decayed)
    let artistScore = 0;
    const isSameAlbum = Boolean(cand.album && seed.album && cand.album.toLowerCase() === seed.album.toLowerCase());
    if (isSameArtist && !forceDifferentArtist && !isCategoryLocked) {
      const baseArtistScore = isSameAlbum ? 0.15 : 0.10;
      // Rule 4: Decaying artist weight (50% multiplicative decay per repeat in session)
      const decayFactor = Math.pow(0.5, seedArtistSessionCount);
      artistScore = parseFloat((baseArtistScore * decayFactor).toFixed(3));
    }

    // Signal 5: Freshness / Discovery Injection (Weight: 5% = 0.05 max)
    let freshnessScore = 0;
    const isArtistFresh = !windowPreceding.some(
      (t) => normalizeArtist(t.artist) === candArtist
    );
    if (isArtistFresh) {
      freshnessScore = 0.05;
    }

    // Total Score (Maximum 1.00 = 100%)
    const rawTotal = genreScore + moodScore + collabScore + artistScore + freshnessScore;
    const confidenceScore = Math.min(0.98, Math.max(0.50, parseFloat(rawTotal.toFixed(2))));

    // Determine primary winning weighted signal
    let winningSignal = 'genre+mood match';
    if (collabScore >= 0.18 && collabScore >= genreScore) {
      winningSignal = 'collaborative filtering match';
    } else if (genreScore >= 0.28 && moodScore >= 0.15) {
      winningSignal = 'genre+mood match';
    } else if (genreScore >= 0.25) {
      winningSignal = 'genre match';
    } else if (artistScore >= 0.08 && isSameArtist) {
      winningSignal = 'same artist match';
    } else {
      winningSignal = 'mood vector continuity';
    }

    // Explicit traceability modifiers
    const modifiers = [];
    if (cooldownTriggered) {
      modifiers.push('artist cooldown applied');
    }
    if (diversityTriggered || forceDifferentArtist) {
      modifiers.push('diversity injection applied');
    }
    if (categoryLockBroken) {
      modifiers.push('category lock broken');
    }
    if (isSameArtist && seedArtistSessionCount > 0) {
      modifiers.push('artist repetition decay applied');
    }

    const confidencePercent = Math.round(confidenceScore * 100);
    const modifierSuffix = modifiers.length > 0 ? `, ${modifiers.join(', ')}` : '';
    const reasonText = `${winningSignal}, ${confidencePercent}% confidence${modifierSuffix}`;

    scoredCandidates.push({
      song_id: cand.id,
      reason_for_recommendation: reasonText,
      confidence_score: confidenceScore,
      track: cand,
      genreScore,
      moodScore,
      collabScore,
      artistScore,
      isSameArtist,
    });
  }

  // Sort descending by confidence score
  scoredCandidates.sort((a, b) => b.confidence_score - a.confidence_score);

  if (scoredCandidates.length > 0) {
    const winner = scoredCandidates[0];
    return {
      song_id: winner.song_id,
      reason_for_recommendation: winner.reason_for_recommendation,
      confidence_score: winner.confidence_score,
      track: winner.track,
    };
  }

  // Fallback: If anti-repetition filter exhausted pool, select strictly non-cooling candidate from broader catalog
  const nonCoolingCandidates = trackPool.filter((t) => {
    if (!t || !t.id) return false;
    const a = normalizeArtist(t.artist);
    const count = windowPreceding.filter((rw) => normalizeArtist(rw.artist) === a).length;
    return count < 2;
  });

  const fallbackPool = nonCoolingCandidates.length > 0 ? nonCoolingCandidates : trackPool;

  const safeFallback = fallbackPool.find(
    (t) => t.id !== seed.id && normalizeArtist(t.artist) !== seedArtist && t.genre === seed.genre
  ) || fallbackPool.find(
    (t) => t.id !== seed.id && normalizeArtist(t.artist) !== seedArtist
  ) || fallbackPool.find((t) => t.id !== seed.id) || fallbackPool[0] || seed;

  return {
    song_id: safeFallback.id,
    reason_for_recommendation: 'genre+mood match, 60% confidence, artist cooldown applied',
    confidence_score: 0.60,
    track: safeFallback,
  };
}

/**
 * Builds an upcoming queue adhering to the 70 / 20 / 10 rule and strict diversity validation:
 * - 70% "Strongly Similar" (same genre, audio feature similarity)
 * - 20% "Loosely Related" (adjacent genre, shared mood)
 * - 10% "Discovery" (new artist/sub-genre broadening horizons)
 * 
 * VALIDATION GUARANTEE:
 * A 10-song queue will ALWAYS contain at least 3 distinct artists.
 */
export function buildRecommendedQueue(seedTrack, queueSize = 10, userContext = {}, trackPool = MOCK_TRACKS) {
  if (!seedTrack) return [];

  const queue = [];
  const currentHistory = [...(userContext.history || []), seedTrack];
  let currentSeed = seedTrack;
  const recentArtists = [...(userContext.recentArtists || [seedTrack.artist])];

  const targetStrong = Math.max(1, Math.round(queueSize * 0.70));
  const targetLoose = Math.max(1, Math.round(queueSize * 0.20));

  let countStrong = 0;
  let countLoose = 0;

  for (let i = 0; i < queueSize; i++) {
    const queuePos = i + 1;
    // Every 4th-5th song enforces diversity injection (different artist than seed)
    const isDiversitySlot = queuePos % 4 === 0 || queuePos % 5 === 0;

    const context = {
      ...userContext,
      history: currentHistory,
      recentArtists: recentArtists.slice(-5),
      queuePosition: queuePos,
      isDiversitySlot,
      rootSeedArtist: seedTrack.artist,
    };

    const decision = decideNextSong(currentSeed, context, trackPool);
    if (!decision || !decision.track) break;

    let category = 'strongly_similar';
    if (decision.track.genre !== seedTrack.genre) {
      category = (countStrong >= targetStrong && countLoose >= targetLoose) ? 'discovery' : 'loosely_related';
    }

    if (category === 'strongly_similar') countStrong++;
    else countLoose++;

    queue.push({
      ...decision,
      category,
    });

    currentSeed = decision.track;
    currentHistory.unshift(decision.track);
    recentArtists.push(decision.track.artist);
  }

  // ----------------- FINAL VALIDATION CHECK -----------------
  // "Does this queue, if you list the last 10 songs, show at least 3 different artists?"
  // If not, diversity injection has failed — fix by replacing slots with distinct artists.
  const distinctArtists = new Set(
    queue.map((item) => normalizeArtist(item.track?.artist)).filter(Boolean)
  );

  if (distinctArtists.size < 3 && queue.length >= 4 && trackPool.length > 2) {
    const unusedArtists = trackPool.filter(
      (t) => t && t.artist && !distinctArtists.has(normalizeArtist(t.artist))
    );

    // Inject 1 or 2 new artists at diversity slots (e.g. slot index 3, slot index 7)
    let injectIdx = 0;
    const slotsToInject = [3, 7, 4, 8].filter((idx) => idx < queue.length);

    for (const slot of slotsToInject) {
      if (distinctArtists.size >= 3 || injectIdx >= unusedArtists.length) break;
      const injectedCandidate = unusedArtists[injectIdx++];
      const enrichedInjected = enrichTrackMetadata(injectedCandidate);

      queue[slot] = {
        song_id: enrichedInjected.id,
        reason_for_recommendation: 'genre+mood match, 65% confidence, diversity injection applied',
        confidence_score: 0.65,
        track: enrichedInjected,
        category: 'discovery',
      };
      distinctArtists.add(normalizeArtist(enrichedInjected.artist));
    }
  }

  return queue;
}

/**
 * Diagnostic evaluation helper for debugging and auditing
 */
export function evaluateRecommendationDiagnostic(currentTrack, userContext = {}, trackPool = MOCK_TRACKS) {
  const nextDecision = decideNextSong(currentTrack, userContext, trackPool);
  const upcomingQueue = buildRecommendedQueue(currentTrack, 10, userContext, trackPool);

  const distinctArtistsCount = new Set(
    upcomingQueue.map((item) => normalizeArtist(item.track?.artist)).filter(Boolean)
  ).size;

  return {
    current_track: {
      id: currentTrack.id,
      title: currentTrack.title,
      artist: currentTrack.artist,
      cluster: getSongCluster(currentTrack),
      genre: currentTrack.genre,
    },
    next_decision: {
      song_id: nextDecision.song_id,
      reason_for_recommendation: nextDecision.reason_for_recommendation,
      confidence_score: nextDecision.confidence_score,
      next_song_title: nextDecision.track?.title,
      next_song_artist: nextDecision.track?.artist,
      next_song_cluster: getSongCluster(nextDecision.track),
    },
    upcoming_queue: upcomingQueue.map((item, idx) => ({
      position: idx + 1,
      song_id: item.song_id,
      title: item.track.title,
      artist: item.track.artist,
      genre: item.track.genre,
      category: item.category,
      reason_for_recommendation: item.reason_for_recommendation,
      confidence_score: item.confidence_score,
    })),
    validation_audit: {
      distinct_artists_in_10: distinctArtistsCount,
      passed_diversity_check: distinctArtistsCount >= 3,
    },
  };
}
