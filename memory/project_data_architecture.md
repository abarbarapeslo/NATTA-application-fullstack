---
name: project-data-architecture
description: Onde moram os dados do NATTA (site Postgres/Supabase vs app) e arquitetura de acesso decidida
metadata:
  type: project
---

**Site NATTA**: dados em PostgreSQL hospedado no **Supabase**, acessado via **backend Node próprio** com Drizzle ORM (driver postgres-js). Tabelas: `users`, `opportunities`, `applications`, `savedOpportunities` (e pendingOpportunities). Auth do site é **Firebase** (não Supabase Auth — confirmado: Supabase Authentication → Users está vazio em 2026-05-22).

Sinais que confirmam acesso via backend (não Supabase client direto):
- RLS **desligado** nas tabelas
- Policies existem mas são ignoradas (RLS off)
- Supabase Auth vazio → auth é externa (Firebase)

**App mobile (este projeto)**: setupado com template MySQL (`drizzle/schema.ts` só tem `users`, dialect mysql) — **NÃO é o banco do site**. É scaffolding do boilerplate.

**DECISÃO FINAL (2026-05-22):** App chama a **API tRPC do backend do site** (já hospedada no Render como serviço `natta-app`, monolito Express servindo `/api/trpc/*`). NÃO hospedar backend novo, NÃO migrar `server/` deste repo pra Postgres, NÃO usar Firestore pra esses dados.

Por que funciona direto:
- Backend do site valida **Firebase ID token** via `Authorization: Bearer <token>` (Firebase Admin `verifyIdToken`). É o MESMO Firebase Auth que o app usa.
- `uid` do Firebase = `openId` no Postgres → mesma identidade.
- Routers tRPC disponíveis no site: `system`, `scraper`, `auth`, `opportunities`, `applications`, `savedOpportunities`, `admin`.
- Health check: `/api/trpc/system.health`.
- Plano free do Render **hiberna** após inatividade → primeira request após sono é lenta (cold start). Considerar no UX (loading states).

**How to apply (próxima leva, sem rebuild — é tudo runtime JS):**
- Setar `EXPO_PUBLIC_API_BASE_URL` no `.env` do app = URL do serviço Render do site.
- No app, mandar `Authorization: Bearer <firebaseIdToken>` no tRPC (trocar o `Auth.getSessionToken()` atual em `lib/trpc.ts` por `getFirebaseAuth().currentUser.getIdToken()`).
- Gerar tipos do AppRouter do site no app (copiar tipo do router, ou consumir via tRPC client não-tipado se não der pra compartilhar tipos entre repos).
- Trocar hooks `useUserProfile`/`useApplications` de Firestore → tRPC queries (`opportunities`, `applications`, `savedOpportunities`).
- Firestore fica SÓ pra dados exclusivos do mobile (fcmToken — ver [[project-push-notifications]]).
- `server/` deste repo (MySQL template) provavelmente vira obsoleto — não é usado em prod.

**Decisões de produto sobre o modelo (2026-05-22), pós-mapeamento da API do site:**
- **Profile** (opção B): bio + interests vêm da API do site (`auth.me`, `auth.updateProfile({bio, interests})`). Campos extras que o site NÃO tem (education, experience, projects, skills) ficam no **Firestore** como dados exclusivos do app.
- **Applications/Home** (opção A): reformular pra bater com o site — listar **opportunities** (vagas do scraper) e deixar o usuário **aplicar** (`applications.create({opportunityId})`). Abandonar o conceito de "application manual livre" do template. Status do site: `Applied | In Progress | Accepted | Rejected` (sem Draft/Submitted).
- **Telas novas a criar**: Opportunities (navegar/buscar via `opportunities.list`/`featured`) + Saved (`savedOpportunities.list/save/unsave/isSaved`).
- **3 features MVP** (Video, Resume Assistant, Document Reader) são **standalone** — NÃO se conectam a uma opportunity específica.

API do site (AppRouter) tem routers: system, scraper(admin), auth, opportunities, applications, savedOpportunities, admin. Procedures protegidas exigem Firebase ID token no header.

Relacionado: [[project-mvp-scope]], [[project-push-notifications]].
