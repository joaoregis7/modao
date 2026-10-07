import React, { useState } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
  ListMusic,
  Car,
  Volume2,
  VolumeX,
  ArrowDownToLine,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { useAudioProgress } from '../../hooks/useAudioProgress';

export const FullPlayerModal: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    isShuffle,
    isRepeat,
    volume,
    isFullPlayerOpen,
    closeFullPlayer,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    toggleFavorite,
    isFavorite,
    isDownloaded,
    downloadTrack,
    removeDownloadedTrack,
    openQueue,
    openCarMode,
    queue,
  } = useAudioPlayer();

  const { currentTime, duration } = useAudioProgress();

  const [isDownloading, setIsDownloading] = useState(false);

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekVal, setSeekVal] = useState(0);

  if (!isFullPlayerOpen || !currentTrack) return null;

  const favorited = isFavorite(currentTrack.id);

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || sec < 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSeeking(true);
    setSeekVal(Number(e.target.value));
  };

  const handleSeekCommit = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    setIsSeeking(false);
    seek(seekVal);
  };

  const displayedCurrentTime = isSeeking ? seekVal : currentTime;
  const progressRatio = duration > 0 ? (displayedCurrentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex flex-col bg-[#121212] animate-in fade-in zoom-in-95 duration-200">
      {/* Blurred Album Artwork Background with Dark Gradient Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-25 scale-125 transform pointer-events-none"
        style={{ backgroundImage: `url(${currentTrack.coverUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/80 via-[#121212]/95 to-[#121212] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col justify-between max-w-xl md:max-w-5xl mx-auto w-full px-6 py-4 sm:py-6 md:py-8 pb-safe">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={closeFullPlayer}
            className="p-2.5 rounded-full text-[#A7A7A7] hover:text-[#FAF7F2] hover:bg-[#242424]/80 transition active:scale-95"
            aria-label="Minimizar player"
            title="Minimizar (Esc)"
          >
            <ChevronDown className="w-7 h-7" />
          </button>

          <div className="text-center">
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#C98A2E]">
              Tocando agora
            </span>
            <p className="text-xs text-[#A7A7A7] font-medium">
              {currentTrack.genre || 'Rádio Modão'}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={openQueue}
              className="p-2.5 rounded-full text-[#A7A7A7] hover:text-[#C98A2E] hover:bg-[#242424]/80 transition active:scale-95"
              title="Fila de músicas"
              aria-label="Fila de músicas"
            >
              <ListMusic className="w-5 h-5 text-[#C98A2E]" />
            </button>

            <button
              onClick={() => {
                closeFullPlayer();
                openCarMode();
              }}
              className="p-2.5 rounded-full text-[#D97706] hover:bg-[#D97706]/10 transition active:scale-95"
              title="Abrir Modo Estrada"
              aria-label="Modo Estrada"
            >
              <Car className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP (md:grid) & MOBILE (flex-col) DUAL RESPONSIVE MIDDLE SECTION       */}
        {/* ========================================================================= */}
        <div className="my-auto py-2 sm:py-4 md:py-8 md:grid md:grid-cols-2 md:gap-12 md:items-center">
          {/* Left Column: Big Album Art */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-48 h-48 xs:w-56 xs:h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 max-h-[38vh] md:max-h-[50vh] aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-black/90 border border-[#3A3A3A] shrink transition-all group">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              {/* Subtle vinyl groove overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/10 pointer-events-none" />
            </div>
          </div>

          {/* Right Column (on desktop) / Bottom section (on mobile): Info & Controls */}
          <div className="flex flex-col justify-center space-y-4 md:space-y-6 mt-4 md:mt-0">
            {/* Song info & Favorite & Download buttons */}
            <div className="w-full flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="hidden md:inline-flex px-2.5 py-0.5 rounded-full bg-[#C98A2E]/20 text-[#C98A2E] text-[11px] font-bold uppercase tracking-wider mb-2">
                  {currentTrack.genre || 'Modão Sertanejo'}
                </span>
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#FAF7F2] truncate tracking-tight">
                  {currentTrack.title}
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-[#C98A2E] font-medium truncate mt-1">
                  {currentTrack.artist}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={async () => {
                    if (isDownloading) return;
                    if (isDownloaded(currentTrack.id)) {
                      await removeDownloadedTrack(currentTrack.id);
                    } else {
                      setIsDownloading(true);
                      try {
                        await downloadTrack(currentTrack);
                      } finally {
                        setIsDownloading(false);
                      }
                    }
                  }}
                  className={`p-3 rounded-full transition active:scale-75 ${
                    isDownloaded(currentTrack.id)
                      ? 'text-emerald-400 hover:text-emerald-300'
                      : 'text-[#777777] hover:text-[#C98A2E]'
                  }`}
                  aria-label={isDownloaded(currentTrack.id) ? 'Salva no aparelho' : 'Baixar no aparelho'}
                  title={isDownloaded(currentTrack.id) ? 'Salva no aparelho (toca offline)' : 'Baixar para ouvir offline no app'}
                >
                  {isDownloading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-[#C98A2E]" />
                  ) : isDownloaded(currentTrack.id) ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <ArrowDownToLine className="w-6 h-6" />
                  )}
                </button>

                <button
                  onClick={() => toggleFavorite(currentTrack.id)}
                  className={`p-3 rounded-full transition active:scale-75 ${
                    favorited ? 'text-red-500' : 'text-[#777777] hover:text-[#FAF7F2]'
                  }`}
                  aria-label={favorited ? 'Desfavoritar' : 'Favoritar'}
                >
                  <Heart className={`w-7 h-7 sm:w-8 sm:h-8 ${favorited ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Progress Bar & Timing */}
            <div className="space-y-2">
              <div className="relative w-full flex items-center">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={1}
                  value={displayedCurrentTime}
                  onChange={handleSeekChange}
                  onMouseUp={handleSeekCommit}
                  onTouchEnd={handleSeekCommit}
                  className="w-full h-2 bg-[#2E2E2E] rounded-lg appearance-none cursor-pointer accent-[#C98A2E] focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, #C98A2E 0%, #D97706 ${progressRatio}%, #2A2A2A ${progressRatio}%, #2A2A2A 100%)`,
                  }}
                  aria-label="Posição da música"
                />
              </div>

              <div className="flex justify-between text-xs sm:text-sm font-medium text-[#A7A7A7]">
                <span>{formatSeconds(displayedCurrentTime)}</span>
                <span>{formatSeconds(duration)}</span>
              </div>
            </div>

            {/* Primary Controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={toggleShuffle}
                className={`p-2.5 sm:p-3 rounded-full transition active:scale-90 ${
                  isShuffle ? 'text-[#C98A2E]' : 'text-[#777777] hover:text-[#FAF7F2]'
                }`}
                aria-label="Modo aleatório"
              >
                <Shuffle className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <button
                onClick={previousTrack}
                className="p-2.5 sm:p-4 rounded-full text-[#FAF7F2] hover:text-[#C98A2E] transition active:scale-90"
                aria-label="Música anterior"
              >
                <SkipBack className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 fill-current" />
              </button>

              {/* Play/Pause button */}
              <button
                onClick={togglePlayPause}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-[#C98A2E] to-[#D97706] text-black flex items-center justify-center shadow-xl shadow-[#C98A2E]/25 hover:brightness-110 active:scale-95 transition shrink-0"
                aria-label={isPlaying ? 'Pausar' : 'Tocar'}
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 sm:w-9 sm:h-9 fill-current" />
                ) : (
                  <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-current ml-1" />
                )}
              </button>

              <button
                onClick={nextTrack}
                className="p-2.5 sm:p-4 rounded-full text-[#FAF7F2] hover:text-[#C98A2E] transition active:scale-90"
                aria-label="Próxima música"
              >
                <SkipForward className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 fill-current" />
              </button>

              <button
                onClick={toggleRepeat}
                className={`p-2.5 sm:p-3 rounded-full transition active:scale-90 ${
                  isRepeat ? 'text-[#C98A2E]' : 'text-[#777777] hover:text-[#FAF7F2]'
                }`}
                aria-label="Repetir música"
              >
                <Repeat className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Bottom Options: Volume & Queue */}
            <div className="flex items-center justify-between pt-3 pb-1 border-t border-[#242424] gap-3">
              {/* Volume Control */}
              <div className="flex items-center gap-2 flex-1 max-w-[140px] sm:max-w-[200px]">
                <button
                  onClick={() => setVolume(volume > 0 ? 0 : 0.9)}
                  className="p-1 text-[#A7A7A7] hover:text-[#FAF7F2] transition"
                  aria-label="Mudo"
                >
                  {volume === 0 ? (
                    <VolumeX className="w-5 h-5 text-red-400" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer accent-[#C98A2E]"
                  aria-label="Controle de volume"
                />
              </div>

              {/* Queue toggle */}
              <button
                onClick={openQueue}
                className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] active:scale-95 text-xs sm:text-sm font-bold text-[#FAF7F2] border border-[#333333] transition shadow-md shrink-0"
              >
                <ListMusic className="w-4 h-4 text-[#C98A2E]" />
                <span>Fila ({queue.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
