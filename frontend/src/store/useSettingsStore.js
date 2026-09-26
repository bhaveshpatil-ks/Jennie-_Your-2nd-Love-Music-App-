import { create } from 'zustand';

// Calculate approximate cache / localStorage footprint in MB
function calculateLocalStorageSize() {
  try {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += (localStorage[key].length + key.length) * 2;
      }
    }
    // Add simulated base app cache buffer
    const sizeMb = (total / (1024 * 1024) + 32.4).toFixed(1);
    return `${sizeMb} MB`;
  } catch (e) {
    return '34.2 MB';
  }
}

// Initial settings loaded from localStorage
const loadInitialSettings = () => {
  try {
    const raw = localStorage.getItem('jennie_user_settings');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    audioQuality: 'very_high', // 'auto' | 'normal' | 'high' | 'very_high' | 'lossless'
    dataSaver: false,
    autoplay: true,
    crossfade: 4, // 0 - 12 seconds
    normalizeVolume: true,
    automix: true,
    monoAudio: false,
    privateSession: false,
    listeningActivity: true,
    hifiStudioMaster: true,
    streamingBitrate: '320 kbps',
  };
};

export const useSettingsStore = create((set, get) => {
  const initial = loadInitialSettings();

  const persist = (updates) => {
    const current = get();
    const next = { ...current, ...updates };
    try {
      localStorage.setItem('jennie_user_settings', JSON.stringify({
        audioQuality: next.audioQuality,
        dataSaver: next.dataSaver,
        autoplay: next.autoplay,
        crossfade: next.crossfade,
        normalizeVolume: next.normalizeVolume,
        automix: next.automix,
        monoAudio: next.monoAudio,
        privateSession: next.privateSession,
        listeningActivity: next.listeningActivity,
        hifiStudioMaster: next.hifiStudioMaster,
        streamingBitrate: next.streamingBitrate,
      }));
    } catch (e) {}
  };

  return {
    ...initial,
    cacheSize: calculateLocalStorageSize(),

    setAudioQuality: (quality) => {
      const bitrates = {
        auto: 'Automatic (Adaptive)',
        normal: '160 kbps (Standard AAC)',
        high: '256 kbps (High Fidelity)',
        very_high: '320 kbps (Extreme Ultra)',
        lossless: '24-bit / 96kHz (Lossless FLAC Master)',
      };
      const updates = {
        audioQuality: quality,
        streamingBitrate: bitrates[quality] || '320 kbps',
      };
      persist(updates);
      set(updates);
    },

    toggleDataSaver: () => {
      const next = !get().dataSaver;
      const updates = { dataSaver: next };
      persist(updates);
      set(updates);
    },

    toggleAutoplay: () => {
      const next = !get().autoplay;
      const updates = { autoplay: next };
      persist(updates);
      set(updates);
    },

    setCrossfade: (seconds) => {
      const updates = { crossfade: Number(seconds) };
      persist(updates);
      set(updates);
    },

    toggleNormalizeVolume: () => {
      const next = !get().normalizeVolume;
      const updates = { normalizeVolume: next };
      persist(updates);
      set(updates);
    },

    toggleAutomix: () => {
      const next = !get().automix;
      const updates = { automix: next };
      persist(updates);
      set(updates);
    },

    toggleMonoAudio: () => {
      const next = !get().monoAudio;
      const updates = { monoAudio: next };
      persist(updates);
      set(updates);
    },

    togglePrivateSession: () => {
      const next = !get().privateSession;
      const updates = { privateSession: next };
      persist(updates);
      set(updates);
    },

    toggleListeningActivity: () => {
      const next = !get().listeningActivity;
      const updates = { listeningActivity: next };
      persist(updates);
      set(updates);
    },

    clearAppCache: () => {
      try {
        // Clear cached tracks and transient data without logging out
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('cache') || key.includes('temp') || key.includes('history'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch (e) {}
      set({ cacheSize: '0.0 MB' });
      return true;
    },
  };
});
