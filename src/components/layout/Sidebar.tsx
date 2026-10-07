import React from 'react';
import { Home, Music2, Car, Radio, Sparkles, Heart } from 'lucide-react';
import { ViewState } from '../../types';
import { STATIONS } from '../../data/stations';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { openCarMode, playRandomTrack, isCarMode, favorites } = useAudioPlayer();

  const navItems = [
    {
      id: 'home',
      label: 'Início',
      icon: Home,
      isActive: currentView.type === 'home' && !isCarMode,
      onClick: () => onNavigate({ type: 'home' }),
    },
    {
      id: 'all_tracks',
      label: 'Músicas',
      icon: Music2,
      isActive: currentView.type === 'all_tracks' && !isCarMode,
      onClick: () => onNavigate({ type: 'all_tracks' }),
    },
    {
      id: 'favorites',
      label: 'Favoritos',
      icon: Heart,
      badge: favorites.length > 0 ? favorites.length : undefined,
      isActive: currentView.type === 'favorites' && !isCarMode,
      onClick: () => onNavigate({ type: 'favorites' }),
    },
    {
      id: 'car_mode',
      label: 'Estrada',
      icon: Car,
      isActive: isCarMode,
      onClick: openCarMode,
    },
  ];

  return (
    <aside className="w-60 lg:w-64 shrink-0 bg-[#1B1B1B] border-r border-[#242424] flex flex-col justify-between h-full p-3.5 lg:p-4 select-none">
      <div className="space-y-6 overflow-y-auto pr-1">
        {/* Brand */}
        <div
          onClick={() => onNavigate({ type: 'home' })}
          className="flex items-center gap-3 cursor-pointer group px-2 py-1"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C98A2E] to-[#996016] flex items-center justify-center shadow-lg group-hover:scale-105 transition">
            <Radio className="w-5 h-5 text-black" />
          </div>
          <div>
            <span className="font-heading font-black text-lg text-[#FAF7F2] group-hover:text-[#C98A2E] transition block leading-tight">
              Rádio Modão
            </span>
            <span className="text-[11px] text-[#A7A7A7] leading-none">
              O modão de verdade
            </span>
          </div>
        </div>

        {/* Primary Navigation - Somente Início, Músicas e Estrada */}
        <nav className="space-y-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition ${
                  item.isActive
                    ? 'bg-[#242424] text-[#C98A2E] font-semibold border-l-4 border-[#C98A2E]'
                    : 'text-[#A7A7A7] hover:text-[#FAF7F2] hover:bg-[#242424]/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${item.isActive ? 'text-[#C98A2E]' : 'text-[#A7A7A7]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    item.isActive ? 'bg-[#C98A2E] text-black' : 'bg-[#2E2E2E] text-[#A7A7A7]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick action: Tocar um modão pra mim */}
        <div className="pt-2">
          <button
            onClick={playRandomTrack}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#C98A2E] to-[#D97706] text-black font-bold text-sm shadow-md hover:brightness-110 active:scale-98 transition"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Tocar um Modão</span>
          </button>
        </div>

        {/* Stations Section */}
        <div className="pt-4 border-t border-[#242424]">
          <h3 className="px-3 text-xs font-bold uppercase tracking-wider text-[#A7A7A7]/70 mb-2">
            Estações de Modão
          </h3>
          <div className="space-y-1">
            {STATIONS.map(st => {
              const isStationActive =
                currentView.type === 'station' && currentView.stationId === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => onNavigate({ type: 'station', stationId: st.id })}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left truncate transition ${
                    isStationActive
                      ? 'bg-[#242424] text-[#C98A2E] font-semibold'
                      : 'text-[#A7A7A7] hover:text-[#FAF7F2] hover:bg-[#242424]/50'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isStationActive ? 'bg-[#C98A2E]' : 'bg-[#555555]'}`} />
                  <span className="truncate">{st.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom PWA Install Widget */}
      <div className="pt-3 border-t border-[#242424]">
        <PWAInstallButton variant="sidebar" />
      </div>
    </aside>
  );
};
