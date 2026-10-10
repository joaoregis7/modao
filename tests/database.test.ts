import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('migração e compras: duplicação, revogação, pacote, pedido independente e RLS', async () => {
  const db = new PGlite();
  try {
    await db.exec('create role anon; create role authenticated; create role service_role;');
    const sql = await readFile(new URL('../supabase/access.sql', import.meta.url), 'utf8');
    await db.exec(sql);
    await db.exec(sql); // Migração pode ser executada novamente.
    await db.exec(`insert into products(id,name) values ('extra','Complemento');
      insert into product_provider_ids values ('zuptos','pacote','radio-modao'), ('zuptos','pacote','extra');`);
    const apply = async (receipt: string, order: string, status: string, date: string, external = 'pacote') => {
      await db.query('insert into webhook_inbox(id,payload) values ($1,$2) on conflict do nothing', [receipt, {}]);
      await db.query('select apply_purchase_event($1,$2)', [receipt, { email: 'cliente@exemplo.com', order_id: order, external_product_ids: [external], status, occurred_at: date }]);
    };
    await apply('1','pedido-1','approved','2026-10-09T10:00:00Z');
    await apply('1','pedido-1','approved','2026-10-09T10:00:00Z');
    assert.equal((await db.query('select * from purchases')).rows.length, 2);
    await apply('2','pedido-1','refunded','2026-10-09T11:00:00Z');
    await apply('3','pedido-1','approved','2026-10-09T12:00:00Z');
    assert.equal((await db.query("select * from purchases where status='approved'")).rows.length, 0);
    await apply('4','pedido-2','approved','2026-10-09T12:00:00Z');
    assert.equal((await db.query("select * from purchases where status='approved'")).rows.length, 2);
    await apply('5','pedido-3','chargeback','2026-10-09T13:00:00Z');
    await apply('6','pedido-3','approved','2026-10-09T10:00:00Z');
    assert.equal((await db.query("select * from purchases where order_id='pedido-3' and status='approved'")).rows.length, 0);
    await assert.rejects(apply('7','pedido-4','approved','2026-10-09T10:00:00Z','desconhecido'));
    assert.equal((await db.query<{ processed_at: string | null }>("select processed_at from webhook_inbox where id='7'")).rows[0].processed_at, null);
    assert.equal((await db.query("select * from purchases where order_id='pedido-4'")).rows.length, 0);
    await db.exec('set role anon;');
    await assert.rejects(db.query('select * from purchases'));
    await assert.rejects(db.query("select access_rate_limit('teste')"));
    await db.exec('reset role;');
    const first = await db.query<{ count: number }>('select access_rate_limit($1) as count', ['teste']);
    const second = await db.query<{ count: number }>('select access_rate_limit($1) as count', ['teste']);
    assert.equal(first.rows[0]['count'], 1);
    assert.equal(second.rows[0]['count'], 2);
  } finally { await db.close(); }
});
