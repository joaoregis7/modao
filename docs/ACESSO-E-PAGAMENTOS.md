# Acesso por e-mail e compras — Rádio Modão

## Fluxo implementado

- O cliente informa o e-mail da compra, sem senha ou confirmação por e-mail.
- A API consulta compras aprovadas e cria uma sessão de 30 dias em cookie HttpOnly.
- Não existe login do Supabase Auth neste modelo. O Supabase é o banco, acessado apenas pelo servidor.
- O frontend consulta a sessão ao abrir, a cada minuto e ao voltar para a aba. Sem confirmação do servidor, bloqueia o aplicativo.
- O middleware da Vercel verifica a compra da plataforma também antes de servir arquivos locais em `/musicas/*`, incluindo pedidos Range.
- A interface atual mostra somente a entrada por e-mail e uma identificação discreta com botão Sair no início.
- O banco mantém a base de permissões por produto para expansão futura; não é necessário cadastrar complementos para ativar a entrada.
- Cada pedido é independente: reembolsar um pedido não cancela outro pedido aprovado do mesmo produto.

Qualquer pessoa que saiba o e-mail de um comprador pode entrar. Essa é a limitação aceita para este modelo. É necessário estar online para validar acesso; não há liberação offline baseada em localStorage.

### Armazenamento atual das músicas

O catálogo em `src/data/tracks.ts` aponta principalmente para URLs públicas `r2.dev` do Cloudflare R2. O bloqueio de entrada protege a interface da plataforma, mas o middleware da Vercel não protege esses endereços externos. Para restringir também o acesso direto aos MP3, será necessário desativar o acesso público do bucket e integrar URLs assinadas ou streaming autenticado usando as credenciais do R2. Arquivos já baixados não podem ser revogados no dispositivo. Os novos complementos podem usar o Storage privado descrito abaixo.

## 1. Criar o banco

1. Crie um projeto Supabase.
2. Execute `supabase/access.sql` no SQL Editor.
3. Copie a URL do projeto e a chave `service_role` para as variáveis da Vercel.
4. Nunca coloque a chave no frontend, no GitHub ou em variáveis com prefixo `VITE_`.

Todas as tabelas têm RLS e não permitem leitura pelo cliente. Contas e senhas de Supabase Auth não são necessárias.

### Estado da implantação

A entrada por e-mail foi publicada em `https://app.radiomodao.online`, com banco Supabase dedicado e variáveis configuradas no projeto `modao` da Vercel. A verificação em produção confirmou compra aprovada, sessão, bloqueio após revogação e recebimento autenticado de webhook. Os registros de teste foram removidos.

A liberação automática de vendas reais depende da conexão no painel Zuptos e do mapeamento de uma notificação real, conforme a seção 3. O banco inicia sem compradores cadastrados.

## 2. Configurar a Vercel

No projeto ligado a `joaoregis7/modao`, configure:

| Variável | Valor |
| --- | --- |
| `APP_URL` | `https://app.radiomodao.online` |
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de servidor `service_role` |
| `ZUPTOS_WEBHOOK_TOKEN` | Segredo aleatório de pelo menos 32 bytes |
| `ZUPTOS_TOKEN_HEADER` | Header enviado pela Zuptos; padrão `authorization` |

Pode gerar o segredo localmente com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Guarde o valor em local privado.

Use o preset Vite, comando de build `npm run build` e saída `dist`. API e middleware são reconhecidos na raiz. Após alterar variáveis, faça novo deploy. Em preview/local, `APP_URL` deve ser a origem exata usada no navegador.

## 3. Conectar a Zuptos pelo painel mostrado

- **Nome da conexão:** `Rádio Modão — acesso de compradores`.
- **URL de destino:** `https://app.radiomodao.online/api/zuptos-webhook`.
- **Token de autenticação:** ativar e usar o mesmo segredo configurado na Vercel. É necessário verificar qual header a plataforma envia; ajustar `ZUPTOS_TOKEN_HEADER` conforme esse header.
- Caso o painel não permita usar um header compatível, use a URL `https://app.radiomodao.online/api/zuptos-webhook?token=SEU_SEGREDO`. Trate a URL completa como credencial e não a compartilhe em prints.
- **Eventos:** pagamentos efetivamente aprovados (Pix pago, boleto pago e o equivalente a cartão aprovado), reembolsos e chargebacks, se disponíveis. Não use geração de Pix/boleto como confirmação.
- **Produtos:** selecione o acesso principal e os complementos vendidos.

### Descobrir o formato sem documentação

A integração não presume o JSON da Zuptos. Antes do mapeamento, uma notificação autenticada é registrada em `webhook_inbox` e recebe HTTP 202, **sem conceder acesso**.

1. Use o teste de webhook do painel, se disponível, ou uma compra controlada.
2. Consulte `webhook_inbox` pelo painel privado do Supabase.
3. Identifique os caminhos de e-mail, ID do pedido, ID(s) do produto, evento/status e data ISO 8601 do evento.
4. Preencha na Vercel `ZUPTOS_EMAIL_PATH`, `ZUPTOS_ORDER_PATH`, `ZUPTOS_PRODUCTS_PATH`, `ZUPTOS_STATUS_PATH`, `ZUPTOS_DATE_PATH` e `ZUPTOS_STATUS_MAP`.
5. O mapa é um JSON dos nomes reais para `approved`, `refunded` e `chargeback`. Eventos fora do mapa não liberam acesso. Caminhos usam pontos; `*` permite percorrer arrays.
6. Cadastre os IDs reais dos produtos em `product_provider_ids` e faça novo deploy.
7. Reprocesse as notificações já recebidas com `npm run webhook:replay`, usando as mesmas variáveis em um `.env` local privado.

