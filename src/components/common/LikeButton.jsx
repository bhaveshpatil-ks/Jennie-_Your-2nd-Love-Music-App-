import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';

export const LikeButton = ({ trackId, size = 18, className = '' }) => {
  const isLiked = useLibraryStore((state) => state.isLiked(trackId));
  const toggleLike = useLibraryStore((state) => state.toggleLike);

  const handleClick = (e) => {
    e.stopPropagation();
    toggleLike(trackId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isLiked ? 'Remove from favorites' : 'Save to favorites'}
      aria-pressed={isLiked}
      title={isLiked ? 'Remove from Favorites' : 'Save to Favorites'}
      className={`p-2 rounded-full text-neutral-400 hover:text-white transition-opacity active:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${className}`}
    >
      <Heart
        size={size}
        className={`transition-colors duration-300 ${
          isLiked
            ? 'fill-white text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]'
            : 'text-neutral-400 hover:text-white'
        }`}
      />
    </button>
  );
};
