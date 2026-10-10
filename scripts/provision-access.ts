import { config } from 'dotenv';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

config({ path: '.env.setup.local', quiet: true });
const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = process.env.SUPABASE_PROJECT_REF;
const vercelProject = process.env.VERCEL_PROJECT_ID;
const scope = process.env.VERCEL_SCOPE;
if (!token || !ref || !vercelProject || !scope) throw new Error('Informe SUPABASE_ACCESS_TOKEN, SUPABASE_PROJECT_REF, VERCEL_PROJECT_ID e VERCEL_SCOPE.');

async function management<T>(path: string, options: RequestInit = {}): Promise<T> {
  const result = await fetch(`https://api.supabase.com/v1/projects/${ref}/${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers },
    signal: AbortSignal.timeout(60000),
  });
  if (!result.ok) throw new Error(`Supabase: operação ${path} falhou (HTTP ${result.status}).`);
  return result.json();
}

const migration = await readFile(new URL('../supabase/access.sql', import.meta.url), 'utf8');
await management('database/query', { method: 'POST', body: JSON.stringify({ query: migration }) });
console.log('Migração de acesso aplicada ao Supabase.');

const keys = await management<{ name: string; api_key: string }[]>('api-keys');
const key = keys.find(item => item.name === 'service_role')?.api_key;
if (!key) throw new Error('Chave de servidor service_role não encontrada.');

function vercelApi(path: string, body?: unknown) {
  const args = ['api', path, '--scope', scope!];
  if (body !== undefined) args.push('--method', 'POST', '--input', '-', '--header', 'Content-Type:application/json', '--raw');
  else args.push('--raw');
  const result = spawnSync('vercel', args, {
    shell: process.platform === 'win32', encoding: 'utf8',
    input: body === undefined ? undefined : JSON.stringify(body),
    // O token de gerenciamento do Supabase não é necessário ao processo Vercel.
    env: { ...process.env, SUPABASE_ACCESS_TOKEN: '' },
  });
  if (result.status !== 0) {
    let detail = result.stderr || 'Erro ao executar a CLI.';
    const secrets = [token!, key!, ...(Array.isArray(body) ? body : body ? [body] : []).map(item => String(item.value || ''))];
    for (const secret of secrets) if (secret) detail = detail.split(secret).join('[redacted]');
    throw new Error(`Não foi possível configurar variáveis na Vercel: ${detail}`);
  }
  const parsed = JSON.parse(result.stdout);
  if (parsed.failed?.length) throw new Error('A Vercel recusou uma das variáveis de ambiente.');
  return parsed;
}

const existing = vercelApi(`/v10/projects/${vercelProject}/env`) as { envs: { key: string }[] };
const values: Record<string, string> = {
  APP_URL: 'https://app.radiomodao.online',
  SUPABASE_URL: `https://${ref}.supabase.co`,
  SUPABASE_SERVICE_ROLE_KEY: key,
  ZUPTOS_TOKEN_HEADER: 'authorization',
};
if (!existing.envs.some(item => item.key === 'ZUPTOS_WEBHOOK_TOKEN')) values.ZUPTOS_WEBHOOK_TOKEN = randomBytes(32).toString('hex');
const entries = Object.entries(values).map(([key, value]) => ({ key, value, type: 'encrypted', target: ['production', 'preview'] }));
for (const entry of entries) vercelApi(`/v10/projects/${vercelProject}/env?upsert=true`, entry);
console.log('Variáveis de servidor configuradas na Vercel, sem exibir credenciais.');
