import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X,
  Volume2,
  VolumeX,
  Volume1,
  Minus,
  Plus,
  Car,
  Compass,
  Radio,
  Flame,
  Info,
} from 'lucide-react';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { audioEngine } from '../../services/audioEngine';

export const CarModeView: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    isCarMode,
    closeCarMode,
    togglePlayPause,
    nextTrack,
    previousTrack,
    volume,
    setVolume,
    allTracks,
    lastPlayedTrack,
    playTrack,
    queue,
    queueIndex,
  } = useAudioPlayer();

  const [maxVolumeNotice, setMaxVolumeNotice] = useState(false);
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!isCarMode) return null;

  // Se abrir sem faixa ativa, seleciona a última ou a primeira do catálogo
  const activeTrack = currentTrack || lastPlayedTrack || allTracks[0];

  const showMaxNotice = () => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    setMaxVolumeNotice(true);
    noticeTimerRef.current = setTimeout(() => {
      setMaxVolumeNotice(false);
    }, 4500);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      togglePlayPause();
    } else {
      const trackToPlay = currentTrack || activeTrack;
      if (trackToPlay) {
        const engineTrack = audioEngine.getCurrentTrack();
        if (!engineTrack || engineTrack.id !== trackToPlay.id) {
          playTrack(trackToPlay, queue.length > 0 ? queue : allTracks);
        } else {
          togglePlayPause();
        }
      }
    }
  };

  const handleVolumeDown = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(30);
      } catch {}
    }
    const newVol = Math.max(0, Math.round((volume - 0.1) * 10) / 10);
    setVolume(newVol);
  };

  const handleVolumeUp = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(35);
      } catch {}
    }

    if (volume >= 1) {
      showMaxNotice();
      return;
    }

    const newVol = Math.min(1, Math.round((volume + 0.1) * 10) / 10);
    setVolume(newVol);
    if (newVol >= 1) {
      showMaxNotice();
    }
  };

  const handleToggleMute = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(30);
      } catch {}
    }
    setVolume(volume > 0 ? 0 : 0.85);
  };

  const nextSong = queue[queueIndex + 1] || queue[0];
  const volumePercent = Math.round(volume * 100);

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A] text-[#FAF7F2] flex flex-col justify-between p-4 sm:p-8 select-none overflow-hidden">
      {/* Highway Night Lighting Effect & Ambient Glow */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 pointer-events-none scale-125"
        style={{ backgroundImage: activeTrack ? `url(${activeTrack.coverUrl})` : undefined }}
      />
      {/* Asphalt lines road perspective watermark */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#C98A2E]/5 to-transparent pointer-events-none" />

      {/* Top Header: Highway Dashboard HUD */}
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C98A2E] to-[#EA580C] flex items-center justify-center text-black font-black shadow-lg shadow-[#C98A2E]/30 ring-2 ring-[#C98A2E]/40">
            <Car className="w-7 h-7 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-heading font-black text-[#FAF7F2] uppercase tracking-wider">
                Modo Estrada
              </h2>
              <span className="hidden xs:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C98A2E]/20 text-[#C98A2E] border border-[#C98A2E]/40 text-[10px] font-bold uppercase tracking-wider">
                <Compass className="w-3 h-3" />
                Seguro na Rodovia
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                <Radio className="w-3 h-3" />
                Bluetooth & Cabo
              </span>
            </div>
            <p className="text-xs text-[#A7A7A7] font-medium">
              Botões gigantes • Bluetooth e Cabo • Comandos no volante
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={closeCarMode}
          className="flex items-center gap-2 px-5 sm:px-6 py-3 rounded-2xl bg-[#242424] hover:bg-[#2E2E2E] border border-[#3E3E3E] hover:border-red-500/50 text-sm font-bold text-[#FAF7F2] active:scale-95 transition shadow-lg"
        >
          <X className="w-5 h-5 text-red-400" />
          <span>Sair</span>
        </button>
      </div>

      {/* Middle: Giant Album Art & Huge Roadside Typography */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-3 max-w-xl mx-auto w-full text-center">
        {activeTrack ? (
          <>
            <div className="relative w-56 h-56 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl border-4 border-[#2E2E2E] mb-5 bg-[#181818] group">
              <img
                src={activeTrack.coverUrl}
                alt={activeTrack.title}
                className="w-full h-full object-cover"
              />
              {isPlaying && (
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-500/90 text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                  Tocando
                </div>
              )}
            </div>

            <h1 className="font-heading font-black text-2xl sm:text-4xl text-[#FAF7F2] tracking-tight truncate w-full mb-1 drop-shadow">
              {activeTrack.title}
            </h1>
            <p className="font-heading font-bold text-lg sm:text-2xl text-[#C98A2E] truncate w-full">
              {activeTrack.artist}
            </p>

            {nextSong && (
              <p className="text-xs text-[#888888] font-medium mt-2 truncate max-w-sm">
                A seguir:{' '}
                <span className="text-[#B0B0B0] font-semibold">{nextSong.title}</span>
              </p>
            )}
          </>
        ) : (
          <div className="text-center py-10">
            <Radio className="w-16 h-16 text-[#C98A2E] mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold">Pronto para viajar?</h2>
            <p className="text-sm text-[#A7A7A7] mt-1">
              Toque no botão central abaixo para dar a partida no modão!
            </p>
          </div>
        )}
      </div>

      {/* Bottom: Giant Tactile Car Controls */}
      <div className="relative z-10 max-w-xl mx-auto w-full pb-safe space-y-4">
        {/* Playback Controls (Previous, Play/Pause, Next) */}
        <div className="flex items-center justify-center gap-5 sm:gap-10">
          {/* Giant Previous (80px - 96px) */}
          <button
            type="button"
            onClick={previousTrack}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#202020] hover:bg-[#282828] active:scale-90 flex items-center justify-center text-[#FAF7F2] transition border-2 border-[#333333] shadow-xl"
            aria-label="Música anterior"
          >
            <SkipBack className="w-10 h-10 sm:w-12 sm:h-12 fill-current" />
          </button>

          {/* Huge Play/Pause (96px - 116px) com brilho de farol */}
          <button
            type="button"
            onClick={handleTogglePlay}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-r from-[#C98A2E] via-[#D97706] to-[#EA580C] hover:brightness-110 active:scale-90 flex items-center justify-center text-black shadow-2xl shadow-[#C98A2E]/40 transition border-2 border-[#FAF7F2]/20"
            aria-label={isPlaying ? 'Pausar' : 'Tocar'}
          >
            {isPlaying ? (
              <Pause className="w-12 h-12 sm:w-14 sm:h-14 fill-current" />
            ) : (
              <Play className="w-12 h-12 sm:w-14 sm:h-14 fill-current ml-2" />
            )}
          </button>

          {/* Giant Next (80px - 96px) */}
          <button
            type="button"
            onClick={nextTrack}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#202020] hover:bg-[#282828] active:scale-90 flex items-center justify-center text-[#FAF7F2] transition border-2 border-[#333333] shadow-xl"
            aria-label="Próxima música"
          >
            <SkipForward className="w-10 h-10 sm:w-12 sm:h-12 fill-current" />
          </button>
        </div>

        {/* Tactile Car Mode Volume Strip: Diminuir (-), Barra Central, Aumentar (+) */}
        <div className="space-y-2">
          <div className="bg-[#181818]/95 border border-[#2B2B2B] rounded-3xl p-3 sm:p-4 shadow-xl flex items-center justify-between gap-3 sm:gap-4">
            {/* Botão Diminuir Volume (-) */}
            <button
              type="button"
              onClick={handleVolumeDown}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#242424] hover:bg-[#2E2E2E] active:scale-90 flex items-center justify-center text-[#FAF7F2] border border-[#383838] shadow-md transition shrink-0 touch-manipulation cursor-pointer select-none"
              aria-label="Diminuir volume"
              title="Diminuir volume (-10%)"
            >
              <Minus className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3]" />
            </button>

            {/* Centro: Indicador de Volume e Controle Tátil */}
            <div className="flex-1 flex flex-col items-center justify-center gap-1.5 px-1 sm:px-2">
              <div className="w-full flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#A7A7A7] hover:text-[#FAF7F2] transition touch-manipulation cursor-pointer"
                  title={volume === 0 ? 'Desmutar som' : 'Mutar som'}
                >
                  {volume === 0 ? (
                    <>
                      <VolumeX className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 font-bold">Mudo</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-5 h-5 text-[#C98A2E]" />
                      <span className="text-[#FAF7F2]">Volume</span>
                    </>
                  )}
                </button>

                {/* Badge visível da porcentagem exata */}
                <span
                  className={`text-xs sm:text-sm font-black font-mono px-2.5 py-0.5 rounded-lg border tabular-nums transition ${
                    volume >= 1
                      ? 'bg-[#C98A2E]/20 text-[#F59E0B] border-[#C98A2E]/50 shadow-sm'
                      : volume === 0
                      ? 'bg-red-500/20 text-red-400 border-red-500/40'
                      : 'bg-[#262626] text-[#FAF7F2] border-[#363636]'
                  }`}
                >
                  {volumePercent}% {volume >= 1 ? '• Máx' : ''}
                </span>
              </div>

              {/* Slider Tátil Largo */}
              <div className="w-full relative flex items-center py-1">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-3.5 sm:h-4 bg-[#2A2A2A] rounded-full appearance-none cursor-pointer accent-[#C98A2E] focus:outline-none transition-all shadow-inner touch-manipulation"
                  style={{
                    background: `linear-gradient(to right, #C98A2E 0%, #D97706 ${volumePercent}%, #2A2A2A ${volumePercent}%, #2A2A2A 100%)`,
                  }}
                  aria-label="Ajuste do volume no carro"
                />
              </div>
            </div>

            {/* Botão Aumentar Volume (+) */}
            <button
              type="button"
              onClick={handleVolumeUp}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border shadow-md transition shrink-0 touch-manipulation cursor-pointer select-none ${
                volume >= 1
                  ? 'bg-[#2A241C] border-[#C98A2E]/60 text-[#F59E0B] active:scale-95 shadow-[#C98A2E]/20'
                  : 'bg-[#242424] hover:bg-[#2E2E2E] border-[#383838] text-[#FAF7F2] active:scale-90'
              }`}
              aria-label="Aumentar volume"
              title={volume >= 1 ? 'Volume já está no máximo (100%)' : 'Aumentar volume (+10%)'}
            >
              <Plus className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3]" />
            </button>
          </div>

          {/* Aviso inteligente na rodovia: Se estiver em 100%, explica como aumentar no aparelho */}
          {maxVolumeNotice && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-[#2B2314] to-[#1F1C16] border border-[#C98A2E]/50 text-amber-200 text-xs text-center flex items-center justify-center gap-2.5 shadow-lg">
              <Volume2 className="w-5 h-5 shrink-0 text-[#F59E0B] animate-pulse" />
              <span className="text-left leading-snug">
                <strong>Volume do app no máximo (100%)!</strong> Para aumentar mais o som, use os <strong>botões físicos laterais do seu celular</strong> ou aumente o volume no <strong>aparelho de som do carro</strong>.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
