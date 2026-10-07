import React, { useState } from 'react';
import { Download, Share2, X, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'banner' | 'pill' | 'header';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'pill' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setJustInstalled(true);
        setTimeout(() => setJustInstalled(false), 4000);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  // Render modal guide for iOS
  const renderIOSModal = () => {
    if (!showIOSGuide) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <div className="w-full max-w-sm rounded-2xl bg-[#1B1B1B] border border-[#333333] p-6 shadow-2xl text-left animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2A]">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📻</span>
              <h3 className="text-base font-bold text-[#FAF7F2]">Instalar no iPhone / iPad</h3>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="p-1 rounded-full text-[#A7A7A7] hover:text-white hover:bg-[#2A2A2A] transition"
              aria-label="Fechar guia"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 space-y-3.5 text-sm text-[#A7A7A7]">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#242424] flex items-center justify-center shrink-0 text-[#C98A2E] font-bold">
                1
              </div>
              <p>
                Toque no botão <strong className="text-white inline-flex items-center gap-1"><Share2 className="w-3.5 h-3.5 inline text-[#C98A2E]" /> Compartilhar</strong> na barra do Safari.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#242424] flex items-center justify-center shrink-0 text-[#C98A2E] font-bold">
                2
              </div>
              <p>
                Role para baixo e selecione <strong className="text-white">"Adicionar à Tela de Início"</strong>.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#242424] flex items-center justify-center shrink-0 text-[#C98A2E] font-bold">
                3
              </div>
              <p>
                Toque em <strong className="text-[#C98A2E]">Adicionar</strong> no canto superior direito para ouvir sem navegador!
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowIOSGuide(false)}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#C98A2E] to-[#D97706] py-3 text-sm font-semibold text-black hover:brightness-110 active:scale-95 transition"
          >
            Entendi, vou adicionar
          </button>
        </div>
      </div>
    );
  };

  if (justInstalled) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1F4D3A] text-white text-xs font-semibold">
        <Check className="w-4 h-4 text-emerald-400" />
        Aplicativo instalado!
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <>
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
            onClick={handleInstallClick}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C98A2E] to-[#D97706] px-5 py-2.5 text-xs sm:text-sm font-bold text-black shadow-md hover:brightness-110 active:scale-95 transition"
          >
            <Download className="w-4 h-4" />
            Instalar Aplicativo
          </button>
        </div>
        {renderIOSModal()}
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-2 rounded-full border border-[#C98A2E]/50 bg-[#242424]/90 px-3.5 py-1.5 text-xs font-semibold text-[#F3E7D3] hover:border-[#C98A2E] hover:bg-[#2A2A2A] transition active:scale-95"
        title="Instalar aplicativo no celular"
      >
        <Download className="w-3.5 h-3.5 text-[#C98A2E]" />
        <span>Instalar App</span>
      </button>
      {renderIOSModal()}
    </>
  );
};
