/**
 * Mock royalty-free track catalog for Jennie
 * Fully compliant with PRD licensing requirements (CC-BY, Jamendo mock metadata)
 */

export const MOCK_TRACKS = [
  // Lo-Fi & Chillout
  {
    id: 'track-1',
    title: 'Midnight Coffee',
    artist: 'Komorebi Sound',
    album: 'Warm Horizons EP',
    duration: 168, // in seconds (2:48)
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    genre: 'Lo-Fi',
    mood: 'Chill & Relax',
    plays: '142,390',
    license: 'CC-BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    jamendoId: 'jam-90211',
    featured: true,
    releaseYear: 2024,
    color: '#F59E0B'
  },
  {
    id: 'track-2',
    title: 'Rainy Window Pane',
    artist: 'Aether Beats',
    album: 'Monsoon Diary',
    duration: 194, // 3:14
    coverUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=80',
    genre: 'Lo-Fi',
    mood: 'Study & Focus',
    plays: '98,210',
    license: 'CC-BY-NC 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-nc/4.0/',
    jamendoId: 'jam-88301',
    releaseYear: 2024,
    color: '#6366F1'
  },
  {
    id: 'track-3',
    title: 'Late Night Library',
    artist: 'Komorebi Sound',
    album: 'Warm Horizons EP',
    duration: 145, // 2:25
    coverUrl: 'https://images.unsplash.com/photo-1507842229451-79b1be8d6290?w=600&auto=format&fit=crop&q=80',
    genre: 'Lo-Fi',
    mood: 'Chill & Relax',
    plays: '76,540',
    license: 'CC-BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    jamendoId: 'jam-91044',
    releaseYear: 2023,
    color: '#EC4899'
  },
  {
    id: 'track-4',
    title: 'Tokyo Streetlights',
    artist: 'Nujalight',
    album: 'Shibuya Reflections',
    duration: 212, // 3:32
    coverUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
    genre: 'Lo-Fi',
    mood: 'Night Drive',
    plays: '210,880',
    license: 'CC-BY 4.0',
    jamendoId: 'jam-77402',
    featured: true,
    releaseYear: 2024,
    color: '#8B5CF6'
  },

  // Synthwave & Cyberpunk
  {
    id: 'track-5',
    title: 'Neon Odyssey',
    artist: 'Vector Runner',
    album: 'Grid City 2088',
    duration: 235, // 3:55
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    genre: 'Synthwave',
    mood: 'High Energy',
    plays: '315,900',
    license: 'CC-BY 4.0',
    jamendoId: 'jam-60312',
    featured: true,
    releaseYear: 2024,
    color: '#EC4899'
  },
  {
    id: 'track-6',
    title: 'Hyperdrive',
    artist: 'Cyber Pulse',
    album: 'Future Drift',
    duration: 188, // 3:08
    coverUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80',
    genre: 'Synthwave',
    mood: 'Workout Energy',
    plays: '184,200',
    license: 'CC-BY-SA 4.0',
    jamendoId: 'jam-62914',
    releaseYear: 2023,
    color: '#06B6D4'
  },
  {
    id: 'track-7',
    title: 'Digital Sunset',
    artist: 'Vector Runner',
    album: 'Grid City 2088',
    duration: 250, // 4:10
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    genre: 'Synthwave',
    mood: 'Night Drive',
    plays: '129,450',
    license: 'CC-BY 4.0',
    jamendoId: 'jam-61009',
    releaseYear: 2024,
    color: '#F43F5E'
  },
  {
    id: 'track-8',
    title: 'Cyberpunk Skyline',
    artist: 'Neon Helix',
    album: 'Megacity Protocols',
    duration: 205, // 3:25
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    genre: 'Synthwave',
    mood: 'Focus & Code',
    plays: '88,900',
    license: 'CC-BY 4.0',
    jamendoId: 'jam-63110',
    releaseYear: 2024,
    color: '#10B981'
  },

  // Deep House & Electronic
  {
    id: 'track-9',
    title: 'Solar Flare',
    artist: 'Solaria Groove',
    album: 'Ibiza Dunes',
    duration: 274, // 4:34
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    genre: 'Deep House',
    mood: 'Party & Groove',
    plays: '420,150',
    license: 'CC-BY 4.0',
    jamendoId: 'jam-44102',
    featured: true,
    releaseYear: 2024,
    color: '#10B981'
  },
  {
    id: 'track-10',
    title: 'Euphoria Waves',
    artist: 'Echo Deep',
    album: 'Velvet Nights',
    duration: 242, // 4:02
    coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
    genre: 'Deep House',
    mood: 'Workout Energy',
    plays: '158,300',
    license: 'CC-BY 4.0',
    jamendoId: 'jam-45910',
    releaseYear: 2023,
    color: '#3B82F6'
  },
  {
    id: 'track-11',
    title: 'Deep Horizon',
    artist: 'Solaria Groove',
    album: 'Ibiza Dunes',
    duration: 260, // 4:20
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    genre: 'Deep House',
    mood: 'Night Drive',
    plays: '91,400',
    license: 'CC-BY 4.0',
    jamendoId: 'jam-46112',
    releaseYear: 2024,
    color: '#8B5CF6'
  },

  // Ambient & Meditation
  {
    id: 'track-12',
    title: 'Northern Auroras',
    artist: 'Svalbard Resonance',
    album: 'Arctic Stasis',
    duration: 310, // 5:10
    coverUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&auto=format&fit=crop&q=80',
    genre: 'Ambient',
    mood: 'Deep Sleep',
    plays: '289,400',
    license: 'CC-BY 4.0',
    jamendoId: 'jam-22019',
    featured: true,
    releaseYear: 2024,
    color: '#06B6D4'
  },
  {
    id: 'track-13',
    title: 'Floating Through Mist',
    artist: 'Zenith Bloom',
    album: 'Still Waters',
    duration: 295, // 4:55
    coverUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    genre: 'Ambient',
    mood: 'Meditation',
    plays: '112,000',
    license: 'CC-BY 4.0',
    jamendoId: 'jam-23118',
    releaseYear: 2023,
    color: '#10B981'
  },
  {
    id: 'track-14',
    title: 'Weightless Space',
    artist: 'Cosmo Drift',
    album: 'Nebula Fields',
    duration: 330, // 5:30
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    genre: 'Ambient',
    mood: 'Study & Focus',
    plays: '164,800',
    license: 'CC-BY 4.0',
    jamendoId: 'jam-24890',
    releaseYear: 2024,
    color: '#8B5CF6'
  },

  // Acoustic & Indie
  {
    id: 'track-15',
    title: 'Campfire Stories',
    artist: 'Wildwood Hollow',
    album: 'Pine Needle Path',
    duration: 175, // 2:55
    coverUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80',
    genre: 'Acoustic',
    mood: 'Morning Coffee',
    plays: '143,200',
    license: 'CC-BY 4.0',
    jamendoId: 'jam-77190',
    releaseYear: 2023,
    color: '#F59E0B'
  },
  {
    id: 'track-16',
    title: 'Autumn Leaves Falling',
    artist: 'Wildwood Hollow',
    album: 'Pine Needle Path',
    duration: 198, // 3:18
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    genre: 'Acoustic',
    mood: 'Chill & Relax',
    plays: '109,700',
    license: 'CC-BY 4.0',
    jamendoId: 'jam-78012',
    releaseYear: 2024,
    color: '#D97706'
  },
  {
    id: 'track-17',
    title: 'Riverside Walk',
    artist: 'Clara & The Strings',
    album: 'Sunday Light',
    duration: 210, // 3:30
    coverUrl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&auto=format&fit=crop&q=80',
    genre: 'Acoustic',
    mood: 'Peaceful',
    plays: '87,600',
    license: 'CC-BY 4.0',
    jamendoId: 'jam-79110',
    releaseYear: 2024,
    color: '#10B981'
  },

  // Piano & Neo-Classical
  {
    id: 'track-18',
    title: 'First Snowfall in Prague',
    artist: 'Elias Thorne',
    album: 'Solitude in Minor',
    duration: 228, // 3:48
    coverUrl: 'https://images.unsplash.com/photo-1520523839898-5071282543e1?w=600&auto=format&fit=crop&q=80',
    genre: 'Classical',
    mood: 'Emotional & Deep',
    plays: '235,400',
    license: 'CC-BY 4.0',
    jamendoId: 'jam-11200',
    featured: true,
    releaseYear: 2024,
    color: '#6366F1'
  },
  {
    id: 'track-19',
    title: 'Waltz for Stargazers',
    artist: 'Elias Thorne',
    album: 'Solitude in Minor',
    duration: 185, // 3:05
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    genre: 'Classical',
    mood: 'Night Reflection',
    plays: '178,900',
    license: 'CC-BY 4.0',
    jamendoId: 'jam-11345',
    releaseYear: 2023,
    color: '#8B5CF6'
  },
  {
    id: 'track-20',
    title: 'Glass Reflection',
    artist: 'Isla Moreau',
    album: 'Cinematic Echoes',
    duration: 245, // 4:05
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
    genre: 'Classical',
    mood: 'Study & Focus',
    plays: '95,300',
    license: 'CC-BY 4.0',
    jamendoId: 'jam-11899',
    releaseYear: 2024,
    color: '#06B6D4'
  }
];

