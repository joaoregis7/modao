import React, { useMemo } from 'react';
import {
  Play,
  Pause,
  Flame,
  Clock,
  Radio,
  Volume2,
  Car,
  Compass,
} from 'lucide-react';
import { ViewState, Track } from '../../types';
import { ARTISTS } from '../../data/artists';
import { TRACKS } from '../../data/tracks';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { TrackListItem } from '../common/TrackListItem';

interface HomeViewProps {
  onNavigate: (view: ViewState) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const {
    playTrack,
    playAll,
    lastPlayedTrack,
    currentTrack,
    isPlaying,
    togglePlayPause,
    allTracks,
    openCarMode,
  } = useAudioPlayer();

  // "Mais ouvidas do mundo": Os maiores clássicos sertanejos atemporais do catálogo
  const topTracks = useMemo(() => {
    const legendaryPriorities = [
      'boate azul',
      'telefone mudo',
      'fio de cabelo',
      'saudade da minha terra',
      'sessenta dias apaixonado',
      'blusa vermelha',
      'sonho por sonho',
      'temporal de amor',
      'duas vezes você',
      'aline',
      'é o amor',
      'barco de papel',
    ];
    const picked: Track[] = [];
    for (const title of legendaryPriorities) {
      const match = allTracks.find(t => t.title.toLowerCase().includes(title));
      if (match && !picked.some(p => p.id === match.id)) {
        picked.push(match);
      }
    }
    // Preenche com mais faixas se necessário até 8
    for (const t of allTracks) {
      if (picked.length >= 8) break;
      if (!picked.some(p => p.id === t.id)) {
        picked.push(t);
      }
    }
    return picked.slice(0, 8);
  }, [allTracks]);

  // Song to continue or start listening to
  const activeTrack = lastPlayedTrack || currentTrack || topTracks[0] || allTracks[0];
  const isCurrentlyPlayingActive = currentTrack?.id === activeTrack?.id && isPlaying;

