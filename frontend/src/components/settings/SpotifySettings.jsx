import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Shield,
  ShieldCheck,
  Check,
  Save,
  RefreshCw,
  Sliders,
  Volume2,
  Radio,
  Wifi,
  Trash2,
  LogOut,
  Database,
  Sparkles,
  ChevronRight,
  Info,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  X,
  Calendar,
  Layers,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useLibraryStore } from '../../store/useLibraryStore';

export function SpotifySettings({ onClose, onOpenCookieSettings }) {
  const {
    user,
    profile,
    signOutUser,
    updateProfileDetails,
    deleteAccountPermanently,
    authActionLoading,
    error,
    successMessage,
    clearAuthNotice,
  } = useAuthStore();

  const {
    audioQuality,
    setAudioQuality,
    dataSaver,
    toggleDataSaver,
    autoplay,
    toggleAutoplay,
    crossfade,
    setCrossfade,
    normalizeVolume,
    toggleNormalizeVolume,
    automix,
    toggleAutomix,
    monoAudio,
    toggleMonoAudio,
    privateSession,
    togglePrivateSession,
    listeningActivity,
    toggleListeningActivity,
    cacheSize,
    clearAppCache,
  } = useSettingsStore();

  const setActiveView = useLibraryStore((state) => state.setActiveView);

  // Profile editable fields
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editUsername, setEditUsername] = useState(profile?.username || user?.displayName || '');
  const [editGender, setEditGender] = useState(profile?.gender || 'prefer-not-to-say');
  const [editDob, setEditDob] = useState(profile?.dateOfBirth || '2000-01-01');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [cacheClearedNotice, setCacheClearedNotice] = useState(false);

  // Permanent Delete Modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    if (!editUsername.trim()) return;

    const ok = await updateProfileDetails({
      username: editUsername.trim(),
      gender: editGender,
      dateOfBirth: editDob,
    });

    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
      setIsEditingProfile(false);
    }
  };

  const handleClearCache = () => {
    clearAppCache();
    setCacheClearedNotice(true);
    setTimeout(() => setCacheClearedNotice(false), 3000);
  };

  const handleDeletePermanent = async () => {
    if (!confirmCheckbox) return;
    const ok = await deleteAccountPermanently();
    if (ok) {
      if (onClose) onClose();
      setActiveView('home');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-16 text-neutral-200">
      {/* ────────────────────────────────────────────────────────────
          PAGE HEADER
         ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-zinc-300" />
            <span>Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Audio fidelity, account identity, playback behavior, and DPDP Act privacy controls
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Global Alerts / Toasts */}
      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-luxury-fade">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Profile preferences saved successfully.</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between gap-2 animate-luxury-fade">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          {clearAuthNotice && (
            <button onClick={clearAuthNotice} className="text-xs hover:underline">
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
          SECTION 1: PROFILE & ACCOUNT (Spotify Header Card)
         ──────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1">
          Account &amp; Identity
        </h2>

        <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 backdrop-blur-md space-y-5">
          {/* User Profile Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-zinc-700 via-zinc-800 to-zinc-900 border border-zinc-700 text-zinc-100 font-bold text-xl flex items-center justify-center shrink-0 shadow-lg shadow-black/40">
                {(profile?.username || user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white truncate">
                    {profile?.username || user?.displayName || 'User'}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
                    {profile?.age_bracket || '18+'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    Free Hi-Fi
                  </span>
                </div>
                <p className="text-xs text-neutral-400 truncate mt-0.5 font-mono flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-neutral-500" />
                  {user?.email || 'Anonymous Listener'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-zinc-700/60 transition-all flex items-center gap-2 shadow-sm"
            >
              <User className="w-3.5 h-3.5" />
              <span>{isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
          </div>

          {/* Inline Edit Form */}
          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="pt-4 border-t border-zinc-800 space-y-4 animate-luxury-fade">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Username */}
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    minLength={3}
                    maxLength={20}
                    className="w-full px-3 py-2 bg-black/40 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-zinc-400 transition-colors"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">3–20 characters</p>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    Gender
                  </label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full px-3 py-2 bg-[#121214] border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-zinc-400 transition-colors"
                  >
                    <option value="prefer-not-to-say">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-Binary</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    max={todayStr}
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-zinc-400 transition-colors [color-scheme:dark]"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">DPDP Act legal age verification</p>
                </div>
              </div>

              {/* Security reassurance banner */}
              <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/60 text-[11px] text-neutral-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <span>
                  Date of birth is encrypted at rest using <strong className="text-white">AES-256-GCM</strong>. Your raw birthdate is never exposed to public profiles.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={authActionLoading || !editUsername.trim()}
                  className="px-5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-2 shadow-md shadow-white/5"
                >
                  {authActionLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-zinc-800/80 text-xs">
              <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                <span className="text-neutral-500 block text-[10px] uppercase">Plan</span>
                <span className="text-white font-semibold">Jennie Free • Hi-Fi</span>
              </div>
              <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                <span className="text-neutral-500 block text-[10px] uppercase">Age Tier</span>
                <span className="text-white font-semibold">{profile?.age_bracket || '18+ Verified'}</span>
              </div>
              <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                <span className="text-neutral-500 block text-[10px] uppercase">Gender</span>
                <span className="text-white font-semibold capitalize">
                  {profile?.gender ? profile.gender.replace('-', ' ') : 'Not Specified'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                <span className="text-neutral-500 block text-[10px] uppercase">Security</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> AES-256
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          SECTION 2: AUDIO FIDELITY & STREAMING QUALITY (Spotify-Style)
         ──────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1">
          Audio Quality &amp; Playback
        </h2>

        <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 backdrop-blur-md space-y-6">
          {/* Streaming Quality Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Streaming Quality</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Select your desired audio bitrate. Higher quality uses more network bandwidth.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700">
                {audioQuality === 'lossless'
                  ? 'FLAC 24-bit'
                  : audioQuality === 'very_high'
                  ? '320 kbps'
                  : audioQuality === 'high'
                  ? '256 kbps'
                  : audioQuality === 'normal'
                  ? '160 kbps'
                  : 'Adaptive'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {[
                { id: 'auto', label: 'Automatic', sub: 'Adaptive' },
                { id: 'normal', label: 'Normal', sub: '160 kbps' },
                { id: 'high', label: 'High', sub: '256 kbps' },
                { id: 'very_high', label: 'Very High', sub: '320 kbps' },
                { id: 'lossless', label: 'Lossless Hi-Fi', sub: 'Studio Master' },
              ].map((q) => (
                <button
                  key={q.id}
                  onClick={() => setAudioQuality(q.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    audioQuality === q.id
                      ? 'bg-zinc-100 text-zinc-950 border-white shadow-md shadow-white/5 font-semibold'
                      : 'bg-black/30 border-white/5 text-neutral-300 hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <span className="block text-xs font-semibold">{q.label}</span>
                  <span
                    className={`block text-[10px] mt-0.5 ${
                      audioQuality === q.id ? 'text-zinc-700 font-medium' : 'text-neutral-500'
                    }`}
                  >
                    {q.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-zinc-800" />

          {/* Autoplay Similar Songs */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Autoplay</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Keep listening to similar recommended songs when your music or playlist ends.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleAutoplay}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                autoplay ? 'bg-zinc-100' : 'bg-zinc-800 border border-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full transition-transform ${
                  autoplay ? 'translate-x-5 bg-black' : 'translate-x-0 bg-neutral-400'
                }`}
              />
            </button>
          </div>

          <div className="h-px bg-zinc-800" />

          {/* Crossfade Songs Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Crossfade</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Allows seamless crossfading transitions between consecutive tracks.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-zinc-300">
                {crossfade === 0 ? 'Off' : `${crossfade}s`}
              </span>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <span className="text-[10px] text-neutral-500 font-mono">0s (Off)</span>
              <input
                type="range"
                min="0"
                max="12"
                step="1"
                value={crossfade}
                onChange={(e) => setCrossfade(e.target.value)}
                className="w-full accent-zinc-200 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-neutral-500 font-mono">12s</span>
            </div>
          </div>

          <div className="h-px bg-zinc-800" />

          {/* Automix & Smooth Transitions */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Automix</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Enables smooth beatmatched transitions between tracks in curated mixes.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleAutomix}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                automix ? 'bg-zinc-100' : 'bg-zinc-800 border border-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full transition-transform ${
                  automix ? 'translate-x-5 bg-black' : 'translate-x-0 bg-neutral-400'
                }`}
              />
            </button>
          </div>

          <div className="h-px bg-zinc-800" />

          {/* Normalize Volume */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Normalize Volume</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Maintains a consistent volume level across loud and quiet tracks.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleNormalizeVolume}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                normalizeVolume ? 'bg-zinc-100' : 'bg-zinc-800 border border-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full transition-transform ${
                  normalizeVolume ? 'translate-x-5 bg-black' : 'translate-x-0 bg-neutral-400'
                }`}
              />
            </button>
          </div>

          <div className="h-px bg-zinc-800" />

          {/* Mono Audio */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Mono Audio</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Combines stereo channels into both left and right speakers for single-earbud listening.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleMonoAudio}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                monoAudio ? 'bg-zinc-100' : 'bg-zinc-800 border border-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full transition-transform ${
                  monoAudio ? 'translate-x-5 bg-black' : 'translate-x-0 bg-neutral-400'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          SECTION 3: PRIVACY & SOCIAL (Spotify Private Session)
         ──────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1">
          Privacy &amp; Social
        </h2>

        <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 backdrop-blur-md space-y-6">
          {/* Private Session Toggle */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">Private Session</h3>
                {privateSession && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                    Incognito Active
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Listen anonymously. What you stream during a private session will not affect your taste recommendations or be saved to public history.
              </p>
            </div>
            <button
              type="button"
              onClick={togglePrivateSession}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                privateSession ? 'bg-zinc-100' : 'bg-zinc-800 border border-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full transition-transform ${
                  privateSession ? 'translate-x-5 bg-black' : 'translate-x-0 bg-neutral-400'
                }`}
              />
            </button>
          </div>

          <div className="h-px bg-zinc-800" />

          {/* Listening Activity Toggle */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Publish Listening Activity</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Display what songs and artists you stream on your public Jennie profile.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleListeningActivity}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                listeningActivity ? 'bg-zinc-100' : 'bg-zinc-800 border border-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full transition-transform ${
                  listeningActivity ? 'translate-x-5 bg-black' : 'translate-x-0 bg-neutral-400'
                }`}
              />
            </button>
          </div>

          <div className="h-px bg-zinc-800" />

          {/* DPDP Act 2023 Statutory Privacy & Cookie Management */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">DPDP Act 2023 Statutory Rights</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Your data is protected under India's Digital Personal Data Protection Act, 2023. Zero ad tracking.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {onOpenCookieSettings && (
                <button
                  type="button"
                  onClick={onOpenCookieSettings}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-white text-xs font-medium border border-zinc-700 transition-colors"
                >
                  Manage Cookie Settings
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                  setActiveView('privacy');
                }}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium border border-white/10 transition-colors flex items-center gap-1.5"
              >
                <span>Read DPDP Privacy Policy</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                  setActiveView('terms');
                }}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium border border-white/10 transition-colors flex items-center gap-1.5"
              >
                <span>Terms of Service</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          SECTION 4: STORAGE & CACHE (Spotify-Style Storage Bar)
         ──────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1">
          Storage &amp; Cache
        </h2>

        <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-zinc-400" />
                <span>Cached Data &amp; Audio Buffer</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Clearing your cache will not delete your saved playlists, likes, or account identity.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-zinc-300 bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-700">
              {cacheSize}
            </span>
          </div>

          {/* Visual Storage Bar */}
          <div className="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden flex">
            <div className="h-full bg-zinc-400 w-[22%]" title="App Code & Assets (22%)" />
            <div className="h-full bg-zinc-600 w-[14%]" title="Audio Buffer & Cache (14%)" />
            <div className="h-full bg-zinc-800 w-[64%]" title="Free Storage (64%)" />
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-400 inline-block" /> App Engine
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-600 inline-block" /> Cached Audio
              </span>
            </div>

            <button
              type="button"
              onClick={handleClearCache}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-white text-xs font-semibold border border-zinc-700 transition-colors"
            >
              Clear Cache
            </button>
          </div>

          {cacheClearedNotice && (
            <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-1 animate-luxury-fade">
              <Check className="w-3.5 h-3.5" /> Cache buffer cleaned successfully.
            </p>
          )}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          SECTION 5: ACCOUNT ACTIONS & DANGER ZONE
         ──────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1">
          Account Actions &amp; Security
        </h2>

        <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 backdrop-blur-md space-y-5">
          {/* Sign Out Action */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Sign Out</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Sign out of your Jennie session on this browser.
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                await signOutUser();
                if (onClose) onClose();
                setActiveView('home');
              }}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-white text-xs font-semibold border border-zinc-700 transition-all flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="h-px bg-zinc-800" />

          {/* Danger Zone: Permanent Account Deletion */}
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-semibold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>Danger Zone • DPDP Act Section 12 Right to Erasure</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Permanently delete your account, listening history, and encrypted personal data. This statutory erasure is irreversible.
            </p>

            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="py-2 px-3.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-semibold border border-red-500/30 transition-all flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Permanently Delete Account</span>
            </button>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          DELETE ACCOUNT CONFIRMATION MODAL
         ──────────────────────────────────────────────────────────── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-zinc-900 border border-red-500/30 shadow-2xl space-y-4 text-center animate-luxury-fade">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">Permanently Delete Account?</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Under Section 12 of India's <strong className="text-white">DPDP Act, 2023</strong> (Right to Erasure), all your account data, credentials, and encrypted records will be deleted immediately.
              </p>
            </div>

            <label className="flex items-start gap-2.5 text-left cursor-pointer p-2.5 rounded-lg bg-black/40 border border-white/5">
              <input
                type="checkbox"
                checked={confirmCheckbox}
                onChange={(e) => setConfirmCheckbox(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-red-500 focus:ring-red-500 accent-red-500 cursor-pointer shrink-0"
              />
              <span className="text-xs text-neutral-300 leading-tight">
                I understand this action is permanent and irrevocably purges my account and playlists.
              </span>
            </label>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleDeletePermanent}
                disabled={authActionLoading || !confirmCheckbox}
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs tracking-wider uppercase transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
              >
                {authActionLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Confirm Permanent Erasure
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-xs font-medium transition-colors"
              >
                Cancel &amp; Keep Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