export const GENRES = [
  {
    id: 'lofi',
    name: 'Lo-Fi Beats',
    description: 'Chilled chords, vinyl crackle & study vibes',
    color: 'from-neutral-700 to-neutral-900',
    gradient: 'linear-gradient(135deg, #2A2A2A 0%, #121212 100%)',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    trackCount: 4
  },
  {
    id: 'synthwave',
    name: 'Synthwave & Cyberpunk',
    description: 'Retro night synthesizers and arps',
    color: 'from-neutral-600 to-neutral-900',
    gradient: 'linear-gradient(135deg, #333333 0%, #141414 100%)',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    trackCount: 4
  },
  {
    id: 'deephouse',
    name: 'Deep House & Club',
    description: 'Hypnotic 4/4 basslines and dark grooves',
    color: 'from-neutral-700 to-neutral-950',
    gradient: 'linear-gradient(135deg, #262626 0%, #0F0F0F 100%)',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    trackCount: 3
  },
  {
    id: 'ambient',
    name: 'Ambient & Drone',
    description: 'Ethereal soundscapes for deep focus & sleep',
    color: 'from-neutral-600 to-black',
    gradient: 'linear-gradient(135deg, #2D2D2D 0%, #101010 100%)',
    coverUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&auto=format&fit=crop&q=80',
    trackCount: 3
  },
  {
    id: 'acoustic',
    name: 'Acoustic & Folk',
    description: 'Warm fingerpicking guitars and organic warmth',
    color: 'from-neutral-700 to-stone-950',
    gradient: 'linear-gradient(135deg, #242424 0%, #0D0D0D 100%)',
    coverUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80',
    trackCount: 3
  },
  {
    id: 'classical',
    name: 'Neo-Classical Piano',
    description: 'Emotional solo piano and orchestral textures',
    color: 'from-neutral-700 to-zinc-950',
    gradient: 'linear-gradient(135deg, #282828 0%, #111111 100%)',
    coverUrl: 'https://images.unsplash.com/photo-1520523839898-5071282543e1?w=600&auto=format&fit=crop&q=80',
    trackCount: 3
  }
];

export const FEATURED_MIXES = [
  {
    id: 'mix-focus',
    title: 'Deep Coding & Flow',
    description: 'Minimalist ambient and dark synth rhythms with zero vocal distractions.',
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    trackIds: ['track-8', 'track-5', 'track-14', 'track-2', 'track-10'],
    followers: '24,800',
    accentColor: '#10B981'
  },
  {
    id: 'mix-midnight',
    title: 'Midnight Highway Drive',
    description: 'Cruising through the city lights with heavy synth and deep bass.',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    trackIds: ['track-4', 'track-5', 'track-7', 'track-11', 'track-6'],
    followers: '41,200',
    accentColor: '#EC4899'
  },
  {
    id: 'mix-chill',
    title: 'Coffee & Lo-Fi Horizons',
    description: 'Warm dusty vinyl vibes for sunny mornings and cozy evenings.',
    coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80',
    trackIds: ['track-1', 'track-3', 'track-2', 'track-15', 'track-16'],
    followers: '68,400',
    accentColor: '#F59E0B'
  }
];

/**
 * Format duration helper (seconds -> m:ss)
 */
export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};
