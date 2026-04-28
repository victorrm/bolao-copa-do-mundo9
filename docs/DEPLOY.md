# Deploy Cloudflare

Stack: Next.js 15 + Cloudflare Workers (via OpenNext) + D1 + KV + R2.

## 1. Prerequisitos

```bash
pnpm install
wrangler login
```

## 2. Bootstrap automático

```bash
pnpm cf:bootstrap
```

Cria D1, KV e R2 e atualiza `wrangler.toml` com os IDs.

## 3. Aplicar migrations remotas

```bash
pnpm cf:migrate
```

## 4. Configurar secrets

```bash
wrangler secret put SESSION_SECRET            # 32+ bytes random
wrangler secret put SUPERADMIN_EMAIL          # email do admin inicial
wrangler secret put FOOTBALL_DATA_API_KEY     # chave de api.football-data.org
wrangler secret put RESEND_API_KEY            # opcional, sem chave usa console.log
wrangler secret put RESEND_FROM_EMAIL         # ex: bolao@empresa.com.br
wrangler secret put CRON_SECRET               # protege os cron endpoints
```

## 5. Build & deploy

```bash
pnpm cf:build
pnpm cf:deploy
```

O build do OpenNext gera `.open-next/worker.js`. O `worker-entry.js` na raiz wrappa esse handler e adiciona o `scheduled()` para rodar os cron triggers (sync-results, reminders, recap).

## 6. Promover superadmin e liberar domínio

Após o primeiro deploy, conecte ao D1 remoto:

```bash
wrangler d1 execute bolao-prod --remote \
  --command "INSERT INTO allowed_domains (domain, is_wildcard, created_at) VALUES ('SEU_DOMINIO.com', 0, strftime('%s','now'))"
```

Faça login pelo magic link, então:

```bash
wrangler d1 execute bolao-prod --remote \
  --command "UPDATE users SET role='superadmin' WHERE email='SEU_EMAIL'"
```

## 7. Cron triggers

Já declarados em `wrangler.toml`:

- `*/5 * * * *` → `/api/cron/sync-results`  (busca resultados)
- `0 * * * *` → `/api/cron/reminders`  (lembretes 12h antes)
- `0 23 * * *` → `/api/cron/recap`  (recap diário 23h UTC)

## 8. CI/CD

`.github/workflows/ci.yml` roda em todo PR/push:

- typecheck
- unit + integration tests (vitest)
- E2E tests (Playwright)

Em push para `main`, faz deploy automático em Cloudflare. Configure os secrets no repo:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## Observabilidade

- `GET /api/health` → status, versão, driver do banco, latency
- Logs estruturados (JSON) compatíveis com Workers Logpush, Logtail, Datadog
- `/admin/observabilidade` mostra últimos disparos de email + ações sensíveis
- `/admin/auditoria` mostra audit log completo

## Estado atual

✅ Configuração pronta para deploy.

O cliente DB (`src/lib/db/index.ts`) detecta runtime: D1 em produção, better-sqlite3 em dev local. Sem refatoração das actions necessária.