  return (
    <div className="space-y-8 sm:space-y-10 pb-16">
      {/* 1. CONTINUE OUVINDO - Card Premium, Responsivo e com Atmosfera Sonora */}
      {activeTrack && (
        <section>
          <div className="flex items-center justify-between mb-3.5 px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#C98A2E]/20 flex items-center justify-center text-[#C98A2E]">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="font-heading font-black text-lg sm:text-xl text-[#FAF7F2]">
                Continue ouvindo
              </h2>
            </div>
            <span className="text-xs text-[#A7A7A7] font-medium hidden xs:inline">
              {lastPlayedTrack ? 'Salvo no seu celular' : 'Sugerido para você'}
            </span>
          </div>

          <div
            onClick={() => {
              if (isCurrentlyPlayingActive) {
                togglePlayPause();
              } else {
                playTrack(activeTrack, allTracks);
              }
            }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#222222] via-[#1B1B1B] to-[#141414] border border-[#2E2E2E] hover:border-[#C98A2E]/60 shadow-2xl p-4 sm:p-6 transition-all duration-300 cursor-pointer group"
          >
            {/* Ambient Background Glow from Cover */}
            <div
              className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-15 scale-125 pointer-events-none transition duration-700 group-hover:opacity-25"
              style={{ backgroundImage: `url(${activeTrack.coverUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40 pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
              {/* Cover Art and Info */}
              <div className="flex items-center gap-4 w-full sm:w-auto min-w-0 flex-1">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 bg-[#242424] shadow-xl border border-[#3A3A3A] group-hover:scale-105 transition duration-300">
                  <img
                    src={activeTrack.coverUrl}
                    alt={activeTrack.title}
                    className="w-full h-full object-cover"
                  />
                  {isCurrentlyPlayingActive && (
                    <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] flex items-center justify-center">
                      <div className="flex gap-1 items-end h-6">
                        <span className="w-1.5 h-3 bg-[#C98A2E] rounded-full animate-bounce" />
                        <span className="w-1.5 h-6 bg-[#C98A2E] rounded-full animate-bounce delay-100" />
                        <span className="w-1.5 h-4 bg-[#C98A2E] rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    {isCurrentlyPlayingActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Tocando Agora
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#C98A2E]/20 text-[#C98A2E] border border-[#C98A2E]/30 text-[10px] font-bold uppercase tracking-wider">
                        <Radio className="w-3 h-3" />
                        {activeTrack.genre || 'Modão Clássico'}
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading font-black text-lg sm:text-2xl text-[#FAF7F2] truncate group-hover:text-[#C98A2E] transition tracking-tight">
                    {activeTrack.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#A7A7A7] truncate mt-1 font-medium">
                    {activeTrack.artist} • <span className="text-[#C98A2E]">{activeTrack.durationFormatted}</span>
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="w-full sm:w-auto flex items-center justify-end shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isCurrentlyPlayingActive) {
                      togglePlayPause();
                    } else {
                      playTrack(activeTrack, allTracks);
                    }
                  }}
                  className="w-full sm:w-auto px-7 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-[#C98A2E] to-[#D97706] text-black font-heading font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-[#C98A2E]/25 hover:brightness-110 active:scale-95 transition"
                >
                  {isCurrentlyPlayingActive ? (
                    <>
                      <Pause className="w-5 h-5 fill-current" />
                      <span>Pausar Modão</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                      <span>Continuar Ouvindo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. MAIS TOCADAS: Ícone de fogo grosso e destacado, sem botão 'Ver todas' */}
      <section className="bg-[#1B1B1B] rounded-3xl p-4 sm:p-7 border border-[#242424] shadow-lg">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#F59E0B] via-[#EA580C] to-[#DC2626] flex items-center justify-center shadow-lg shadow-[#EA580C]/35 shrink-0 ring-2 ring-[#F59E0B]/30">
            <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-[#FAF7F2] fill-[#FAF7F2] stroke-[2.5] drop-shadow-md" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-black text-lg sm:text-2xl text-[#FAF7F2] tracking-tight">
                Mais ouvidas no Rádio Modão
              </h2>
              <span className="hidden xs:inline-flex px-2 py-0.5 rounded-full bg-[#EA580C]/20 border border-[#EA580C]/40 text-[10px] font-bold text-[#F59E0B] uppercase tracking-wider">
                Top Brasil
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#A7A7A7]">
              Os maiores hinos do sertanejo que todo mundo canta junto
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          {topTracks.map((track, idx) => (
            <TrackListItem
              key={track.id}
              track={track}
              index={idx}
              showIndex
              playlistContext={topTracks}
            />
          ))}
        </div>
      </section>

      {/* BLOCO DE ESTRADA: Visual imersivo de rodovia com atalhos para modo estrada e modões de viagem */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C1A17] via-[#161616] to-[#0E0E0E] border border-[#332A1C] p-5 sm:p-7 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#F59E0B]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-[#F59E0B]/50 to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#F59E0B] via-[#D97706] to-[#78350F] flex items-center justify-center text-black shrink-0 shadow-xl shadow-[#D97706]/30 ring-2 ring-[#F59E0B]/40">
              <Car className="w-8 h-8 text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C98A2E]/25 text-[#F59E0B] border border-[#C98A2E]/40 text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
                  <Compass className="w-3 h-3" />
                  Rádio da Rodovia & Boleia
                </span>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Botões Gigantes • Direção Segura
                </span>
              </div>
              <h2 className="font-heading font-black text-xl sm:text-2xl lg:text-3xl text-[#FAF7F2] tracking-tight">
                Bloco de Estrada
              </h2>
              <p className="text-xs sm:text-sm text-[#A7A7A7] mt-1 max-w-xl">
                Modões brutos para viagens longas, sem distrações ao volante. Interface com alto contraste e toque facilitado.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap shrink-0">
            <button
              type="button"
              onClick={openCarMode}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#F59E0B] to-[#EA580C] text-black font-heading font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-[#EA580C]/25 hover:brightness-110 active:scale-95 transition"
            >
              <Car className="w-5 h-5 fill-black" />
              <span>Abrir Modo Estrada</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const roadTracks = allTracks.filter(
                  (t) => t.stationId === 'station-estrada' || t.genre?.toLowerCase().includes('estrada')
                );
                playAll(roadTracks.length > 0 ? roadTracks : allTracks, false);
              }}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-[#242424] hover:bg-[#2E2E2E] border border-[#3E3E3E] hover:border-[#F59E0B]/50 text-[#FAF7F2] font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition shadow-md"
            >
              <Play className="w-4 h-4 text-[#F59E0B] fill-current" />
              <span>Tocar Modões de Estrada</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. ARTISTAS: Grandes nomes do modão */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-heading font-black text-xl sm:text-2xl text-[#FAF7F2]">
              Grandes nomes do modão
            </h2>
            <p className="text-xs sm:text-sm text-[#A7A7A7]">
              As vozes e violas que consagraram a música caipira
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
          {ARTISTS.map((artist) => (
            <div
              key={artist.id}
              onClick={() => onNavigate({ type: 'artist', artistId: artist.id })}
              className="group p-3 sm:p-4 rounded-2xl bg-[#242424] hover:bg-[#2A2A2A] border border-[#2E2E2E] hover:border-[#C98A2E]/50 transition cursor-pointer text-center flex flex-col items-center"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-3 border-2 border-[#3A3A3A] group-hover:border-[#C98A2E] shadow-md group-hover:scale-105 transition duration-300">
                <img
                  src={artist.photoUrl}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <h4 className="font-heading font-bold text-sm sm:text-base text-[#FAF7F2] group-hover:text-[#C98A2E] transition line-clamp-1">
                {artist.name}
              </h4>
              <p className="text-[11px] sm:text-xs text-[#A7A7A7] line-clamp-1 mt-0.5">
                {artist.role}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
