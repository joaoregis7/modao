import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Maximize2,
  ListMusic,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Car,
  CheckCircle2,
  ArrowDownToLine,
  Loader2,
} from 'lucide-react';
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
    isShuffle,
    toggleShuffle,
    isRepeat,
    toggleRepeat,
    volume,
    setVolume,
    seek,
    openCarMode,
    isDownloaded,
    downloadTrack,
    removeDownloadedTrack,
    queue,
  } = useAudioPlayer();

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekVal, setSeekVal] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!currentTrack) return null;

  const favorited = isFavorite(currentTrack.id);
  const downloaded = isDownloaded(currentTrack.id);

  const displayedTime = isSeeking ? seekVal : currentTime;
  const progressPercent = duration > 0 ? (displayedTime / duration) * 100 : 0;

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

  const handleSeekCommit = () => {
    setIsSeeking(false);
    seek(seekVal);
  };

  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloading) return;
    if (downloaded) {
      await removeDownloadedTrack(currentTrack.id);
    } else {
      setIsDownloading(true);
      try {
        await downloadTrack(currentTrack);
      } finally {
        setIsDownloading(false);
      }
    }
  };

  return (
    <>
      {/* ========================================================= */}
      {/* 1. DESKTOP PLAYER BAR (md:flex) - Fixed Bottom Dock       */}
      {/* ========================================================= */}
      <div className="hidden md:flex items-center justify-between w-full h-[88px] px-4 lg:px-8 bg-[#181818] border-t border-[#262626] shadow-2xl z-40 select-none shrink-0 relative">
        {/* Real-time progress line at top edge */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#2A2A2A]">
          <div
            className="h-full bg-gradient-to-r from-[#C98A2E] to-[#D97706] transition-all duration-150"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* LEFT SECTION: Track Info & Quick Actions */}
        <div className="flex items-center gap-3 w-auto min-w-[160px] max-w-[240px] lg:max-w-[320px]">
          <div
            onClick={openFullPlayer}
            className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 bg-[#242424] shadow-md border border-[#333333] cursor-pointer group"
            title="Expandir capa e letra"
          >
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h4
              onClick={openFullPlayer}
              className="font-heading font-bold text-sm text-[#FAF7F2] truncate hover:text-[#C98A2E] transition cursor-pointer leading-tight"
              title={currentTrack.title}
            >
              {currentTrack.title}
            </h4>
            <p className="text-xs text-[#A7A7A7] truncate mt-0.5" title={currentTrack.artist}>
              {currentTrack.artist}
            </p>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            {/* Favorite button */}
            <button
              type="button"
              onClick={() => toggleFavorite(currentTrack.id)}
              className={`p-1.5 sm:p-2 rounded-full transition active:scale-75 ${
                favorited ? 'text-red-500' : 'text-[#777777] hover:text-[#FAF7F2]'
              }`}
              aria-label={favorited ? 'Desfavoritar' : 'Favoritar'}
              title={favorited ? 'Remover dos favoritos' : 'Favoritar modão'}
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
            </button>

            {/* Offline download status button */}
            <button
              type="button"
              onClick={handleDownloadClick}
              aria-label={downloaded ? 'Música salva no aparelho' : 'Baixar no aparelho'}
              title={downloaded ? 'Salva no aparelho (offline)' : 'Salvar no aparelho'}
              className={`p-1.5 sm:p-2 rounded-full transition active:scale-75 ${
                downloaded ? 'text-emerald-400' : 'text-[#777777] hover:text-[#C98A2E]'
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
          </div>
        </div>

        {/* CENTER SECTION: Media Controls & Interactive Scrubber */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-4 flex flex-col items-center justify-center gap-1 min-w-0">
          {/* Controls buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={toggleShuffle}
              className={`p-1.5 sm:p-2 rounded-full transition active:scale-90 ${
                isShuffle ? 'text-[#C98A2E]' : 'text-[#777777] hover:text-[#FAF7F2]'
              }`}
              title={isShuffle ? 'Modo aleatório ativado' : 'Ativar aleatório'}
              aria-label="Aleatório"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={previousTrack}
              className="p-1.5 sm:p-2 rounded-full text-[#A7A7A7] hover:text-[#FAF7F2] transition active:scale-90"
              title="Música anterior (Alt + Seta Esquerda)"
              aria-label="Música anterior"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              type="button"
              onClick={togglePlayPause}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-[#C98A2E] to-[#D97706] text-black flex items-center justify-center shadow-lg hover:brightness-110 active:scale-95 transition"
              title={isPlaying ? 'Pausar (Espaço)' : 'Tocar (Espaço)'}
              aria-label={isPlaying ? 'Pausar' : 'Tocar'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={nextTrack}
              className="p-1.5 sm:p-2 rounded-full text-[#A7A7A7] hover:text-[#FAF7F2] transition active:scale-90"
              title="Próxima música (Alt + Seta Direita)"
              aria-label="Próxima música"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              type="button"
              onClick={toggleRepeat}
              className={`p-1.5 sm:p-2 rounded-full transition active:scale-90 ${
                isRepeat ? 'text-[#C98A2E]' : 'text-[#777777] hover:text-[#FAF7F2]'
              }`}
              title={isRepeat ? 'Repetir faixa ativado' : 'Ativar repetição'}
              aria-label="Repetir"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Scrubber slider bar */}
          <div className="w-full flex items-center gap-2 sm:gap-3">
            <span className="text-[11px] font-mono text-[#888888] w-9 sm:w-10 text-right tabular-nums select-none shrink-0">
              {formatSeconds(displayedTime)}
            </span>

            <div className="flex-1 relative flex items-center group cursor-pointer py-1 min-w-0">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={1}
                value={displayedTime}
                onChange={handleSeekChange}
                onMouseUp={handleSeekCommit}
                onTouchEnd={handleSeekCommit}
                className="w-full h-1.5 bg-[#2E2E2E] group-hover:h-2 rounded-lg appearance-none cursor-pointer accent-[#C98A2E] focus:outline-none transition-all"
                style={{
                  background: `linear-gradient(to right, #C98A2E 0%, #D97706 ${progressPercent}%, #2E2E2E ${progressPercent}%, #2E2E2E 100%)`,
                }}
                aria-label="Posição da música"
              />
            </div>

            <span className="text-[11px] font-mono text-[#888888] w-9 sm:w-10 text-left tabular-nums select-none shrink-0">
              {formatSeconds(duration)}
            </span>
          </div>
        </div>

        {/* RIGHT SECTION: Mode & Volume Controls */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 w-auto min-w-[150px] max-w-[260px] lg:max-w-[320px]">
          {/* Car Mode Shortcut */}
          <button
            type="button"
            onClick={openCarMode}
            className="p-1.5 sm:p-2 rounded-full text-[#A7A7A7] hover:text-[#D97706] hover:bg-[#242424] transition active:scale-90"
            title="Abrir Modo Estrada (Botões gigantes)"
            aria-label="Modo Estrada"
          >
            <Car className="w-4 h-4 text-[#D97706]" />
          </button>

          {/* Queue toggle */}
          <button
            type="button"
            onClick={openQueue}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-full text-[#A7A7A7] hover:text-[#C98A2E] hover:bg-[#242424] transition active:scale-90"
            title={`Fila de reprodução (${queue.length} músicas)`}
            aria-label="Fila de reprodução"
          >
            <ListMusic className="w-4 h-4 text-[#C98A2E]" />
            <span className="text-xs font-bold text-[#A7A7A7]">{queue.length}</span>
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5 pl-1 group">
            <button
              type="button"
              onClick={() => setVolume(volume > 0 ? 0 : 0.9)}
              className="p-1 text-[#A7A7A7] hover:text-[#FAF7F2] transition"
              title={volume === 0 ? 'Desmutar' : 'Mutar som'}
              aria-label="Controle de volume"
            >
              {volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-14 sm:w-18 lg:w-24 h-1.5 bg-[#2A2A2A] group-hover:h-2 rounded-lg appearance-none cursor-pointer accent-[#C98A2E] transition-all"
              aria-label="Volume"
            />
          </div>

          {/* Expand Full Player */}
          <button
            type="button"
            onClick={openFullPlayer}
            className="p-1.5 sm:p-2 rounded-full text-[#A7A7A7] hover:text-[#FAF7F2] hover:bg-[#242424] transition"
            title="Expandir player em tela cheia"
            aria-label="Expandir player"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MOBILE PLAYER BAR (md:hidden) - Fixed Above BottomNav  */}
      {/* ========================================================= */}
      <div
        onClick={openFullPlayer}
        className="md:hidden fixed left-0 right-0 bottom-16 z-30 bg-[#1B1B1B]/95 backdrop-blur-xl border-t border-[#2A2A2A] shadow-2xl transition-all cursor-pointer group select-none"
      >
        {/* Real-time mini progress line at top of player */}
        <div className="w-full h-1 bg-[#2E2E2E]">
          <div
            className="h-full bg-gradient-to-r from-[#C98A2E] to-[#D97706] transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="px-3.5 py-2.5 flex items-center justify-between gap-3">
          {/* Track Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-[#242424] shadow-md border border-[#333333]">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="font-heading font-bold text-sm text-[#FAF7F2] truncate group-hover:text-[#C98A2E] transition">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-[#A7A7A7] truncate">
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
          <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={previousTrack}
              className="p-2 rounded-full text-[#A7A7A7] hover:text-[#FAF7F2] hover:bg-[#242424] transition active:scale-90"
              aria-label="Música anterior"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              type="button"
              onClick={togglePlayPause}
              className="w-11 h-11 rounded-full bg-gradient-to-r from-[#C98A2E] to-[#D97706] text-black flex items-center justify-center shadow-lg hover:brightness-110 active:scale-95 transition"
              aria-label={isPlaying ? 'Pausar música' : 'Tocar música'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={nextTrack}
              className="p-2 rounded-full text-[#A7A7A7] hover:text-[#FAF7F2] hover:bg-[#242424] transition active:scale-90"
              aria-label="Próxima música"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            {/* Quick Queue toggle */}
            <button
              type="button"
              onClick={openQueue}
              className="p-2 rounded-full text-[#A7A7A7] hover:text-[#C98A2E] hover:bg-[#242424] transition active:scale-90"
              aria-label="Fila de reprodução"
              title="Fila de reprodução"
            >
              <ListMusic className="w-5 h-5 text-[#C98A2E]" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
