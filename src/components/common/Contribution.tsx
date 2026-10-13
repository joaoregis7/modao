import React, { useEffect, useRef, useState } from 'react';
import { Copy, Check, Heart, MessageCircle, X } from 'lucide-react';

const PIX_KEY = '61982441768';
const AMOUNTS = ['19,90', '29,90', '39,90'];
const RECEIPT_URL = `https://wa.me/5561982447459?text=${encodeURIComponent('Olá! Quero enviar o comprovante da minha contribuição para a Rádio Modão.')}`;

function CopyPixButton({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  useEffect(() => {
    if (status !== 'copied') return;
    const timer = window.setTimeout(() => setStatus('idle'), 3000);
    return () => window.clearTimeout(timer);
  }, [status]);

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(PIX_KEY);
      } else {
        const input = document.createElement('textarea');
        input.value = PIX_KEY;
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        try {
          if (!document.execCommand('copy')) throw new Error('copy failed');
        } finally {
          input.remove();
        }
      }
      setStatus('copied');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div>
      <button type="button" onClick={copy} className={`flex items-center justify-center gap-2 rounded-xl bg-[#C98A2E] text-black font-bold hover:brightness-110 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${compact ? 'px-3 py-2 text-xs sm:text-sm' : 'w-full px-4 py-3 text-sm'}`}>
        {status === 'copied' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        <span aria-live="polite">{status === 'copied' ? 'PIX copiado!' : 'Copiar chave PIX'}</span>
      </button>
      {status === 'error' && <p role="status" className="mt-1 text-xs text-amber-200">Copie manualmente: {PIX_KEY}</p>}
    </div>
  );
}

function ReceiptLink() {
  return (
    <a href={RECEIPT_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 py-1 text-xs sm:text-sm font-semibold text-emerald-300 hover:text-emerald-200 underline underline-offset-4">
      <MessageCircle className="w-4 h-4 shrink-0" /> Enviar comprovante
    </a>
  );
}

export function ContributionBanner({ onOpen }: { onOpen: () => void }) {
  return (
    <section aria-label="Contribuição para a Rádio Modão" className="shrink-0 border-b border-[#C98A2E]/30 bg-[#211B13] px-3 sm:px-6 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <button type="button" onClick={onOpen} className="min-w-0 text-left group">
          <span className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[#E9B968]"><Heart className="w-4 h-4 shrink-0" /> Lembre-se da contribuição</span>
          <span className="block mt-1 text-[11px] sm:text-sm text-[#FAF7F2]">R$ 19,90 · R$ 29,90 · R$ 39,90</span>
          <span className="hidden sm:block text-xs text-[#C6BCAE] mt-1">PIX {PIX_KEY} · João Felipe Regis · InfinitePay</span>
          <span className="block sm:hidden text-[10px] text-[#C6BCAE] mt-1">Ver dados do PIX</span>
        </button>
        <div className="shrink-0 flex flex-col gap-1">
          <CopyPixButton compact />
          <ReceiptLink />
        </div>
      </div>
    </section>
  );
}

export function ContributionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>('button, a[href]') ?? []);
    focusable()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current();
      }
      if (event.key === 'Tab') {
        const items = focusable();
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first?.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4" onClick={onClose}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="contribution-title" aria-describedby="contribution-description" onClick={event => event.stopPropagation()} className="relative w-full max-w-[420px] max-h-[90dvh] overflow-y-auto rounded-3xl border border-[#C98A2E]/50 bg-gradient-to-b from-[#211D17] to-[#121212] p-5 sm:p-6 text-center text-[#FAF7F2] shadow-2xl">
        <button type="button" onClick={onClose} aria-label="Fechar lembrete de contribuição" className="absolute top-3 right-3 p-2 rounded-full bg-white/10 hover:bg-white/20"><X className="w-5 h-5" /></button>
        <img src="/logo-radio-modao.webp" alt="Rádio Modão" className="h-12 w-auto mx-auto mb-5" />
        <h2 id="contribution-title" className="font-heading font-bold text-xl">Seu modão já está liberado!</h2>
        <p id="contribution-description" className="mt-2 text-sm text-[#C6BCAE] leading-relaxed">Você recebeu o acesso antes do pagamento. Se ainda não fez sua contribuição, lembre-se de enviar o PIX e depois o comprovante.</p>
        <div className="grid grid-cols-3 gap-2 my-4" aria-label="Valores de contribuição">
          {AMOUNTS.map(amount => <div key={amount} className="rounded-xl border border-[#C98A2E]/40 bg-[#C98A2E]/10 py-3 text-center text-sm font-bold text-[#E9B968]">R$ {amount}</div>)}
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 mb-4">
          <p className="text-xs text-[#C6BCAE]">Chave PIX (telefone)</p>
          <p className="text-xl font-bold tracking-wide select-all my-1">{PIX_KEY}</p>
          <p className="text-sm">João Felipe Regis</p>
          <p className="text-xs text-[#C6BCAE] mt-1">Banco InfinitePay</p>
        </div>
        <CopyPixButton />
        <div className="mt-3"><ReceiptLink /></div>
        <p className="text-center text-xs text-[#A8A8A8] mt-1">Envie pelo WhatsApp: (61) 98244-7459</p>
        <button type="button" onClick={onClose} className="w-full mt-4 py-2 text-sm text-[#C6BCAE] hover:text-white">Lembrar depois e continuar ouvindo</button>
      </div>
    </div>
  );
}
