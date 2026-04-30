# NATTA Application (fullstack)

Aplicativo **multiplataforma** (iOS, Android e Web) focado em apoio à **jornada profissional** e organização: acompanhamento de **candidaturas**, espaços para **currículo**, **simulador de entrevistas**, **calendário**, ferramentas de escrita/design, notificações e perfil — com backend integrado para autenticação e APIs tipadas quando configurado.

> **Nota de branding:** o arquivo `app.config.ts` ainda pode exibir o nome herdado do template (ex.: “AIpply”). Para publicar como **Natta**, ajuste `appName`, `appSlug` e os identificadores de bundle conforme sua conta de desenvolvedor.

---

## Stacks

| Área | Tecnologias |
|------|-------------|
| **App** | [Expo](https://expo.dev/) ~54, [React Native](https://reactnative.dev/) 0.81, [React](https://react.dev/) 19 |
| **Rotas** | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based) |
| **Estilo** | [NativeWind](https://www.nativewind.dev/) v4 + Tailwind CSS |
| **Dados na API** | [tRPC](https://trpc.io/) v11 + [TanStack Query](https://tanstack.com/query) v5 + [superjson](https://github.com/blitz-js/superjson) |
| **Validação** | [Zod](https://zod.dev/) |
| **Backend** | Node.js, [Express](https://expressjs.com/), tRPC adapter |
| **Banco (opcional)** | [Drizzle ORM](https://orm.drizzle.team/) + [MySQL](https://www.mysql.com/) (`mysql2`) |
| **Auth** | OAuth Manus (cookie na web; token + Secure Store no nativo) — ver `server/README.md` |
| **Outros** | Firebase (dependências no projeto), Expo Notifications / Audio / Video / Image, Vitest, TypeScript, ESLint, Prettier |
| **Gerenciador de pacotes** | [pnpm](https://pnpm.io/) 9 |

---

## Pré-requisitos

- **Node.js** (LTS recomendado)
- **pnpm** `9.x` (o repositório declara `packageManager: pnpm@9.12.0`)

---

## Como rodar o projeto

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Variáveis de ambiente

Crie um arquivo **`.env`** na raiz do projeto (o script `scripts/load-env.js` carrega esse arquivo e **não sobrescreve** variáveis já definidas no sistema — útil em ambientes como Manus).

**Frontend (Expo) — prefixo `EXPO_PUBLIC_`**

| Variável | Descrição |
|----------|-----------|
| `EXPO_PUBLIC_APP_ID` | ID do app OAuth |
| `EXPO_PUBLIC_OAUTH_PORTAL_URL` | URL do portal de login |
| `EXPO_PUBLIC_OAUTH_SERVER_URL` | URL do servidor OAuth (espelhada de `OAUTH_SERVER_URL` no loader) |
| `EXPO_PUBLIC_API_BASE_URL` | URL base da API (ex.: `http://localhost:3000`). Se vazio na web, o app tenta derivar trocando a porta `8081` por `3000` no hostname |
| `EXPO_PUBLIC_OWNER_OPEN_ID` | Open ID do owner (opcional, conforme integração) |
| `EXPO_PUBLIC_OWNER_NAME` | Nome do owner (opcional) |

O loader também mapeia variáveis no estilo Vite para o Expo, por exemplo: `VITE_APP_ID` → `EXPO_PUBLIC_APP_ID`, `VITE_OAUTH_PORTAL_URL` → `EXPO_PUBLIC_OAUTH_PORTAL_URL`.

**Backend (servidor Node)**

| Variável | Descrição |
|----------|-----------|
| `PORT` | Porta do Express (padrão `3000`; o servidor pode escolher outra se estiver ocupada) |
| `DATABASE_URL` | Connection string MySQL/TiDB (sem isso, partes do DB podem ficar indisponíveis) |
| `JWT_SECRET` | Segredo para sessão/cookies |
| `VITE_APP_ID` | ID do app (OAuth) |
| `OAUTH_SERVER_URL` | Servidor OAuth |
| `VITE_OAUTH_PORTAL_URL` | Portal de login |
| `OWNER_OPEN_ID` / `OWNER_NAME` | Metadados do owner |
| `BUILT_IN_FORGE_API_URL` / `BUILT_IN_FORGE_API_KEY` | Integração Forge (storage/APIs internas do template) |

Para detalhes de autenticação, tRPC e banco, consulte **[`server/README.md`](./server/README.md)**.

### 3. Desenvolvimento (API + app Web)

Sobe o **servidor** (tRPC/Express) e o **Metro/Expo na web** em paralelo:

```bash
pnpm dev
```

- App web: porta **`8081`** por padrão (`EXPO_PORT` pode ser usada para alterar).
- API: inicia em **`3000`** (ou próxima livre).

### 4. Apenas API ou apenas Expo

```bash
pnpm dev:server   # somente backend (tsx watch)
pnpm dev:metro    # somente Expo (web), com workspace root do Metro
```

### 5. Mobile nativo

```bash
pnpm android
pnpm ios
```

(Exige ambiente Android Studio / Xcode conforme a plataforma.)

### 6. Build e produção do servidor

```bash
pnpm build        # gera dist/ com esbuild
pnpm start        # NODE_ENV=production node dist/index.js
```

### 7. Banco de dados (quando usar Drizzle)

```bash
pnpm db:push      # generate + migrate (drizzle-kit)
```

### 8. Qualidade

```bash
pnpm check        # TypeScript (tsc --noEmit)
pnpm lint         # ESLint (Expo)
pnpm test         # Vitest
```

---

## Estrutura útil

| Caminho | Conteúdo |
|---------|----------|
| `app/` | Telas e rotas (Expo Router) |
| `server/` | Express, routers tRPC, `db.ts`, integrações |
| `drizzle/` | Schema e migrações |
| `lib/` | Cliente tRPC, tema, utilitários |
| `shared/` | Constantes e tipos compartilhados |
| `hooks/` | Hooks React (ex.: autenticação) |

---

## Licença e créditos

Defina a licença do repositório conforme a política do seu time. Este projeto inclui trechos de template Manus (OAuth, storage, LLM helpers) documentados em `server/README.md`.
