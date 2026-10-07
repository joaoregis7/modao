import React, { useState, useMemo, useEffect } from 'react';
import {
  Music2,
  Play,
  Shuffle,
  Search,
  X,
  Filter,
  ArrowDownToLine,
  CheckCircle2,
  Loader2,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { ViewState } from '../../types';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { TrackListItem } from '../common/TrackListItem';
import {
  matchesSearchQuery,
  matchesGenreFilter,
  GENRE_FILTERS,
} from '../../services/searchMatcher';

interface AllTracksViewProps {
  initialSearchQuery?: string;
  initialGenre?: string;
  onNavigate: (view: ViewState) => void;
}

export const AllTracksView: React.FC<AllTracksViewProps> = ({
  initialSearchQuery = '',
  initialGenre = 'all',
}) => {
  const {
    playAll,
    allTracks,
    downloadedTrackIds,
    downloadAllTracks,
    isDownloadingAll,
    downloadAllProgress,
  } = useAudioPlayer();

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenre);
  const [onlyDownloaded, setOnlyDownloaded] = useState(false);

  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Contagem dinâmica por categoria para feedback visual instantâneo
  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const filter of GENRE_FILTERS) {
      counts[filter.id] = allTracks.filter(t => matchesGenreFilter(t, filter.id)).length;
    }
    return counts;
  }, [allTracks]);

  // Busca inteligente com tolerância a acentos e erros ortográficos + filtros
  const filteredTracks = useMemo(() => {
    return allTracks.filter(track => {
      // 1. Filtro de Salvas no Celular
      if (onlyDownloaded && !downloadedTrackIds.includes(track.id)) {
        return false;
      }

      // 2. Filtro de Estilo/Gênero
      if (!matchesGenreFilter(track, selectedGenre)) {
        return false;
      }

      // 3. Busca inteligente tolerante a erros de digitação e acentos
      if (searchQuery.trim() && !matchesSearchQuery(track, searchQuery)) {
        return false;
      }

      return true;
    });
  }, [allTracks, searchQuery, selectedGenre, onlyDownloaded, downloadedTrackIds]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('all');
    setOnlyDownloaded(false);
  };

  const isAllDownloaded =
    allTracks.length > 0 && downloadedTrackIds.length >= allTracks.length;

  return (
    <div className="space-y-6 sm:space-y-8 pb-24">
      {/* 1. Header Premium com Identidade Sertaneja */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#242424] via-[#1C1C1C] to-[#141414] border border-[#2D2D2D] p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#C98A2E] to-[#996016] flex items-center justify-center shadow-xl shadow-[#C98A2E]/20 text-black shrink-0 ring-2 ring-[#C98A2E]/30">
              <Music2 className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C98A2E]/20 text-[#C98A2E] border border-[#C98A2E]/30 text-[11px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  352 Músicas no Catálogo
                </span>
                {downloadedTrackIds.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                    <Smartphone className="w-3 h-3" />
                    {downloadedTrackIds.length} salvas no celular
                  </span>
                )}
              </div>
              <h1 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-[#FAF7F2] tracking-tight">
                Músicas & Modões
              </h1>
              <p className="text-xs sm:text-sm text-[#A7A7A7] mt-1 font-medium">
                {searchQuery || selectedGenre !== 'all' || onlyDownloaded
                  ? `Mostrando ${filteredTracks.length} de ${allTracks.length} modões`
                  : '352 clássicos sertanejos prontos para ouvir online ou sem internet'}
              </p>
            </div>
          </div>

          {/* Quick Play & Download Actions */}
          <div className="flex items-center gap-2.5 flex-wrap sm:justify-end">
            {/* Botão de Baixar no Celular (sem número na opção padrão, mas com contagem de salvas) */}
            <button
              type="button"
              onClick={downloadAllTracks}
              disabled={isDownloadingAll}
              className={`flex items-center gap-2 px-4 sm:px-5 py-3 rounded-2xl border text-xs sm:text-sm font-bold active:scale-95 transition shadow-lg ${
                isAllDownloaded
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-[#2A2A2A] hover:bg-[#323232] border-[#3E3E3E] hover:border-[#C98A2E] text-[#FAF7F2]'
              }`}
              title="Salva as músicas no aplicativo para ouvir sem precisar de internet"
            >
              {isDownloadingAll ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#C98A2E]" />
                  <span>Baixando ({downloadAllProgress?.percentage || 0}%)...</span>
                </>
              ) : isAllDownloaded ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Todas Salvas no Celular ({downloadedTrackIds.length})</span>
                </>
              ) : (
                <>
                  <ArrowDownToLine className="w-4 h-4 text-[#C98A2E]" />
                  <span>Baixar no Celular</span>
                </>
              )}
            </button>

            {filteredTracks.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => playAll(filteredTracks, false)}
                  className="flex items-center gap-2 px-5 sm:px-6 py-3 rounded-2xl bg-gradient-to-r from-[#C98A2E] to-[#D97706] text-black font-heading font-black text-xs sm:text-sm shadow-xl shadow-[#C98A2E]/25 hover:brightness-110 active:scale-95 transition"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Tocar Todas</span>
                </button>

                <button
                  type="button"
                  onClick={() => playAll(filteredTracks, true)}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#242424] hover:bg-[#2E2E2E] border border-[#3A3A3A] hover:border-[#C98A2E]/50 text-[#FAF7F2] font-semibold text-xs sm:text-sm active:scale-95 transition shadow-md"
                  title="Tocar em ordem aleatória"
                >
                  <Shuffle className="w-4 h-4 text-[#C98A2E]" />
                  <span>Aleatório</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Barra de Busca Inteligente com Tolerância a Acentos e Erros de Digitação */}
      <div className="bg-[#1B1B1B] border border-[#2B2B2B] rounded-3xl p-4 sm:p-5 space-y-4 shadow-lg">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C98A2E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome da música ou artista (ex: Boate Azul, Zezé, Tião Carreiro)..."
            className="w-full bg-[#242424] border border-[#383838] focus:border-[#C98A2E] rounded-2xl py-3.5 pl-12 pr-11 text-sm sm:text-base text-[#FAF7F2] placeholder-[#777777] font-medium focus:outline-none transition shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-[#A7A7A7] hover:text-[#FAF7F2] hover:bg-[#333333] rounded-full transition"
              aria-label="Limpar texto de busca"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Abas Rápidas: Todas as Músicas (352) / Salvas no Celular */}
        <div className="flex items-center gap-2 pt-1 border-b border-[#262626] pb-3.5 flex-wrap">
          <button
            type="button"
            onClick={() => setOnlyDownloaded(false)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
              !onlyDownloaded
                ? 'bg-[#C98A2E] text-black shadow-md'
                : 'bg-[#242424] text-[#A7A7A7] hover:text-[#FAF7F2] hover:bg-[#2A2A2A]'
            }`}
          >
            Todas as Músicas ({allTracks.length})
          </button>
          <button
            type="button"
            onClick={() => setOnlyDownloaded(true)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
              onlyDownloaded
                ? 'bg-emerald-500 text-black shadow-md'
                : 'bg-[#242424] text-[#A7A7A7] hover:text-[#FAF7F2] hover:bg-[#2A2A2A]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Salvas no Celular ({downloadedTrackIds.length})</span>
          </button>
        </div>

        {/* 3. Filtros por Categoria com Todas as Músicas Populadas */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#A7A7A7]">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#C98A2E]" />
              <span>Filtrar por estilo:</span>
            </div>
            {(searchQuery || selectedGenre !== 'all' || onlyDownloaded) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[#C98A2E] hover:underline font-bold"
              >
                Limpar filtros
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-0.5">
            {GENRE_FILTERS.map(filter => {
              const isSelected = selectedGenre === filter.id;
              const count = genreCounts[filter.id] || 0;

              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setSelectedGenre(filter.id)}
                  className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold shrink-0 transition-all active:scale-95 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#C98A2E] to-[#D97706] text-black shadow-lg shadow-[#C98A2E]/25 font-bold scale-[1.02]'
                      : 'bg-[#242424] text-[#B0B0B0] hover:text-[#FAF7F2] hover:bg-[#2B2B2B] border border-[#323232]'
                  }`}
                >
                  <span>{filter.label}</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                      isSelected
                        ? 'bg-black/25 text-black'
                        : 'bg-[#1A1A1A] text-[#888888]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Lista de Músicas ou Estado Vazio Amigável */}
      {filteredTracks.length === 0 ? (
        <div className="py-20 px-4 text-center bg-[#1B1B1B] rounded-3xl border border-[#262626] shadow-xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#242424] flex items-center justify-center text-3xl shadow-inner">
            🎻
          </div>
          <h3 className="font-heading font-black text-xl text-[#FAF7F2]">
            Nenhum modão encontrado
          </h3>
          <p className="text-xs sm:text-sm text-[#A7A7A7] mt-1.5 max-w-md mx-auto">
            {searchQuery
              ? `Não encontramos resultados com "${searchQuery}". Tente outro nome ou limpe a busca.`
              : 'Nenhuma música encontrada nesta categoria com os filtros atuais.'}
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-5 px-6 py-2.5 rounded-2xl bg-[#242424] hover:bg-[#2E2E2E] border border-[#3A3A3A] hover:border-[#C98A2E] text-xs sm:text-sm font-bold text-[#FAF7F2] transition"
          >
            Limpar busca e filtros
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTracks.map((track, idx) => (
            <TrackListItem
              key={track.id}
              track={track}
              index={idx}
              showIndex
              playlistContext={filteredTracks}
            />
          ))}
        </div>
      )}
    </div>
  );
};
