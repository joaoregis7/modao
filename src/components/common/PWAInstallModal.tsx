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
  Loader2,
  Info,
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
  const [showManualNotice, setShowManualNotice] = useState(false);

  useEffect(() => {
    if (isIOS) {
      setActivePlatform('ios');
    } else {
      setActivePlatform('android');
    }
  }, [isIOS]);

  if (!isInstallModalOpen) {
    return null;
  }

  const handleDismiss = () => {
    try {
      localStorage.setItem('modao_pwa_dismissed', 'true');
    } catch {}
    closeInstallModal();
  };

  const handleAndroidInstall = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      try {
        const res = await install();
        if (res) {
          setInstalledSuccess(true);
          setTimeout(() => {
            handleDismiss();
          }, 2500);
          return;
        }
      } catch (err) {
        console.warn('Install error', err);
      } finally {
        setIsInstalling(false);
      }
    }
    // If not direct 1-tap ready (e.g. Chrome prompt pending or webview), display prominent guidance
    setShowManualNotice(true);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleDismiss}
    >
      {/* Container compacto e responsivo (cabe perfeitamente em qualquer celular sem barra de rolagem cortando) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] max-h-[92dvh] overflow-y-auto bg-gradient-to-b from-[#1E1C18] via-[#161513] to-[#100F0E] border border-[#C98A2E]/50 rounded-3xl p-4 sm:p-5 shadow-2xl relative text-[#FAF7F2] select-none flex flex-col justify-between"
      >
        {/* Botão de Fechar no topo */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-3.5 top-3.5 w-8 h-8 rounded-full bg-[#262422] hover:bg-[#34302D] text-[#A8A8A8] hover:text-[#FAF7F2] flex items-center justify-center transition active:scale-90 z-10"
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
            <div className="flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3 h-3 text-[#F59E0B] shrink-0" />
              <span className="text-[11px] sm:text-xs text-[#A7A7A7] font-medium leading-none">
                Sem ocupar espaço
              </span>
            </div>
          </div>
        </div>

        {/* Se o app já estiver instalado no dispositivo do usuário */}
        {isInstalled ? (
          <div className="my-5 py-4 px-3 bg-[#201E1A] border border-emerald-500/40 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-heading font-black text-sm sm:text-base text-[#FAF7F2]">
                Aplicativo Já Instalado no Celular!
              </h4>
              <p className="text-[11px] sm:text-xs text-[#A8A8A8] mt-1 max-w-[280px] mx-auto leading-relaxed">
                A Rádio Modão já está disponível na sua tela de início. Você pode abrir o ícone direto no seu celular para ouvir seus modões!
              </p>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#C98A2E] to-[#D97706] text-black font-heading font-black text-xs hover:brightness-110 active:scale-95 transition shadow-md shadow-[#C98A2E]/20"
            >
              Continuar Ouvindo
            </button>
          </div>
        ) : (
          <>
            {/* Seletor de Plataforma: iPhone ou Android */}
            <div className="mt-3 bg-[#201E1A] p-1 rounded-2xl border border-[#33302A] flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setActivePlatform('android');
                  setShowManualNotice(false);
                }}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 ${
                  activePlatform === 'android'
                    ? 'bg-gradient-to-r from-[#C98A2E] to-[#D97706] text-black shadow-md font-black'
                    : 'text-[#A8A8A8] hover:text-[#FAF7F2]'
                }`}
              >
                <span className="text-sm">🤖</span>
                <span>Android</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActivePlatform('ios');
                  setShowManualNotice(false);
                }}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 ${
                  activePlatform === 'ios'
                    ? 'bg-gradient-to-r from-[#C98A2E] to-[#D97706] text-black shadow-md font-black'
                    : 'text-[#A8A8A8] hover:text-[#FAF7F2]'
                }`}
              >
                <span className="text-sm">🍏</span>
                <span>iPhone (iOS)</span>
              </button>
            </div>

            {/* Conteúdo do Passo a Passo (Compacto, sem scroll excessivo) */}
            <div className="mt-3 space-y-2">
              {activePlatform === 'android' ? (
                /* Conteúdo Android */
                <>
                  {/* Botão de Ação Direta no Android */}
                  <button
                    type="button"
                    onClick={handleAndroidInstall}
                    disabled={isInstalling || installedSuccess}
                    className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#C98A2E] via-[#D97706] to-[#B45309] hover:brightness-110 text-black font-heading font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#C98A2E]/25 active:scale-95 transition"
                  >
                    {installedSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-black" />
                        <span>Instalado com Sucesso!</span>
                      </>
                    ) : isInstalling ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Instalando...</span>
                      </>
                    ) : isInstallable ? (
                      <>
                        <Zap className="w-4 h-4 fill-current text-black" />
                        <span>Instalar Agora com 1 Toque</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 stroke-[2.5]" />
                        <span>Baixar e Instalar no Celular</span>
                      </>
                    )}
                  </button>

                  {/* Aviso animado se o Chrome exigir o menu de 3 pontinhos */}
                  {showManualNotice && (
                    <div className="bg-amber-500/15 border border-amber-500/40 rounded-xl p-2.5 flex items-start gap-2 text-xs text-amber-200 animate-in fade-in">
                      <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="leading-tight">
                        No Chrome, toque nos <strong>3 pontinhos (⋮)</strong> no topo direito e escolha <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                      </p>
                    </div>
                  )}

                  {/* 3 Passos Visuais para Android */}
                  <div className="space-y-1.5">
                    <div className="bg-[#201E1A] border border-[#2F2C27] rounded-2xl p-2 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                        <MoreVertical className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                      <div className="text-xs min-w-0">
                        <p className="font-bold text-[#FAF7F2] leading-tight">
                          1. No Chrome, toque nos <span className="text-amber-400">3 pontinhos (⋮)</span>
                        </p>
                        <p className="text-[10px] text-[#8E8E8E] leading-tight">
                          No canto superior direito da tela
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#201E1A] border border-[#2F2C27] rounded-2xl p-2 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#C98A2E]/20 text-[#F59E0B] border border-[#C98A2E]/35 flex items-center justify-center shrink-0">
                        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                      <div className="text-xs min-w-0">
                        <p className="font-bold text-[#FAF7F2] leading-tight">
                          2. Toque em <span className="text-[#F59E0B]">"Instalar aplicativo"</span>
                        </p>
                        <p className="text-[10px] text-[#8E8E8E] leading-tight">
                          Ou "Adicionar à tela inicial"
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#201E1A] border border-[#2F2C27] rounded-2xl p-2 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                      <div className="text-xs min-w-0">
                        <p className="font-bold text-[#FAF7F2] leading-tight">
                          3. Confirme em <span className="text-emerald-400">"Instalar"</span>
                        </p>
                        <p className="text-[10px] text-[#8E8E8E] leading-tight">
                          O ícone fica pronto na sua tela do celular
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Conteúdo iPhone (iOS) */
                <div className="space-y-1.5">
                  <div className="bg-blue-500/15 border border-blue-500/35 rounded-xl p-2 flex items-center gap-2 text-xs text-blue-200">
                    <Smartphone className="w-4 h-4 text-blue-400 shrink-0" />
                    <p className="leading-tight text-[11px]">
                      Abra pelo navegador <strong>Safari</strong> do iPhone para adicionar à tela de início.
                    </p>
                  </div>

                  <div className="bg-[#201E1A] border border-[#2F2C27] rounded-2xl p-2 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                      <Share className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div className="text-xs min-w-0">
                      <p className="font-bold text-[#FAF7F2] leading-tight">
                        1. No Safari, toque em <span className="text-blue-400">Compartilhar</span>
                      </p>
                      <p className="text-[10px] text-[#8E8E8E] leading-tight">
                        Ícone com a setinha para cima na barra inferior
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#201E1A] border border-[#2F2C27] rounded-2xl p-2 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#C98A2E]/20 text-[#F59E0B] border border-[#C98A2E]/35 flex items-center justify-center shrink-0">
                      <PlusSquare className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div className="text-xs min-w-0">
                      <p className="font-bold text-[#FAF7F2] leading-tight">
                        2. Toque em <span className="text-[#F59E0B]">"Adicionar à Tela de Início"</span>
                      </p>
                      <p className="text-[10px] text-[#8E8E8E] leading-tight">
                        Role um pouco a lista de opções para baixo
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#201E1A] border border-[#2F2C27] rounded-2xl p-2 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div className="text-xs min-w-0">
                      <p className="font-bold text-[#FAF7F2] leading-tight">
                        3. Toque em <span className="text-emerald-400">"Adicionar"</span> no topo
                      </p>
                      <p className="text-[10px] text-[#8E8E8E] leading-tight">
                        Pronto! O app abre em tela cheia no iPhone
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Rodapé: Botões de Ação */}
            <div className="mt-3 pt-2.5 border-t border-[#262420] flex items-center justify-between gap-2.5">
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
          </>
        )}
      </div>
    </div>
  );
};
