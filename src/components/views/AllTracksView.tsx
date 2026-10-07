import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  LayoutGrid,
  List,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Disc3,
  SlidersHorizontal,
} from 'lucide-react';
import { ViewState, Track } from '../../types';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { TrackListItem } from '../common/TrackListItem';
import { TrackCard } from '../common/TrackCard';
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

const GENRE_EMOJIS: Record<string, string> = {
  all: '🎶',
  'Modão Raiz': '🎻',
  'Moda de Viola': '🪕',
  'Modão de Boteco': '🍺',
  'Modão de Estrada': '🚛',
  'Sofrência das Antigas': '💔',
  Românticas: '❤️',
  'Clássicos Sertanejos': '👑',
  'Rodeio & Peão': '🤠',
};

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'default' | 'title' | 'artist' | 'duration'>('default');

  // Progressive rendering for mobile performance & smooth 60fps scrolling
  const [visibleCount, setVisibleCount] = useState(24);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

  // Draggable filter rail state
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Reseta contagem ao alterar filtros, busca ou ordenação
  useEffect(() => {
    setVisibleCount(24);
  }, [searchQuery, selectedGenre, onlyDownloaded, sortBy]);

  // Contagem dinâmica por categoria para feedback visual instantâneo
  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const filter of GENRE_FILTERS) {
      counts[filter.id] = allTracks.filter(t => matchesGenreFilter(t, filter.id)).length;
    }
    return counts;
  }, [allTracks]);

  // Busca inteligente com tolerância a acentos e erros ortográficos + filtros + ordenação
  const filteredTracks = useMemo(() => {
    const result = allTracks.filter(track => {
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

    if (sortBy === 'title') {
      return [...result].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
    }
    if (sortBy === 'artist') {
      return [...result].sort((a, b) => a.artist.localeCompare(b.artist, 'pt-BR'));
    }
    if (sortBy === 'duration') {
      return [...result].sort((a, b) => b.duration - a.duration);
    }

    return result;
  }, [allTracks, searchQuery, selectedGenre, onlyDownloaded, downloadedTrackIds, sortBy]);

  // Carregamento progressivo infinito super leve para celulares e telas móveis (evita travar o navegador)
  useEffect(() => {
    const el = loadMoreSentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 24, filteredTracks.length));
        }
      },
      {
        root: null,
        rootMargin: '400px', // Antecipa a rolagem para uma experiência perfeitamente contínua
        threshold: 0.05,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [filteredTracks.length]);

  const displayedTracks = useMemo(() => {
    return filteredTracks.slice(0, visibleCount);
  }, [filteredTracks, visibleCount]);

  // Check filter slider scroll bounds for showing arrows
  const checkScrollBounds = () => {
    const el = sliderRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 6);
  };

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    checkScrollBounds();
    el.addEventListener('scroll', checkScrollBounds, { passive: true });
    window.addEventListener('resize', checkScrollBounds);
    return () => {
      el.removeEventListener('scroll', checkScrollBounds);
      window.removeEventListener('resize', checkScrollBounds);
    };
  }, []);

  // Mouse drag handlers for filter chips
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = sliderRef.current;
    if (!el) return;
    setIsDragging(true);
    setHasDragged(false);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeftState(el.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = sliderRef.current;
    if (!isDragging || !el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 4) {
      setHasDragged(true);
    }
    el.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setTimeout(() => {
      setHasDragged(false);
    }, 60);
  };

  const handleScrollStep = (direction: 'left' | 'right') => {
    const el = sliderRef.current;
    if (!el) return;
    const offset = direction === 'left' ? -280 : 280;
    el.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('all');
    setOnlyDownloaded(false);
    setSortBy('default');
  };

  const isAllDownloaded =
    allTracks.length > 0 && downloadedTrackIds.length >= allTracks.length;

  return (
    <div className="space-y-6 sm:space-y-8 pb-24">
      {/* 1. Header Hero Card com Atmosfera Sertaneja Compacta e Botões Lado a Lado */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#262119] via-[#1C1A17] to-[#121212] border border-[#3E3424] p-4 sm:p-5.5 lg:p-6 shadow-xl">
        {/* Glow de fundo e efeitos visuais sutis */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C98A2E]/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-[#C98A2E]/40 to-transparent" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5 relative z-10">
          {/* Informações e Título */}
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#F59E0B] via-[#C98A2E] to-[#8C4A08] flex items-center justify-center shadow-lg shadow-[#C98A2E]/25 text-black shrink-0 ring-2 ring-[#F59E0B]/40 group">
              <Disc3 className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-700 group-hover:rotate-180" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C98A2E]/20 text-[#F59E0B] border border-[#C98A2E]/35 text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-[#F59E0B]" />
                  352 Clássicos
                </span>
                {downloadedTrackIds.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] sm:text-[11px] font-bold">
                    <Smartphone className="w-3 h-3" />
                    {downloadedTrackIds.length} salvas
                  </span>
                )}
              </div>

              <h1 className="font-heading font-black text-xl sm:text-2xl lg:text-3xl text-[#FAF7F2] tracking-tight truncate">
                Músicas & Modões
              </h1>

              <p className="text-xs sm:text-sm text-[#A8A8A8] mt-0.5 max-w-xl font-medium truncate">
                {searchQuery || selectedGenre !== 'all' || onlyDownloaded
                  ? `Mostrando ${filteredTracks.length} de ${allTracks.length} modões selecionados.`
                  : 'Catálogo completo das lendas sertanejas. Ouça online ou sem internet.'}
              </p>
            </div>
          </div>

          {/* Ações Rápidas: Botões Compactos Lado a Lado (grid no celular, inline no tablet/pc) */}
          <div className="grid grid-cols-3 gap-2 w-full sm:flex sm:items-center sm:gap-2 sm:w-auto shrink-0 pt-1 lg:pt-0">
            {/* 1. Tocar Todas */}
            {filteredTracks.length > 0 && (
              <button
                type="button"
                onClick={() => playAll(filteredTracks, false)}
                className="flex items-center justify-center gap-1.5 px-3 sm:px-4.5 py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#F59E0B] via-[#C98A2E] to-[#D97706] text-black font-heading font-black text-xs sm:text-sm shadow-md shadow-[#C98A2E]/20 hover:brightness-110 active:scale-95 transition whitespace-nowrap"
                title="Tocar todas as músicas selecionadas"
              >
                <Play className="w-3.5 h-3.5 fill-current ml-0.5 shrink-0" />
                <span className="truncate">Tocar ({filteredTracks.length})</span>
              </button>
            )}

            {/* 2. Aleatório */}
            {filteredTracks.length > 0 && (
              <button
                type="button"
                onClick={() => playAll(filteredTracks, true)}
                className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2.5 rounded-xl sm:rounded-2xl bg-[#222222] hover:bg-[#2C2C2C] border border-[#3A3A3A] hover:border-[#C98A2E]/60 text-[#FAF7F2] font-bold text-xs sm:text-sm active:scale-95 transition shadow-sm whitespace-nowrap"
                title="Tocar em ordem aleatória"
              >
                <Shuffle className="w-3.5 h-3.5 text-[#C98A2E] shrink-0" />
                <span className="truncate">Aleatório</span>
              </button>
            )}

            {/* 3. Salvar Offline */}
            <button
              type="button"
              onClick={downloadAllTracks}
              disabled={isDownloadingAll}
              className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2.5 rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-bold active:scale-95 transition shadow-sm whitespace-nowrap ${
                isAllDownloaded
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-[#222222] hover:bg-[#2C2C2C] border-[#3A3A3A] hover:border-[#C98A2E] text-[#FAF7F2]'
              }`}
              title="Salva as faixas para escutar sem internet"
            >
              {isDownloadingAll ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C98A2E] shrink-0" />
                  <span className="truncate">{downloadAllProgress?.percentage || 0}%</span>
                </>
              ) : isAllDownloaded ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">Salvas</span>
                </>
              ) : (
                <>
                  <ArrowDownToLine className="w-3.5 h-3.5 text-[#C98A2E] shrink-0" />
                  <span className="truncate">Offline</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Central de Busca, Visualização e Filtros Arrastáveis */}
      <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 shadow-xl">
        {/* Campo de Busca Inteligente */}
        <div className="relative">
          <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#C98A2E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título ou artista (ex: Boate Azul, Zezé, Tião Carreiro)..."
            className="w-full bg-[#232323] border border-[#363636] focus:border-[#C98A2E] rounded-xl sm:rounded-2xl py-2.5 sm:py-3 pl-10 sm:pl-12 pr-10 text-xs sm:text-sm text-[#FAF7F2] placeholder-[#777777] font-medium focus:outline-none transition shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#A7A7A7] hover:text-[#FAF7F2] hover:bg-[#333333] rounded-full transition"
              aria-label="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Linha de Abas Rápidas + Ferramentas de Visualização (Organizada e Simétrica) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-0.5 border-b border-[#262626] pb-3">
          {/* Segmented Control: Todas vs Salvas Offline */}
          <div className="flex bg-[#232323] p-1 rounded-xl border border-[#333333] w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setOnlyDownloaded(false)}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                !onlyDownloaded
                  ? 'bg-gradient-to-r from-[#C98A2E] to-[#D97706] text-black shadow-sm font-black'
                  : 'text-[#A7A7A7] hover:text-[#FAF7F2]'
              }`}
            >
              <span>Todas</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  !onlyDownloaded ? 'bg-black/20 text-black' : 'bg-[#181818] text-[#888888]'
                }`}
              >
                {allTracks.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setOnlyDownloaded(true)}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                onlyDownloaded
                  ? 'bg-emerald-500 text-black shadow-sm font-black'
                  : 'text-[#A7A7A7] hover:text-[#FAF7F2]'
              }`}
            >
              <CheckCircle2
                className={`w-3.5 h-3.5 ${onlyDownloaded ? 'text-black' : 'text-emerald-400'}`}
              />
              <span>Salvas Offline</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  onlyDownloaded ? 'bg-black/20 text-black' : 'bg-[#181818] text-[#888888]'
                }`}
              >
                {downloadedTrackIds.length}
              </span>
            </button>
          </div>

          {/* Controles de Visualização: Ordenar & Alternar Cards/Lista (Perfeitamente Alinhados) */}
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            {/* Dropdown de Ordenação */}
            <div className="flex-1 sm:flex-initial flex items-center gap-1.5 bg-[#232323] px-2.5 py-1.5 rounded-xl border border-[#333333] text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#C98A2E] shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-[#FAF7F2] font-semibold focus:outline-none cursor-pointer text-xs w-full sm:w-auto"
                aria-label="Ordenar modões"
              >
                <option value="default" className="bg-[#242424] text-[#FAF7F2]">Ordem do Disco</option>
                <option value="title" className="bg-[#242424] text-[#FAF7F2]">Título (A-Z)</option>
                <option value="artist" className="bg-[#242424] text-[#FAF7F2]">Artista (A-Z)</option>
                <option value="duration" className="bg-[#242424] text-[#FAF7F2]">Mais Longas</option>
              </select>
            </div>

            {/* Alternador de Visualização: Cards em Grade vs Lista */}
            <div className="flex items-center bg-[#232323] p-1 rounded-xl border border-[#333333] shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-[#C98A2E] text-black shadow-sm font-bold'
                    : 'text-[#A7A7A7] hover:text-[#FAF7F2]'
                }`}
                title="Visualização em Cards"
                aria-label="Visualização em grade de cards"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'list'
                    ? 'bg-[#C98A2E] text-black shadow-sm font-bold'
                    : 'text-[#A7A7A7] hover:text-[#FAF7F2]'
                }`}
                title="Visualização em Lista"
                aria-label="Visualização em lista"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Filtros Arrastáveis por Estilo de Modão */}
        <div className="space-y-2">
          {/* Cabeçalho dos Filtros com Setas Embutidas (Sem sobrepor os botões!) */}
          <div className="flex items-center justify-between text-xs font-semibold text-[#A7A7A7]">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#C98A2E]" />
              <span className="text-[#FAF7F2] font-bold">Estilo de Modão:</span>
              <span className="text-[11px] text-[#777777] hidden sm:inline font-normal">
                (Arraste para os lados ou use as setas)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {(searchQuery || selectedGenre !== 'all' || onlyDownloaded || sortBy !== 'default') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[#C98A2E] hover:underline font-bold transition text-xs mr-0.5"
                >
                  Limpar
                </button>
              )}

              {/* Setas de rolagem embutidas na barra de título - nunca cobrem as categorias! */}
              <div className="flex items-center gap-1 bg-[#232323] p-0.5 rounded-lg border border-[#333333]">
                <button
                  type="button"
                  onClick={() => handleScrollStep('left')}
                  disabled={!canScrollLeft}
                  className="w-6 h-6 rounded-md hover:bg-[#C98A2E] text-[#FAF7F2] hover:text-black disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-[#FAF7F2] flex items-center justify-center transition active:scale-90"
                  title="Rolar filtros para esquerda"
                  aria-label="Rolar filtros para esquerda"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleScrollStep('right')}
                  disabled={!canScrollRight}
                  className="w-6 h-6 rounded-md hover:bg-[#C98A2E] text-[#FAF7F2] hover:text-black disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-[#FAF7F2] flex items-center justify-center transition active:scale-90"
                  title="Rolar filtros para direita"
                  aria-label="Rolar filtros para direita"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Container dos Filtros: Arrastável com Mouse no Computador e Dedo no Celular */}
          <div
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 select-none scroll-smooth transition-all ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {GENRE_FILTERS.map(filter => {
              const isSelected = selectedGenre === filter.id;
              const count = genreCounts[filter.id] || 0;
              const emoji = GENRE_EMOJIS[filter.id] || '🎵';

              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => {
                    if (hasDragged) return; // Não ativa clique se estava arrastando
                    setSelectedGenre(filter.id);
                  }}
                  className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition-all active:scale-95 flex items-center gap-1.5 select-none shadow-sm ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#F59E0B] via-[#C98A2E] to-[#D97706] text-black shadow-md shadow-[#C98A2E]/25 font-black ring-1 ring-[#F59E0B]/60 scale-[1.02]'
                      : 'bg-[#232323] text-[#B8B8B8] hover:text-[#FAF7F2] hover:bg-[#2A2A2A] border border-[#343434] hover:border-[#C98A2E]/50'
                  }`}
                >
                  <span className="text-xs sm:text-sm">{emoji}</span>
                  <span className="whitespace-nowrap">{filter.label}</span>
                  <span
                    className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-full font-bold tabular-nums transition ${
                      isSelected
                        ? 'bg-black/30 text-black'
                        : 'bg-[#181818] text-[#888888]'
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

      {/* 4. Conteúdo: Grade de Cards de Modões OU Lista Elegante */}
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
      ) : viewMode === 'grid' ? (
        /* Modo Grade de Cards de Modão - Perfeito para Celular, Tablet e Computador */
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4.5">
            {displayedTracks.map((track, idx) => (
              <TrackCard
                key={track.id}
                track={track}
                index={idx}
                playlistContext={filteredTracks}
              />
            ))}
          </div>

          {/* Sentinela de rolagem contínua fluida para celular & indicador de total */}
          {visibleCount < filteredTracks.length && (
            <div
              ref={loadMoreSentinelRef}
              className="py-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-center"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-[#8E8E8E]">
                <Loader2 className="w-4 h-4 animate-spin text-[#C98A2E]" />
                <span>
                  Mostrando {displayedTracks.length} de {filteredTracks.length} modões
                </span>
              </div>
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => Math.min(prev + 24, filteredTracks.length))}
                className="px-4 py-2 rounded-xl bg-[#222222] hover:bg-[#2C2C2C] border border-[#3A3A3A] hover:border-[#C98A2E]/60 text-xs font-bold text-[#FAF7F2] transition active:scale-95 shadow-sm"
              >
                Carregar mais modões (+24)
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Modo Lista Responsiva em 2 Colunas no Computador / Tablet para Melhor Ergonomia */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
            {displayedTracks.map((track, idx) => (
              <TrackListItem
                key={track.id}
                track={track}
                index={idx}
                showIndex
                playlistContext={filteredTracks}
              />
            ))}
          </div>

          {/* Sentinela de rolagem contínua fluida para celular & indicador de total */}
          {visibleCount < filteredTracks.length && (
            <div
              ref={loadMoreSentinelRef}
              className="py-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-center"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-[#8E8E8E]">
                <Loader2 className="w-4 h-4 animate-spin text-[#C98A2E]" />
                <span>
                  Mostrando {displayedTracks.length} de {filteredTracks.length} modões
                </span>
              </div>
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => Math.min(prev + 24, filteredTracks.length))}
                className="px-4 py-2 rounded-xl bg-[#222222] hover:bg-[#2C2C2C] border border-[#3A3A3A] hover:border-[#C98A2E]/60 text-xs font-bold text-[#FAF7F2] transition active:scale-95 shadow-sm"
              >
                Carregar mais modões (+24)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
