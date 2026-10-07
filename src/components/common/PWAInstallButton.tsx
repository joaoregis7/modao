import React from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useAudioPlayer } from '../../context/AudioPlayerContext';

interface PWAInstallButtonProps {
  variant?: 'banner' | 'pill' | 'header' | 'sidebar';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'pill' }) => {
  const { isInstalled } = usePWAInstall();
  const { openInstallModal } = useAudioPlayer();

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = () => {
    openInstallModal();
  };

  if (variant === 'sidebar') {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-[#242424] border border-[#333333] hover:border-[#C98A2E]/50 p-3.5 flex flex-col gap-2.5 transition">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C98A2E] to-[#996016] flex items-center justify-center shadow shrink-0">
            <Smartphone className="w-4 h-4 text-black" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-[#FAF7F2] truncate leading-tight">
              Instale no Celular
            </h4>
            <p className="text-[10px] text-[#A7A7A7] truncate">
              Ouça com 1 toque na tela
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleInstallClick}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#C98A2E] to-[#D97706] py-2 px-3 text-xs font-bold text-black shadow hover:brightness-110 active:scale-95 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar Aplicativo</span>
        </button>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1B1B1B] via-[#242424] to-[#1F4D3A]/40 border border-[#C98A2E]/30 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C98A2E] to-[#996016] flex items-center justify-center shadow-lg shrink-0">
            <Smartphone className="w-6 h-6 text-black" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-[#FAF7F2]">
              Instale o Rádio Modão no seu celular
            </h4>
            <p className="text-xs sm:text-sm text-[#A7A7A7]">
              Acesse direto da sua tela inicial com um toque, sem digitar link.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleInstallClick}
          className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C98A2E] to-[#D97706] px-5 py-2.5 text-xs sm:text-sm font-bold text-black shadow-md hover:brightness-110 active:scale-95 transition"
        >
          <Download className="w-4 h-4" />
          Instalar Aplicativo
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleInstallClick}
      className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-[#1B1B1B] hover:bg-[#222222] border border-[#3A3A3A] hover:border-[#C98A2E] text-xs sm:text-sm font-semibold text-[#FAF7F2] hover:text-[#C98A2E] transition active:scale-95 shadow-sm"
      title="Instalar aplicativo no celular"
    >
      <Smartphone className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-[#C98A2E] shrink-0 stroke-[2.2]" />
      <span className="hidden sm:inline">Baixar App</span>
    </button>
  );
};
