import React, { useState, useEffect } from 'react';
import {
  X,
  Share,
  PlusSquare,
  CheckCircle2,
  Download,
  Smartphone,
  Sparkles,
  Zap,
  MoreVertical,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useAudioPlayer } from '../../context/AudioPlayerContext';

export const PWAInstallModal: React.FC = () => {
  const { isInstallModalOpen, closeInstallModal } = useAudioPlayer();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // Auto-seleciona a aba correta com base no dispositivo do usuário
  const [activePlatform, setActivePlatform] = useState<'ios' | 'android'>('android');
  const [isInstalling, setIsInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    if (isIOS) {
      setActivePlatform('ios');
    } else {
      setActivePlatform('android');
    }
  }, [isIOS]);

  if (!isInstallModalOpen || isInstalled) {
    return null;
  }

  const handleDismiss = () => {
    try {
      localStorage.setItem('modao_pwa_dismissed', 'true');
    } catch {}
    closeInstallModal();
  };

  const handleDirectInstall = async () => {
    if (!isInstallable) return;
    setIsInstalling(true);
    try {
      const res = await install();
      if (res) {
        setInstalledSuccess(true);
        setTimeout(() => {
          handleDismiss();
        }, 2500);
      }
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Container compacto sem barra de rolagem (cabe perfeitamente na tela de qualquer celular) */}
      <div className="w-full max-w-[420px] bg-gradient-to-b from-[#1C1A17] via-[#161513] to-[#11100F] border border-[#C98A2E]/40 rounded-3xl p-4 sm:p-5 shadow-2xl relative text-[#FAF7F2] select-none flex flex-col justify-between">
        
        {/* Botão de Fechar no topo */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-3.5 top-3.5 w-8 h-8 rounded-full bg-[#242220] hover:bg-[#322E2B] text-[#A8A8A8] hover:text-[#FAF7F2] flex items-center justify-center transition active:scale-90"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Topo: Logo Exata da Rádio Modão + Título */}
        <div className="flex items-center gap-3 pr-8">
          <div className="p-1.5 rounded-2xl bg-[#221F1B] border border-[#3A3326] shadow-md shrink-0 flex items-center justify-center">
            <img
              src="/logo-radio-modao.webp"
              alt="Rádio Modão"
              className="h-10 sm:h-11 w-auto max-w-[125px] sm:max-w-[135px] object-contain drop-shadow"
            />
          </div>
          <div className="min-w-0">
            <h3 className="font-heading font-black text-base sm:text-lg text-[#FAF7F2] tracking-tight leading-tight">
              Instale o Aplicativo
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <Sparkles className="w-3 h-3 text-[#F59E0B] shrink-0" />
              <span className="text-[11px] sm:text-xs text-[#A7A7A7] font-medium leading-none">
                Sem ocupar espaço
              </span>
            </div>
          </div>
        </div>

        {/* Seletor de Plataforma: iPhone ou Android */}
        <div className="mt-3.5 bg-[#201E1A] p-1 rounded-2xl border border-[#33302A] flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActivePlatform('ios')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 ${
              activePlatform === 'ios'
                ? 'bg-gradient-to-r from-[#C98A2E] to-[#D97706] text-black shadow-md font-black'
                : 'text-[#A8A8A8] hover:text-[#FAF7F2]'
            }`}
          >
            <span className="text-sm">🍏</span>
            <span>iPhone (iOS)</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePlatform('android')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 ${
              activePlatform === 'android'
                ? 'bg-gradient-to-r from-[#C98A2E] to-[#D97706] text-black shadow-md font-black'
                : 'text-[#A8A8A8] hover:text-[#FAF7F2]'
            }`}
          >
            <span className="text-sm">🤖</span>
            <span>Android</span>
          </button>
        </div>

        {/* Conteúdo do Passo a Passo (Compacto, sem scroll) */}
        <div className="mt-3">
          {activePlatform === 'ios' ? (
            /* Guia Passo a Passo para iPhone / iPad */
            <div className="space-y-2">
              <div className="bg-[#201E1A] border border-[#2F2C27] rounded-2xl p-2.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <Share className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-[#FAF7F2] leading-tight">
                    1. No Safari, toque em <span className="text-blue-400">Compartilhar</span>
                  </p>
                  <p className="text-[11px] text-[#8E8E8E] leading-tight mt-0.5">
                    Ícone do quadrado com a setinha para cima na barra inferior
                  </p>
                </div>
              </div>

              <div className="bg-[#201E1A] border border-[#2F2C27] rounded-2xl p-2.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#C98A2E]/20 text-[#F59E0B] border border-[#C98A2E]/35 flex items-center justify-center shrink-0">
                  <PlusSquare className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-[#FAF7F2] leading-tight">
                    2. Toque em <span className="text-[#F59E0B]">"Adicionar à Tela de Início"</span>
                  </p>
                  <p className="text-[11px] text-[#8E8E8E] leading-tight mt-0.5">
                    Role a lista para baixo até encontrar o ícone de adicionar
                  </p>
                </div>
              </div>

              <div className="bg-[#201E1A] border border-[#2F2C27] rounded-2xl p-2.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-[#FAF7F2] leading-tight">
                    3. Toque em <span className="text-emerald-400">"Adicionar"</span> no topo
                  </p>
                  <p className="text-[11px] text-[#8E8E8E] leading-tight mt-0.5">
                    Pronto! O app abre sem navegador em tela cheia
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Guia Passo a Passo para Android */
            <div className="space-y-2">
              {/* Botão de Instalação Direta 1-Toque no Android quando suportado */}
              {isInstallable && (
                <button
                  type="button"
                  onClick={handleDirectInstall}
                  disabled={isInstalling || installedSuccess}
                  className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#10B981] via-[#059669] to-[#047857] hover:brightness-110 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 active:scale-95 transition"
                >
                  {installedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Instalado com Sucesso!</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current text-amber-300" />
                      <span>Instalar Agora com 1 Toque</span>
                    </>
                  )}
                </button>
              )}

              <div className="bg-[#201E1A] border border-[#2F2C27] rounded-2xl p-2.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <MoreVertical className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-[#FAF7F2] leading-tight">
                    1. No Chrome, toque nos <span className="text-amber-400">3 pontinhos (⋮)</span>
                  </p>
                  <p className="text-[11px] text-[#8E8E8E] leading-tight mt-0.5">
                    Fica no canto superior direito do seu navegador
                  </p>
                </div>
              </div>

              <div className="bg-[#201E1A] border border-[#2F2C27] rounded-2xl p-2.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#C98A2E]/20 text-[#F59E0B] border border-[#C98A2E]/35 flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-[#FAF7F2] leading-tight">
                    2. Toque em <span className="text-[#F59E0B]">"Instalar aplicativo"</span>
                  </p>
                  <p className="text-[11px] text-[#8E8E8E] leading-tight mt-0.5">
                    Ou selecione "Adicionar à tela inicial"
                  </p>
                </div>
              </div>

              <div className="bg-[#201E1A] border border-[#2F2C27] rounded-2xl p-2.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-[#FAF7F2] leading-tight">
                    3. Confirme em <span className="text-emerald-400">"Instalar"</span>
                  </p>
                  <p className="text-[11px] text-[#8E8E8E] leading-tight mt-0.5">
                    O ícone da Rádio Modão fica pronto nos seus apps
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé: Botões de Ação */}
        <div className="mt-3.5 pt-3 border-t border-[#262420] flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleDismiss}
            className="text-xs font-semibold text-[#8E8E8E] hover:text-[#FAF7F2] transition py-1.5 px-2"
          >
            Lembrar mais tarde
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C98A2E] to-[#D97706] text-black font-heading font-black text-xs hover:brightness-110 active:scale-95 transition shadow-md shadow-[#C98A2E]/20"
          >
            Entendi, vou adicionar
          </button>
        </div>
      </div>
    </div>
  );
};
