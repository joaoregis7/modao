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
          className="md:hidden flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none group shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#C98A2E] to-[#996016] flex items-center justify-center shadow-md shadow-[#C98A2E]/20 group-hover:scale-105 transition">
            <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
          </div>
          <div className="hidden xs:block">
            <h1 className="font-heading font-extrabold text-base tracking-tight text-[#FAF7F2] group-hover:text-[#C98A2E] transition leading-none">
              Rádio Modão
            </h1>
            <p className="text-[10px] text-[#A7A7A7] font-medium leading-tight mt-0.5">
              O modão de verdade
            </p>
          </div>
        </div>

        {/* Desktop View Context Title */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <span className="font-heading font-black text-lg text-[#FAF7F2] tracking-tight">
            {currentView.type === 'home' && 'Início'}
            {currentView.type === 'all_tracks' && 'Catálogo de Músicas'}
            {currentView.type === 'favorites' && 'Meus Modões Favoritos'}
            {currentView.type === 'station' && 'Estação Sertaneja'}
            {currentView.type === 'artist' && 'Lendas do Modão'}
            {currentView.type === 'playlist' && 'Seleção Especial'}
            {currentView.type === 'search' && 'Buscar Modões'}
          </span>
        </div>

        {/* Integrated Search Input (Responsive width) */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-sm md:max-w-md lg:max-w-lg relative"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C98A2E] pointer-events-none" />
          <input
            type="text"
            value={headerSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar entre os 352 modões e artistas..."
            className="w-full bg-[#1B1B1B] hover:bg-[#222222] focus:bg-[#242424] border border-[#2E2E2E] focus:border-[#C98A2E] rounded-full py-2 pl-10 pr-9 text-xs sm:text-sm text-[#FAF7F2] placeholder-[#777777] font-medium focus:outline-none transition shadow-inner"
          />
          {headerSearch && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[#A7A7A7] hover:text-white rounded-full"
              aria-label="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Quick action buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Quick random track button */}
          <button
            onClick={playRandomTrack}
            title="Tocar um modão aleatório agora"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1B1B1B] border border-[#333333] hover:border-[#C98A2E] text-xs font-semibold text-[#FAF7F2] transition active:scale-95"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#C98A2E]" />
            <span>Aleatório</span>
          </button>

          {/* Car Mode button */}
          <button
            onClick={openCarMode}
            className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-[#1B1B1B] border border-[#333333] hover:border-[#D97706] text-xs font-semibold text-[#FAF7F2] hover:text-[#D97706] transition active:scale-95"
            title="Abrir Modo Estrada (Botões gigantes para viagem)"
          >
            <Car className="w-4 h-4 text-[#D97706]" />
            <span className="hidden lg:inline">Modo Estrada</span>
          </button>

          {/* PWA Install Button */}
          <div className="hidden xs:block">
            <PWAInstallButton variant="pill" />
          </div>
        </div>
      </div>
    </header>
  );
};
