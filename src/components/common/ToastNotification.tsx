import React from 'react';
import { CheckCircle2, Download, AlertCircle, X } from 'lucide-react';
import { useAudioPlayer } from '../../context/AudioPlayerContext';

export const ToastNotification: React.FC = () => {
  const { toast, hideToast } = useAudioPlayer();

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isInfo = toast.type === 'info';

  return (
    <div className="fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 z-[90] w-[92%] max-w-[420px] pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="pointer-events-auto bg-gradient-to-r from-[#1C1A17] via-[#24201A] to-[#1C1A17] border border-[#C98A2E]/60 rounded-2xl p-3 sm:p-3.5 shadow-2xl shadow-black/80 flex items-center justify-between gap-3 text-[#FAF7F2]">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
              isSuccess
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : isInfo
                ? 'bg-[#C98A2E]/20 text-[#F59E0B] border-[#C98A2E]/40'
                : 'bg-red-500/20 text-red-400 border-red-500/40'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-5 h-5 stroke-[2.3]" />
            ) : isInfo ? (
              <Download className="w-5 h-5 stroke-[2.3]" />
            ) : (
              <AlertCircle className="w-5 h-5 stroke-[2.3]" />
            )}
          </div>
          <div className="min-w-0">
            <h5 className="font-heading font-black text-xs sm:text-sm text-[#FAF7F2] truncate leading-snug">
              {toast.title}
            </h5>
            <p className="text-[11px] sm:text-xs text-[#A8A8A8] truncate leading-snug mt-0.5">
              {toast.message}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={hideToast}
          className="p-1 rounded-lg text-[#888888] hover:text-[#FAF7F2] hover:bg-[#2F2C27] transition shrink-0"
          aria-label="Fechar notificação"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