**Pendente de confirmação real:** nomes de campos e eventos, header do token, formato da data, se o ID de pedido é estável entre compra/reembolso, notificações de order bump e disponibilidade de tentativas automáticas. Se a data vier como timestamp numérico ou o reembolso não trouxer e-mail/produtos, o normalizador precisará ser adaptado ao evento observado. Não configure caminhos ou valores adivinhados.

Cada corpo recebido tem um hash para evitar processamento duplicado. Uma transação registra a compra e marca o evento como processado. Produtos desconhecidos ou eventos malformados ficam pendentes, sem liberar acesso. Reembolso/chargeback revoga o pedido mesmo que chegue antes da aprovação.

## 4. Cadastrar produtos e checkouts

A migração cria apenas o produto principal `radio-modao`. Configure o checkout real e os IDs observados na Zuptos:

```sql
update public.products set checkout_url = 'https://SEU-CHECKOUT-REAL'
where id = 'radio-modao';

insert into public.product_provider_ids(provider, external_id, product_id)
values ('zuptos', 'ID-REAL-DO-PRODUTO', 'radio-modao');
```

Um pacote pode conceder vários produtos: insira uma linha por produto interno usando o mesmo ID externo. Não confunda o código da URL do checkout com o ID de produto sem verificar o evento.

Para um complemento:

```sql
insert into public.products(id, name, description, checkout_url)
values ('complemento-1', 'Nome do complemento', 'Descrição do conteúdo.', 'https://SEU-CHECKOUT-REAL');

insert into public.product_provider_ids(provider, external_id, product_id)
values ('zuptos', 'ID-REAL-DO-COMPLEMENTO', 'complemento-1');
```

Conteúdo privado: crie um bucket **privado** no Supabase Storage, envie o arquivo e cadastre `bucket/caminho/arquivo.pdf`:

```sql
insert into public.product_contents(product_id, storage_path)
values ('complemento-1', 'conteudos/complemento-1/arquivo.pdf');
```

A API valida a compra antes de gerar um link assinado válido por 120 segundos. Como alternativa, `content_url` permite cadastrar um link HTTPS externo; esse link continua sujeito à proteção do serviço que o hospeda e pode ser compartilhado. Nunca coloque arquivos pagos em `public/` ou em buckets públicos.

## 5. Compradores antigos e liberação manual

Webhooks não importam automaticamente vendas anteriores. Cadastre os compradores antigos antes de ativar o bloqueio em produção.

Para uma liberação pontual, configure `.env` local e execute:

```sh
npm run access:manage -- grant cliente@exemplo.com radio-modao pedido-manual-001
npm run access:manage -- revoke cliente@exemplo.com radio-modao pedido-manual-001
```

Para muitas compras, prepare uma planilha/CSV e importe pela tabela `purchases` no Supabase, com as colunas `provider`, `order_id`, `product_id`, `email`, `status`, `occurred_at`. Use e-mails em minúsculas, status `approved`, data ISO 8601 e IDs únicos por pedido/produto. Para vendas reais da Zuptos, use `provider=zuptos` e o ID real do pedido para que futuros reembolsos atualizem a mesma compra. Para liberações manuais, use `provider=manual`.

## 6. Verificação antes de publicar

```sh
npm install
npm run lint
npm test
npm run build
```

Para testar funções e middleware localmente, use `vercel dev` com `.env` e `APP_URL` correspondente. `vite` sozinho serve apenas o frontend e não executa as APIs da Vercel.

Para provisionar novamente a migração e as variáveis, há `npm run access:provision`. Ele exige `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `VERCEL_PROJECT_ID` e `VERCEL_SCOPE`, e autenticação na CLI Vercel. As credenciais devem ficar em `.env.setup.local`, ignorado pelo Git. O script preserva um token Zuptos já cadastrado.

`npm run access:check-live` usa `.env.production.local` (também ignorado pelo Git), cria uma compra temporária com endereço `example.com`, verifica os fluxos reais e remove os dados no fim. Para baixar as variáveis localmente, use `vercel env pull .env.production.local --environment=production`. O valor de `ZUPTOS_WEBHOOK_TOKEN` nesse arquivo pode ser copiado para configurar a conexão Zuptos; não compartilhe o arquivo, pois ele também contém a chave privada do banco.

Confirme em ambiente de teste: e-mail sem compra bloqueado, comprador autorizado, cookie de sessão, acesso direto a `/musicas/...` bloqueado sem sessão, complemento bloqueado antes da compra, conteúdo liberado após a compra, evento duplicado e reembolso. Também confira o player com busca por trecho (Range) na Vercel.

As notificações guardam dados de compra no banco privado para diagnóstico/reprocessamento. Não há logs de payloads ou tokens no aplicativo. Limpe periodicamente notificações processadas conforme sua necessidade e não compartilhe payloads com dados reais. As sessões expiradas e contadores antigos são limpos durante novas tentativas de login.
