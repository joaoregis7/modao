import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

export type AccessProduct = { id: string; name: string; description: string; checkout_url: string | null; is_platform: boolean; owned: boolean };
type Access = { email: string; platform: boolean; products: AccessProduct[] };
type State = { access: Access | null; loading: boolean; error: string; login: (email: string) => Promise<void>; logout: () => Promise<void>; refresh: () => Promise<void> };
const Context = createContext<State | null>(null);

export async function accessRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store', ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(body.error || 'Não foi possível consultar o acesso. Tente novamente.'), { status: response.status });
  return body;
}

export function AccessProvider({ children }: { children: React.ReactNode }) {
  const [access, setAccess] = useState<Access | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const revision = useRef(0);
  const refresh = useCallback(async () => {
    const requestRevision = ++revision.current;
    try {
      const next = await accessRequest<Access>('/api/access/session');
      if (revision.current !== requestRevision) return;
      setAccess(next); setError('');
    }
    catch (e) {
      if (revision.current !== requestRevision) return;
      const failure = e as Error & { status?: number };
      // Sem uma consulta bem-sucedida, o aplicativo não mantém acesso liberado.
      setAccess(null);
      setError(failure.status === 401 ? '' : failure.message);
    } finally { if (revision.current === requestRevision) setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); return () => { revision.current++; }; }, [refresh]);
  useEffect(() => {
    if (!access) return;
    const timer = window.setInterval(() => { void refresh(); }, 60000);
    const onVisible = () => { if (document.visibilityState === 'visible') void refresh(); };
    window.addEventListener('online', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => { window.clearInterval(timer); window.removeEventListener('online', onVisible); document.removeEventListener('visibilitychange', onVisible); };
  }, [Boolean(access), refresh]);
  const login = async (email: string) => {
    const requestRevision = ++revision.current;
    const next = await accessRequest<Access>('/api/access/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    if (revision.current !== requestRevision) return;
    setAccess(next); setError('');
  };
  const logout = async () => {
    revision.current++;
    await accessRequest('/api/access/logout', { method: 'POST' });
    revision.current++;
    setAccess(null); setError('');
  };
  return <Context.Provider value={{ access, loading, error, login, logout, refresh }}>{children}</Context.Provider>;
}

export function useAccess() {
  const state = useContext(Context);
  if (!state) throw new Error('AccessProvider ausente');
  return state;
}
