import React, { useState } from 'react';
import { Radio, Car, Shuffle, Search, X } from 'lucide-react';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { ViewState } from '../../types';

interface HeaderProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { openCarMode, playRandomTrack } = useAudioPlayer();
  const currentSearchQuery = currentView.type === 'all_tracks' ? currentView.searchQuery || '' : '';
  const [headerSearch, setHeaderSearch] = useState(currentSearchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate({ type: 'all_tracks', searchQuery: headerSearch });
  };

  const handleSearchChange = (val: string) => {
    setHeaderSearch(val);
    onNavigate({ type: 'all_tracks', searchQuery: val });
  };

  const handleClear = () => {
    setHeaderSearch('');
    onNavigate({ type: 'all_tracks', searchQuery: '' });
  };

  return (
    <header className="sticky top-0 z-30 bg-[#121212]/95 backdrop-blur-md border-b border-[#242424] px-3 sm:px-6 py-2.5 sm:py-3 transition">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Mobile Brand identity (hidden on desktop to avoid duplicate logo with sidebar) */}
        <div
          onClick={() => {
            setHeaderSearch('');
            onNavigate({ type: 'home' });
          }}
          className="md:hidden flex items-center cursor-pointer select-none group shrink-0"
        >
          <img
            src="/logo-radio-modao.webp"
            alt="Rádio Modão"
            className="h-12 sm:h-14 w-auto max-w-[190px] sm:max-w-[230px] object-contain drop-shadow group-hover:scale-105 transition"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/logo-radio-modao';
            }}
          />
        </div>

        {/* Desktop View Context Title */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <span className="font-heading font-black text-base lg:text-lg text-[#FAF7F2] tracking-tight truncate max-w-[200px] lg:max-w-none">
            {currentView.type === 'home' && 'Início'}
            {currentView.type === 'all_tracks' && 'Músicas & Modões'}
            {currentView.type === 'favorites' && 'Meus Modões'}
            {currentView.type === 'station' && 'Estação Sertaneja'}
            {currentView.type === 'artist' && 'Lendas do Modão'}
            {currentView.type === 'playlist' && 'Seleção Especial'}
            {currentView.type === 'search' && 'Buscar Modões'}
          </span>
        </div>

        {/* Integrated Search Input (Comfortable balanced width) */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-[210px] xs:max-w-[260px] sm:max-w-[320px] md:max-w-[380px] lg:max-w-[420px] relative"
        >
          <Search className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C98A2E] pointer-events-none" />
          <input
            type="text"
            value={headerSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar modões e artistas..."
            className="w-full bg-[#1B1B1B] hover:bg-[#222222] focus:bg-[#242424] border border-[#2E2E2E] focus:border-[#C98A2E] rounded-full py-2 pl-9 sm:pl-10 pr-8 sm:pr-9 text-xs sm:text-sm text-[#FAF7F2] placeholder-[#777777] font-medium focus:outline-none transition shadow-inner"
          />
          {headerSearch && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 p-0.5 text-[#A7A7A7] hover:text-white rounded-full"
              aria-label="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Quick action buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Quick random track button (only on wider screens to prevent squeezing tablet) */}
          <button
            onClick={playRandomTrack}
            title="Tocar um modão aleatório agora"
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1B1B1B] border border-[#333333] hover:border-[#C98A2E] text-xs font-semibold text-[#FAF7F2] transition active:scale-95"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#C98A2E]" />
            <span>Aleatório</span>
          </button>

          {/* Car Mode button with enlarged car icon */}
          <button
            onClick={openCarMode}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-[#1B1B1B] hover:bg-[#222222] border border-[#3A3A3A] hover:border-[#D97706] text-xs sm:text-sm font-semibold text-[#FAF7F2] hover:text-[#D97706] transition active:scale-95 shadow-sm"
            title="Abrir Modo Estrada (Botões gigantes para viagem)"
          >
            <Car className="w-6 h-6 sm:w-7 sm:h-7 text-[#D97706] shrink-0 stroke-[2.2]" />
            <span className="hidden sm:inline">Modo Estrada</span>
          </button>

          {/* PWA Install Button */}
          <div className="hidden sm:block">
            <PWAInstallButton variant="pill" />
          </div>
        </div>
      </div>
    </header>
  );
};
