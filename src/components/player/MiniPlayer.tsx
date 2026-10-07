import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, Maximize2, ListMusic } from 'lucide-react';
import { useAudioPlayer } from '../../context/AudioPlayerContext';

export const MiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    nextTrack,
    previousTrack,
    toggleFavorite,
    isFavorite,
    openFullPlayer,
    openQueue,
  } = useAudioPlayer();

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const favorited = isFavorite(currentTrack.id);

  return (
    <div
      onClick={openFullPlayer}
      className="fixed left-0 right-0 z-30 md:bottom-0 bottom-16 bg-[#1B1B1B]/95 backdrop-blur-xl border-t border-[#2A2A2A] shadow-2xl transition-all cursor-pointer group select-none"
    >
      {/* Real-time mini progress line at top of player */}
      <div className="w-full h-1 bg-[#2E2E2E]">
        <div
          className="h-full bg-gradient-to-r from-[#C98A2E] to-[#D97706] transition-all duration-200"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Track Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 bg-[#242424] shadow-md border border-[#333333]">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover group-hover:scale-105 transition"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-heading font-bold text-sm sm:text-base text-[#FAF7F2] truncate group-hover:text-[#C98A2E] transition">
              {currentTrack.title}
            </h4>
            <p className="text-xs sm:text-sm text-[#A7A7A7] truncate">
              {currentTrack.artist}
            </p>
          </div>

          {/* Quick Favorite */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(currentTrack.id);
            }}
            className={`p-2 rounded-full hidden xs:flex transition active:scale-75 ${
              favorited ? 'text-red-500' : 'text-[#777777] hover:text-white'
            }`}
            aria-label="Favoritar"
          >
            <Heart className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Media Controls */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0" onClick={e => e.stopPropagation()}>
          <button
            type="button"
            onClick={previousTrack}
            className="p-2 sm:p-2.5 rounded-full text-[#A7A7A7] hover:text-[#FAF7F2] hover:bg-[#242424] transition active:scale-90"
            aria-label="Música anterior"
          >
            <SkipBack className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
          </button>

          <button
            type="button"
            onClick={togglePlayPause}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-[#C98A2E] to-[#D97706] text-black flex items-center justify-center shadow-lg hover:brightness-110 active:scale-95 transition"
            aria-label={isPlaying ? 'Pausar música' : 'Tocar música'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            ) : (
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={nextTrack}
            className="p-2 sm:p-2.5 rounded-full text-[#A7A7A7] hover:text-[#FAF7F2] hover:bg-[#242424] transition active:scale-90"
            aria-label="Próxima música"
          >
            <SkipForward className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
          </button>

          {/* Quick Queue toggle */}
          <button
            type="button"
            onClick={openQueue}
            className="p-2 sm:p-2.5 rounded-full text-[#A7A7A7] hover:text-[#C98A2E] hover:bg-[#242424] transition active:scale-90"
            aria-label="Fila de reprodução"
            title="Fila de reprodução"
          >
            <ListMusic className="w-5 h-5 text-[#C98A2E]" />
          </button>

          {/* Expand Full Player Button */}
          <button
            type="button"
            onClick={openFullPlayer}
            className="p-2 sm:p-2.5 rounded-full text-[#A7A7A7] hover:text-[#FAF7F2] hover:bg-[#242424] transition hidden sm:flex"
            aria-label="Expandir player"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
