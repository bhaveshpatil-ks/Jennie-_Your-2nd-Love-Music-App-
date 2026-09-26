import { TrackCatalog } from '../models/TrackCatalog.js';
import { isDbConnected } from '../config/db.js';

// Pre-seeded high-fidelity catalog pool for fallback when DB is warming up
const SEED_CATALOG = [
  {
    videoId: '4DfVxVeqk2o',
    title: '52 Bars',
    artist: 'Karan Aujla',
    album: 'Four Me EP',
    duration: 204,
    genreTags: ['Punjabi Hip-Hop'],
    moodTags: ['High Energy', 'Swagger'],
    audioFeatures: { tempo: 96, energy: 0.88, valence: 0.72, danceability: 0.85, acousticness: 0.12 },
    coPlayed: ['cWMxCE2HTag', 'LK7-_dgAVQE', 'pXRviuL6vMY'],
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    qualityScore: 92,
  },
  {
    videoId: 'BddP6PYo2gs',
    title: 'Kesariya',
    artist: 'Arijit Singh & Pritam',
    album: 'Brahmastra',
    duration: 268,
    genreTags: ['Bollywood Romantic'],
    moodTags: ['Romantic', 'Soulful'],
    audioFeatures: { tempo: 92, energy: 0.62, valence: 0.65, danceability: 0.58, acousticness: 0.42 },
    coPlayed: ['ElZfdU54Cp8', 'cWMxCE2HTag'],
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    qualityScore: 95,
  },
  {
    videoId: 'cWMxCE2HTag',
    title: 'Softly',
    artist: 'Karan Aujla & Ikky',
    album: 'Making Memories',
    duration: 156,
    genreTags: ['Punjabi Hip-Hop', 'Pop / Global'],
    moodTags: ['Groove', 'Chill'],
    audioFeatures: { tempo: 102, energy: 0.78, valence: 0.80, danceability: 0.82, acousticness: 0.22 },
    coPlayed: ['4DfVxVeqk2o', 'pXRviuL6vMY'],
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    qualityScore: 94,
  },
  {
    videoId: 'LK7-_dgAVQE',
    title: 'Tauba Tauba',
    artist: 'Karan Aujla',
    album: 'Bad Newz',
    duration: 208,
    genreTags: ['Punjabi Hip-Hop', 'Pop / Global'],
    moodTags: ['Party', 'Dance'],
    audioFeatures: { tempo: 104, energy: 0.90, valence: 0.85, danceability: 0.88, acousticness: 0.15 },
    coPlayed: ['4DfVxVeqk2o', 'cWMxCE2HTag', 'pXRviuL6vMY'],
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    qualityScore: 96,
  },
  {
    videoId: 'pXRviuL6vMY',
    title: 'With You',
    artist: 'AP Dhillon',
    album: 'With You - Single',
    duration: 154,
    genreTags: ['Punjabi Hip-Hop', 'Pop / Global'],
    moodTags: ['Romantic', 'Cozy'],
    audioFeatures: { tempo: 94, energy: 0.70, valence: 0.68, danceability: 0.75, acousticness: 0.35 },
    coPlayed: ['cWMxCE2HTag', 'ElZfdU54Cp8', '4DfVxVeqk2o'],
    thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
    qualityScore: 93,
  },
  {
    videoId: 'ElZfdU54Cp8',
    title: 'Apna Bana Le',
    artist: 'Arijit Singh & Sachin-Jigar',
    album: 'Bhediya',
    duration: 261,
    genreTags: ['Bollywood Romantic'],
    moodTags: ['Emotional', 'Deep'],
    audioFeatures: { tempo: 88, energy: 0.58, valence: 0.52, danceability: 0.50, acousticness: 0.55 },
    coPlayed: ['BddP6PYo2gs', 'pXRviuL6vMY'],
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    qualityScore: 95,
  },
  {
    videoId: 'jfKfPfyJRdk',
    title: 'Midnight Coffee',
    artist: 'Komorebi Sound',
    album: 'Warm Horizons',
    duration: 168,
    genreTags: ['Lo-Fi'],
    moodTags: ['Chill & Relax'],
    audioFeatures: { tempo: 82, energy: 0.32, valence: 0.55, danceability: 0.60, acousticness: 0.72 },
    coPlayed: ['5yx6BWlEVcY', 'rUxyKA_-grg'],
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    qualityScore: 88,
  },
  {
    videoId: '5yx6BWlEVcY',
    title: 'Rainy Window Pane',
    artist: 'Aether Beats',
    album: 'Monsoon Diary',
    duration: 194,
    genreTags: ['Lo-Fi'],
    moodTags: ['Study & Focus'],
    audioFeatures: { tempo: 78, energy: 0.28, valence: 0.40, danceability: 0.52, acousticness: 0.80 },
    coPlayed: ['jfKfPfyJRdk', 'rUxyKA_-grg'],
    thumbnail: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=80',
    qualityScore: 87,
  },
  {
    videoId: '4xDzrJKXOOY',
    title: 'Neon Odyssey',
    artist: 'Vector Runner',
    album: 'Grid City 2088',
    duration: 235,
    genreTags: ['Synthwave'],
    moodTags: ['High Energy'],
    audioFeatures: { tempo: 126, energy: 0.85, valence: 0.72, danceability: 0.75, acousticness: 0.08 },
    coPlayed: ['jfKfPfyJRdk'],
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    qualityScore: 89,
  },
];

