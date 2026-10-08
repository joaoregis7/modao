import React from 'react';
import { Home, Heart, Music, Car } from 'lucide-react';
import { ViewState } from '../../types';
import { useAudioPlayer } from '../../context/AudioPlayerContext';

interface BottomNavProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const { openCarMode, isCarMode } = useAudioPlayer();

  const navItems = [
    {
      id: 'home',
      label: 'Início',
      icon: Home,
      action: () => onNavigate({ type: 'home' }),
      isActive: currentView.type === 'home' && !isCarMode,
    },
    {
      id: 'all_tracks',
      label: 'Músicas',
      icon: Music,
      action: () => onNavigate({ type: 'all_tracks' }),
      isActive: currentView.type === 'all_tracks' && !isCarMode,
    },
    {
      id: 'car_mode',
      label: 'Estrada',
      icon: Car,
      action: openCarMode,
      isActive: isCarMode,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur-xl border-t border-[#242424]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex-1 flex flex-col items-center justify-center h-full py-1 transition select-none ${
                item.isActive ? 'text-[#C98A2E]' : 'text-[#A7A7A7] hover:text-[#FAF7F2]'
              }`}
            >
              <Icon className={`w-5 h-5 ${item.isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className={`text-xs mt-1 font-medium ${item.isActive ? 'font-bold text-[#C98A2E]' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
