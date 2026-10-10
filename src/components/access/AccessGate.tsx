import React, { useState } from 'react';
import { ArrowRight, CircleHelp, Headphones, LoaderCircle, Mail, Radio } from 'lucide-react';
import { useAccess } from '../../context/AccessContext';

const savedEmailKey = 'modao_saved_purchase_email';

export function AccessGate({ children }: { children: React.ReactNode }) {
  const { access, loading, error: serviceError, login } = useAccess();
  const [savedEmail] = useState(() => {
    try { return localStorage.getItem(savedEmailKey) || ''; } catch { return ''; }
  });
  const [email, setEmail] = useState(savedEmail);
  const [rememberEmail, setRememberEmail] = useState(Boolean(savedEmail));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (access?.platform) return <>{children}</>;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      await login(email);
      try {
        if (rememberEmail) localStorage.setItem(savedEmailKey, email.trim().toLowerCase());
        else localStorage.removeItem(savedEmailKey);
      } catch {}
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  return (
    <main className="relative isolate flex min-h-[100dvh] items-center justify-center overflow-hidden bg-modao-bg px-5 py-9 font-sans text-modao-white sm:px-8 sm:py-14">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ background: 'radial-gradient(ellipse at 15% 20%, rgba(201,138,46,0.12), transparent 55%), radial-gradient(ellipse at 90% 90%, rgba(31,77,58,0.15), transparent 50%)' }} />
      <div aria-hidden="true" className="pointer-events-none absolute -right-48 -top-48 -z-10 hidden h-[640px] w-[640px] rounded-full border border-modao-gold/10 p-12 lg:block">
        <div className="h-full w-full rounded-full border border-modao-gold/10 p-12"><div className="h-full w-full rounded-full border border-modao-gold/10" /></div>
      </div>
      <div className="w-full max-w-5xl">
        <div className="mb-8 flex justify-center lg:mb-12">
          <img src="/logo-radio-modao.webp" alt="Rádio Modão" className="h-16 w-auto max-w-[230px] object-contain sm:h-20" />
        </div>
        <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <section className="text-center">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-modao-gold/25 bg-modao-gold/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-modao-gold sm:text-xs"><Radio className="h-3.5 w-3.5" /> O modão de verdade</span>
            <h1 className="font-heading text-[2rem] font-extrabold leading-[1.18] tracking-tight sm:text-4xl lg:text-5xl">A sua história tem<br /><span className="text-modao-gold">trilha sonora.</span></h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-modao-gray sm:text-base lg:mt-5">Sertanejo raiz, modas de viola e os clássicos que nunca saem do coração.</p>
            <div className="mt-8 hidden items-center justify-center gap-3 lg:flex">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-modao-gold/20 bg-modao-gold/10"><Headphones className="h-5 w-5 text-modao-gold" /></div>
              <div><p className="text-sm font-semibold text-modao-beige">Seu cantinho do sertanejo raiz</p><p className="mt-0.5 text-xs text-modao-gray">No celular, no computador ou na estrada.</p></div>
            </div>
          </section>
          <section aria-labelledby="access-title" className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-modao-gold/20 bg-modao-surface p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-9">
            <div aria-hidden="true" className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-modao-gold/70 to-transparent" />
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-modao-gold/20 bg-modao-gold/10"><Mail className="h-5 w-5 text-modao-gold" /></div>
            <h2 id="access-title" className="font-heading text-2xl font-bold tracking-tight">Entre e dê o play.</h2>
            <p className="mb-5 mt-2 text-sm leading-relaxed text-modao-gray">Sem senha. Sem complicação.<br />É só informar seu e-mail e dar o play.</p>
            {loading ? <div role="status" className="flex min-h-40 items-center justify-center gap-3 text-sm text-modao-gray"><LoaderCircle className="h-5 w-5 animate-spin motion-reduce:animate-none text-modao-gold" /> Consultando seu acesso...</div> : (
              <form onSubmit={submit} aria-busy={busy}>
                <p id="purchase-email-notice" className="mb-5 rounded-xl border border-modao-gold/20 bg-modao-gold/5 px-3.5 py-3 text-sm leading-relaxed text-modao-beige"><span className="font-semibold text-modao-gold">Importante:</span> utilize o mesmo e-mail informado na compra para acessar.</p>
                <label htmlFor="purchase-email" className="mb-2 block text-sm font-semibold text-modao-beige">E-mail da compra</label>
                <div className="relative">
                  <Mail aria-hidden="true" className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-modao-gray" />
                  <input id="purchase-email" type="email" name="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} required maxLength={254} value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="Digite seu e-mail" disabled={busy} aria-describedby={`purchase-email-notice access-help${error || serviceError ? ' access-error' : ''}`} aria-invalid={Boolean(error)} className="w-full rounded-xl border border-[#3A3A3A] bg-modao-bg px-12 py-3.5 text-center text-base text-modao-white outline-none transition placeholder:text-[#777] hover:border-[#555] focus:border-modao-gold focus:ring-2 focus:ring-modao-gold/15 disabled:opacity-60" />
                </div>
                <label className="mt-4 inline-flex cursor-pointer items-center justify-center gap-2.5 text-xs text-modao-gray sm:text-sm">
                  <input type="checkbox" name="rememberEmail" checked={rememberEmail} disabled={busy} onChange={e => {
                    const checked = e.target.checked;
                    setRememberEmail(checked);
                    if (!checked) { try { localStorage.removeItem(savedEmailKey); } catch {} }
                  }} className="h-4 w-4 shrink-0 cursor-pointer accent-modao-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-modao-gold disabled:opacity-60" />
                  <span>Salvar meu e-mail neste dispositivo</span>
                </label>
                {(error || serviceError) && <p id="access-error" role="alert" className="mt-3 rounded-xl border border-red-400/15 bg-red-400/5 px-3 py-2.5 text-sm leading-relaxed text-red-300">{error || serviceError}</p>}
                <button type="submit" disabled={busy} className="mt-5 flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-modao-gold px-4 py-3.5 text-sm font-bold text-modao-bg shadow-[0_4px_20px_rgba(201,138,46,0.12)] transition hover:bg-[#DA9B3E] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-modao-gold active:scale-[0.99] disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none">
                  {busy ? <><LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" /> Consultando...</> : <>Entrar no Rádio Modão <ArrowRight className="h-4 w-4" /></>}
                </button>
                <div id="access-help" className="mt-6 border-t border-[#333] pt-5 text-xs leading-relaxed text-modao-gray"><CircleHelp className="mx-auto mb-2 h-4 w-4 text-modao-gold" /><p>Seu acesso é liberado após a confirmação do pagamento.</p></div>
              </form>
            )}
          </section>
        </div>
        <p className="mt-8 text-center text-[11px] text-modao-gray/60 sm:mt-12">Rádio Modão · Os clássicos de sempre, pertinho de você.</p>
      </div>
    </main>
  );
}
