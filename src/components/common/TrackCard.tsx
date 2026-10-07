import React, { useState } from 'react';
import {
  Play,
  Pause,
  Heart,
  Volume2,
  ArrowDownToLine,
  CheckCircle2,
  Loader2,
  Music2,
} from 'lucide-react';
import { Track } from '../../types';
import { useAudioPlayer } from '../../context/AudioPlayerContext';

interface TrackCardProps {
  track: Track;
  index?: number;
  onPlay?: () => void;
  playlistContext?: Track[];
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  index,
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
      className={`group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 transition-all duration-300 cursor-pointer select-none border ${
        isCurrent
          ? 'bg-gradient-to-b from-[#2C241B] via-[#201D19] to-[#161514] border-[#C98A2E] shadow-xl shadow-[#C98A2E]/20 ring-1 ring-[#C98A2E]/60 -translate-y-0.5'
          : 'bg-gradient-to-b from-[#222222] via-[#1B1B1B] to-[#141414] hover:bg-gradient-to-b hover:from-[#282828] hover:via-[#202020] hover:to-[#171717] border-[#2C2C2C] hover:border-[#C98A2E]/60 hover:shadow-2xl hover:shadow-[#C98A2E]/10 hover:-translate-y-1'
      }`}
    >
      {/* Top Section: Album Cover with Overlay & Status Badges */}
      <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#242424] mb-3 shadow-md ring-1 ring-white/10 group-hover:ring-[#C98A2E]/40 transition-all duration-300">
        <img
          src={track.coverUrl}
          alt={track.title}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Ambient Cover Overlay on Hover / Playing */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center transition-opacity duration-200 ${
            isCurrent ? 'opacity-100 bg-black/50' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <div
            className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-90 ${
              isCurrentPlaying
                ? 'bg-gradient-to-tr from-[#F59E0B] to-[#C98A2E] text-black scale-100 shadow-[#C98A2E]/40'
                : 'bg-gradient-to-tr from-[#F59E0B] to-[#C98A2E] text-black group-hover:scale-105 hover:brightness-110 shadow-[#C98A2E]/40'
            }`}
          >
            {isCurrentPlaying ? (
              <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            ) : (
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
            )}
          </div>
        </div>

        {/* Top Badges (Playing Equalizer, Saved indicator, Index) */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          {isCurrentPlaying ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/85 backdrop-blur-md text-[#F59E0B] text-[10px] font-black uppercase tracking-wider border border-[#F59E0B]/50 shadow-md">
              <span className="flex items-end gap-0.5 h-2.5">
                <span className="w-0.5 h-2 bg-[#F59E0B] animate-bounce" />
                <span className="w-0.5 h-3 bg-[#F59E0B] animate-bounce delay-100" />
                <span className="w-0.5 h-1.5 bg-[#F59E0B] animate-bounce delay-200" />
              </span>
              Tocando
            </span>
          ) : index !== undefined ? (
            <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[#B0B0B0] text-[10px] font-mono font-bold border border-white/5">
              #{index + 1}
            </span>
          ) : (
            <span />
          )}

          {downloaded && (
            <span
              title="Salva no aparelho"
              className="p-1 rounded-full bg-black/80 backdrop-blur-md text-emerald-400 border border-emerald-500/40 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        {/* Bottom Duration pill on cover */}
        <div className="absolute bottom-2 right-2 pointer-events-none">
          <span className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[#FAF7F2] text-[10px] font-semibold tabular-nums border border-white/10 shadow-sm">
            {track.durationFormatted}
          </span>
        </div>
      </div>

      {/* Track Details */}
      <div className="min-w-0 flex-1">
        <h4
          className={`font-heading font-black text-sm sm:text-base truncate leading-snug group-hover:text-[#F59E0B] transition-colors ${
            isCurrent ? 'text-[#F59E0B]' : 'text-[#FAF7F2]'
          }`}
          title={track.title}
        >
          {track.title}
        </h4>
        <p
          className="text-xs text-[#A3A3A3] truncate mt-1 font-medium"
          title={track.artist}
        >
          {track.artist}
        </p>
      </div>

      {/* Footer Info: Genre badge & Action Buttons */}
      <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-[#292929] text-xs text-[#A7A7A7]">
        <span className="inline-block px-2 py-0.5 rounded-md bg-[#222222] text-[10px] font-semibold text-[#8E8E8E] border border-[#2E2E2E] truncate max-w-[95px] sm:max-w-[120px]">
          {track.genre || 'Modão Raiz'}
        </span>

        <div className="flex items-center gap-1">
          {/* Favorite Button */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            className={`p-1.5 rounded-full hover:bg-[#2C2C2C] active:scale-75 transition ${
              favorited ? 'text-red-500' : 'text-[#777777] hover:text-[#FAF7F2]'
            }`}
            title={favorited ? 'Remover dos favoritos' : 'Favoritar modão'}
            aria-label="Favoritar"
          >
            <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
          </button>

          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownloadClick}
            className={`p-1.5 rounded-full hover:bg-[#2C2C2C] active:scale-75 transition ${
              downloaded
                ? 'text-emerald-400'
                : 'text-[#777777] hover:text-[#C98A2E]'
            }`}
            title={
              downloaded
                ? 'Salva no aparelho (toque para remover)'
                : 'Baixar para ouvir offline'
            }
            aria-label="Baixar modão"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#C98A2E]" />
            ) : downloaded ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <ArrowDownToLine className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