/**
 * Normalizes artist string for comparison
 */
function normalizeArtist(name) {
  if (!name || typeof name !== 'string') return '';
  return name.toLowerCase().replace(/ - topic$/i, '').replace(/\b(feat\.?|ft\.?)\b.*$/i, '').trim();
}

/**
 * Calculates audio feature Euclidean distance (0 = identical, 1 = maximum distance)
 */
function calculateAudioFeatureSimilarity(featA, featB) {
  if (!featA || !featB) return 0.5;
  const dTempo = Math.min(1, Math.abs((featA.tempo || 100) - (featB.tempo || 100)) / 100);
  const dEnergy = Math.abs((featA.energy || 0.5) - (featB.energy || 0.5));
  const dValence = Math.abs((featA.valence || 0.5) - (featB.valence || 0.5));
  const dDance = Math.abs((featA.danceability || 0.5) - (featB.danceability || 0.5));
  const dAcoustic = Math.abs((featA.acousticness || 0.5) - (featB.acousticness || 0.5));

  const distance = Math.sqrt(
    Math.pow(dTempo, 2) * 0.2 +
    Math.pow(dEnergy, 2) * 0.3 +
    Math.pow(dValence, 2) * 0.2 +
    Math.pow(dDance, 2) * 0.15 +
    Math.pow(dAcoustic, 2) * 0.15
  );

  return Math.max(0, 1 - distance);
}

/**
 * LAYER 3: LIVE RECOMMENDATION SERVING
 * 
 * ZERO YouTube API Quota Units Used.
 * 100% computed from local MongoDB TrackCatalog + Seed Pool.
 * 
 * Scoring Formula:
 * - Genre Match: 35%
 * - Mood / Audio Feature Similarity: 25%
 * - Collaborative Filtering (coPlayed relations): 20%
 * - Same Artist / Album Capped & Decayed: 15%
 * - Discovery Factor: 5%
 * 
 * Anti-Repetition Rules:
 * - Max 25% same artist in 10-song window
 * - Artist cooldown after 2 consecutive songs
 * - Negative feedback penalty on skip fatigue
 */
