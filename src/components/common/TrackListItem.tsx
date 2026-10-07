import React, { useState } from 'react';
import { Play, Pause, Heart, Volume2, ArrowDownToLine, CheckCircle2, Loader2 } from 'lucide-react';
import { Track } from '../../types';
import { useAudioPlayer } from '../../context/AudioPlayerContext';

interface TrackListItemProps {
  track: Track;
  index?: number;
  showIndex?: boolean;
  onPlay?: () => void;
  playlistContext?: Track[];
}

export const TrackListItem: React.FC<TrackListItemProps> = ({
  track,
  index,
  showIndex = false,
  onPlay,
  playlistContext,
}) => {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
    isFavorite,
    toggleFavorite,
    isDownloaded,
    downloadTrack,
    removeDownloadedTrack,
  } = useAudioPlayer();

  const [isDownloading, setIsDownloading] = useState(false);

  const isCurrent = currentTrack?.id === track.id;
  const isCurrentPlaying = isCurrent && isPlaying;
  const favorited = isFavorite(track.id);
  const downloaded = isDownloaded(track.id);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlayPause();
    } else {
      if (onPlay) {
        onPlay();
      } else {
        playTrack(track, playlistContext);
      }
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(track.id);
  };

  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloading) return;

    if (downloaded) {
      // Toggle remove to free device storage
      await removeDownloadedTrack(track.id);
    } else {
      setIsDownloading(true);
      try {
        await downloadTrack(track);
      } finally {
        setIsDownloading(false);
      }
    }
  };

  return (
    <div
      onClick={handlePlayClick}
      className={`group flex items-center justify-between p-3 sm:p-3.5 rounded-2xl transition cursor-pointer select-none border ${
        isCurrent
          ? 'bg-[#242424] border-[#C98A2E]/60 shadow-md shadow-[#C98A2E]/5'
          : 'bg-[#1B1B1B]/60 hover:bg-[#242424] border-transparent hover:border-[#333333]'
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        {showIndex && (
          <div className="w-6 text-center font-heading font-bold text-sm sm:text-base text-[#A7A7A7] shrink-0">
            {isCurrentPlaying ? (
              <Volume2 className="w-4 h-4 mx-auto text-[#C98A2E] animate-pulse" />
            ) : (
              (index !== undefined ? index + 1 : '')
            )}
          </div>
        )}

        {/* Cover Art with quick play overlay */}
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 bg-[#242424] shadow-sm">
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
          <div
            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition ${
              isCurrent ? 'opacity-100 bg-black/60' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            {isCurrentPlaying ? (
              <Pause className="w-5 h-5 text-[#C98A2E] fill-current" />
            ) : (
              <Play className="w-5 h-5 text-[#FAF7F2] fill-current ml-0.5" />
            )}
          </div>
        </div>

        {/* Text Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4
              className={`font-semibold text-sm sm:text-base truncate leading-snug ${
                isCurrent ? 'text-[#C98A2E]' : 'text-[#FAF7F2]'
              }`}
            >
              {track.title}
            </h4>
            {downloaded && (
              <span
                title="Salva no aparelho para ouvir offline dentro do app"
                className="shrink-0"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#A7A7A7] truncate mt-0.5">
            {track.artist}
          </p>
        </div>
      </div>

      {/* Right Actions: Genre badge, Duration, Download & Favorite button */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-2">
        {track.genre && (
          <span className="hidden xl:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#262626] text-[#A7A7A7] border border-[#333333] max-w-[120px] truncate">
            {track.genre}
          </span>
        )}

        <span className="text-xs text-[#A7A7A7] font-medium hidden sm:inline tabular-nums">
          {track.durationFormatted}
        </span>

        {/* Baixar para ouvir offline no app */}
        <button
          type="button"
          onClick={handleDownloadClick}
          aria-label={downloaded ? 'Música salva no aparelho' : 'Baixar para ouvir offline no app'}
          title={downloaded ? 'Salva no aparelho (toca offline na plataforma)' : 'Baixar para ouvir offline dentro do app'}
          className={`p-1.5 rounded-full transition active:scale-75 ${
            downloaded
              ? 'text-emerald-400 hover:text-red-400'
              : 'text-[#666666] hover:text-[#C98A2E]'
          }`}
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#C98A2E]" />
          ) : downloaded ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <ArrowDownToLine className="w-4 h-4" />
          )}
        </button>

        {/* Favorito */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          className={`p-1.5 rounded-full transition active:scale-75 ${
            favorited
              ? 'text-red-500 hover:text-red-400'
              : 'text-[#666666] hover:text-[#FAF7F2]'
          }`}
        >
          <Heart
            className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`}
          />
        </button>

        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={handlePlayClick}
          aria-label={isCurrentPlaying ? 'Pausar' : 'Tocar'}
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition active:scale-95 shrink-0 ${
            isCurrentPlaying
              ? 'bg-[#C98A2E] text-black shadow-md'
              : 'bg-[#2A2A2A] text-[#FAF7F2] hover:bg-[#C98A2E] hover:text-black'
          }`}
        >
          {isCurrentPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
};
