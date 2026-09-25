import React, { useState, useEffect, useRef } from 'react';
import { X, Music2, Plus, ShieldCheck } from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';

export const CreatePlaylistModal = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hasConsent, setHasConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);

  const titleInputRef = useRef(null);
  const createPlaylist = useLibraryStore((state) => state.createPlaylist);
  const setActiveView = useLibraryStore((state) => state.setActiveView);

  // Keyboard accessibility: handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Auto-focus title input when modal opens
      setTimeout(() => {
        if (titleInputRef.current) titleInputRef.current.focus();
      }, 50);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (!hasConsent) {
      setConsentError(true);
      return;
    }

    const newPlaylist = createPlaylist(title.trim(), description.trim());
    setTitle('');
    setDescription('');
    setHasConsent(false);
    setConsentError(false);
    onClose();
    setActiveView('playlist', newPlaylist);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-playlist-title"
      aria-describedby="create-playlist-desc"
    >
      <div 
        className="w-full max-w-md bg-[#161616] border border-white/10 rounded-2xl p-6 shadow-2xl relative animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accessible Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
            <Music2 size={20} />
          </div>
          <div>
            <h2 id="create-playlist-title" className="text-lg font-bold text-white">
              Create New Playlist
            </h2>
            <p id="create-playlist-desc" className="text-xs text-neutral-400">
              Curate your personal royalty-free collection
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="playlist-title"
              className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
            >
              Playlist Name <span className="text-amber-400" aria-hidden="true">*</span>
              <span className="sr-only">(Required)</span>
            </label>
            <input
              ref={titleInputRef}
              id="playlist-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Noir Beats, Study Sessions"
              required
              aria-required="true"
              maxLength={80}
              className="w-full px-3.5 py-2.5 bg-[#202020] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors placeholder:text-neutral-500"
            />
          </div>

          <div>
            <label
              htmlFor="playlist-desc"
              className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
            >
              Description <span className="text-neutral-500 text-[11px] normal-case">(Optional)</span>
            </label>
            <textarea
              id="playlist-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add an optional description for this mix..."
              rows={3}
              maxLength={250}
              className="w-full px-3.5 py-2.5 bg-[#202020] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors placeholder:text-neutral-500 resize-none"
            />
          </div>

          {/* Form Consent Checkbox (DPDP Act & Privacy Requirement) */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-neutral-300 select-none">
              <input
                type="checkbox"
                checked={hasConsent}
                onChange={(e) => {
                  setHasConsent(e.target.checked);
                  if (e.target.checked) setConsentError(false);
                }}
                className="mt-0.5 w-4 h-4 rounded bg-[#202020] border-white/20 text-white focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
              />
              <span className="leading-tight">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setActiveView('terms');
                  }}
                  className="text-white underline hover:text-neutral-200"
                >
                  Terms
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setActiveView('privacy');
                  }}
                  className="text-white underline hover:text-neutral-200"
                >
                  Privacy Policy
                </button>
                , and consent to minimal storage of this playlist.
              </span>
            </label>
            {consentError && (
              <p role="alert" className="text-red-400 text-[11px] mt-1.5 font-medium pl-6">
                Please check the consent box to proceed.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !hasConsent}
              aria-label="Create new playlist"
              className="px-5 py-2 rounded-xl text-sm font-bold bg-white hover:bg-neutral-200 text-black shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Plus size={16} />
              <span>Create Playlist</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