export async function getLiveRecommendations(currentTrack, options = {}) {
  const {
    history = [],           // Recent tracks played in session
    consecutiveSkips = 0,   // Number of quick skips (<15s) in a row
    limit = 10,             // Number of recommendations to return
  } = options;

  if (!currentTrack) return [];

  // Extract clean identifiers
  const currentVideoId = currentTrack.youtubeId || currentTrack.videoId || (typeof currentTrack.id === 'string' && currentTrack.id.replace('yt-', ''));
  const currentArtist = normalizeArtist(currentTrack.artist);
  const currentGenres = currentTrack.genreTags || (currentTrack.genre ? [currentTrack.genre] : ['Pop / Global']);
  const currentFeatures = currentTrack.audioFeatures || { tempo: 100, energy: 0.6, valence: 0.6, danceability: 0.6, acousticness: 0.3 };

  // 1. Fetch candidate pool entirely from local DB (or fallback pool) — 0 UNITS
  let candidates = [];
  if (isDbConnected()) {
    try {
      const dbTracks = await TrackCatalog.find({
        videoId: { $ne: currentVideoId },
      })
        .limit(100)
        .lean();
      if (dbTracks && dbTracks.length > 0) {
        candidates = dbTracks;
      }
    } catch (err) {
      console.warn('[Layer 3] DB candidate fetch failed, falling back to seed catalog:', err.message);
    }
  }

  // Merge with pre-seeded tracks to ensure zero-empty cold starts
  const poolMap = new Map();
  [...candidates, ...SEED_CATALOG].forEach((t) => {
    const vid = t.videoId || t.youtubeId;
    if (vid && vid !== currentVideoId) {
      poolMap.set(vid, t);
    }
  });
  const candidatePool = Array.from(poolMap.values());

  // 2. Compute artist play frequency in the recent 10-song history window
  const recentWindow = history.slice(0, 10);
  const artistWindowCounts = {};
  recentWindow.forEach((t) => {
    const a = normalizeArtist(t.artist);
    if (a) artistWindowCounts[a] = (artistWindowCounts[a] || 0) + 1;
  });

  // Check if current artist has played 2 times in recent 3 songs (Artist Cooldown)
  const recent3 = history.slice(0, 3);
  const artistRecentCount = recent3.filter((t) => normalizeArtist(t.artist) === currentArtist).length;
  const isArtistCoolingDown = artistRecentCount >= 2;

  // 3. Score all candidates using the 5-signal formula
  const scored = candidatePool.map((candidate) => {
    const candArtist = normalizeArtist(candidate.artist);
    const candVideoId = candidate.videoId || candidate.youtubeId;
    const candGenres = candidate.genreTags || (candidate.genre ? [candidate.genre] : []);
    const candFeatures = candidate.audioFeatures || { tempo: 100, energy: 0.5, valence: 0.5, danceability: 0.5, acousticness: 0.5 };

    // --- Signal 1: Genre Match (35%) ---
    let genreScore = 0;
    const hasDirectMatch = candGenres.some((g) => currentGenres.includes(g));
    if (hasDirectMatch) {
      genreScore = 1.0;
    } else {
      // Related genre affinity
      genreScore = 0.35;
    }

    // --- Signal 2: Mood & Audio Feature Similarity (25%) ---
    const featureScore = calculateAudioFeatureSimilarity(currentFeatures, candFeatures);

    // --- Signal 3: Collaborative Filtering / Co-played (20%) ---
    let collabScore = 0.2; // Baseline collaborative prior
    if (currentTrack.coPlayed && currentTrack.coPlayed.includes(candVideoId)) {
      collabScore = 1.0;
    } else if (candidate.coPlayed && candidate.coPlayed.includes(currentVideoId)) {
      collabScore = 0.85;
    }

    // --- Signal 4: Same Artist / Album Capped & Decayed (15%) ---
    let artistScore = 0;
    if (candArtist === currentArtist) {
      if (isArtistCoolingDown) {
        // Hard cooldown: penalize to prevent infinite loop
        artistScore = -0.5;
      } else {
        // Capped tiebreaker: 0.6 if never played, 0.2 if played once
        const countInWindow = artistWindowCounts[candArtist] || 0;
        artistScore = Math.max(0, 0.6 - countInWindow * 0.3);
      }
    } else {
      artistScore = 0.4; // Healthy baseline for diverse artists
    }

    // --- Signal 5: Discovery / Freshness (5%) ---
    const qualityNorm = (candidate.qualityScore || 75) / 100;
    const discoveryScore = qualityNorm;

    // Weighted composite
    let compositeScore =
      genreScore * 0.35 +
      featureScore * 0.25 +
      collabScore * 0.20 +
      artistScore * 0.15 +
      discoveryScore * 0.05;

    // --- Strict Anti-Repetition Rules ---
    // Rule A: Max 25% same artist in 10-song window (exceeded if already 2+ in window)
    if (candArtist === currentArtist && (artistWindowCounts[candArtist] || 0) >= 2) {
      compositeScore *= 0.1; // 90% penalty
    }

    // Rule B: Negative feedback decay on skip fatigue
    if (consecutiveSkips >= 2 && candArtist === currentArtist) {
      compositeScore *= 0.2; // User is rapidly skipping, steer away from same artist
    }

    // Rule C: Immediate back-to-back duplicate prevention
    if (history[0] && normalizeArtist(history[0].artist) === candArtist && candArtist === currentArtist) {
      compositeScore *= 0.25;
    }

    // Determine human-readable recommendation reason
    let reason = 'Curated for your session';
    if (collabScore > 0.8) reason = 'Frequently played together';
    else if (genreScore === 1.0 && featureScore > 0.75) reason = 'Matching tempo & energy';
    else if (candArtist === currentArtist && !isArtistCoolingDown) reason = 'More from this artist';
    else if (genreScore === 1.0) reason = `Popular in ${candGenres[0] || 'your genre'}`;

    return {
      track: {
        id: `yt-${candVideoId}`,
        youtubeId: candVideoId,
        title: candidate.title,
        artist: candidate.artist,
        album: candidate.album || `${candidate.artist} (Official)`,
        duration: candidate.duration || 180,
        audioUrl: candidate.audioUrl || '',
        coverUrl: candidate.thumbnail || candidate.coverUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
        genre: candGenres[0] || 'Pop / Global',
        genreTags: candGenres,
        moodTags: candidate.moodTags || [],
        source: 'youtube',
        recommendationReason: reason,
        recommendationScore: Math.round(compositeScore * 100),
      },
      score: compositeScore,
    };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Return top N tracks (Zero YouTube API calls)
  return scored.slice(0, limit).map((s) => s.track);
}
