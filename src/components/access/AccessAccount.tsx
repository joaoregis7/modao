import React, { useState } from 'react';
import { LogOut, UserRound } from 'lucide-react';
import { useAccess } from '../../context/AccessContext';

export function AccessAccount() {
  const { access, logout } = useAccess();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const exit = async () => {
    setBusy(true); setError('');
    try { await logout(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  return (
    <div className="mb-5 text-xs text-modao-gray">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex min-w-0 items-center gap-2"><UserRound className="h-3.5 w-3.5 shrink-0 text-modao-gold" /><span className="truncate">{access?.email}</span></span>
        <button type="button" onClick={() => void exit()} disabled={busy} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-modao-gray transition hover:bg-modao-surface hover:text-modao-white focus-visible:outline-2 focus-visible:outline-modao-gold disabled:opacity-50"><LogOut className="h-3.5 w-3.5" />{busy ? 'Saindo...' : 'Sair'}</button>
      </div>
      {error && <p role="alert" className="mt-2 text-red-300">{error}</p>}
    </div>
  );
}
