# Memória do projeto — KPIs e referências

Documento vivo para alinhar time e revisões de performance/qualidade. Atualize quando metas ou instrumentação mudarem.

---

## Registro — o que já foi feito

- **Repositório remoto:** código enviado para `github.com/abarbarapeslo/NATTA-application-fullstack` (histórico inicial + merge com commit que já existia no `main` remoto).
- **CI/CD (GitHub Actions)** em `.github/workflows/`, com stack **pnpm** (`pnpm install --frozen-lockfile`, `pnpm run build`, `pnpm run lint`, `pnpm test` onde o workflow define, `pnpm audit`):
  - **`feature.yml`** — branches `feat/**` e PRs para `feat/**`: quality + criação automática de PR para `staging` em push.
  - **`staging.yml`** — `staging`, `feat/**` e PR para `staging`: quality + PR automático em push; job **Deploy Vercel (staging)** existe mas está **desligado** (`if: false`) até decidirem reativar.
  - **`production.yml`** — push em `main`: quality (inclui testes); job **Deploy Vercel (production)** **desligado** (`if: false`) até decidirem reativar.
- **Firebase Auth:** ajuste para evitar erro de SSR web e registro no RN (`getFirebaseAuth()` lazy + `initializeAuth` com persistência em AsyncStorage no nativo), nos fluxos que importam auth (ex.: More, login, auth-guard).
- **Dev local (Windows e outros):** `dev:metro` aponta para `node scripts/expo-dev-web.mjs` (porta padrão **8081**; defina `EXPO_PORT` para outra, ex. no PowerShell: `$env:EXPO_PORT='8082'`). Evita `--port NaN` no Windows por causa de `${EXPO_PORT:-8081}` no shell.

---

## KPIs de produto (definições e metas)

### 1. Tempo de startup

**Definição:** tempo desde o usuário abrir o app até **conseguir ver e interagir** com a **primeira tela estável** (splash some; não trava em loading infinito).

**Meta acordada:** **~2 segundos** para mostrar algo **útil e interativo**.

---

### 2. Tempo de abrir a tela principal (Home / dashboard)

**Definição:** tempo desde a abertura até a tela principal estar **resolvida**: lista carregada **ou** estado vazio tratado — não apenas o fundo da tela.

**Meta acordada:** **até ~4 segundos** até a Home estar **resolvida** (dados ou vazio tratado).

---

### 3. Taxa de erro

**Definição:** frequência de falhas relevantes para o usuário: crash, tela vermelha de erro, falha de rede tratada como erro, login que quebra, etc. Pode ser expressa como **percentual** (ex.: erros por 1000 sessões) ou **contagem por dia**, desde que a base (sessões/eventos) seja explícita.

**Meta acordada:** **idealmente abaixo de 0,5%** (da base escolhida; ex.: sessões com erro / total de sessões).

---

## Como usar este arquivo

- **Antes** de otimizar performance: medir estes três indicadores no ambiente alvo (staging ou produção).
- **Depois** de releases relevantes: comparar com as metas e registrar desvio + causa provável.
- **Revisão:** alinhar periodicamente se “2s / 4s / 0,5%” continuam realistas para o hardware e mercado alvo.

---

## Notas (preencher quando houver instrumentação)

- **Onde medimos:** (ex.: analytics, Sentry, logs de app, testes instrumentados).
- **Cold start vs warm start:** especificar o que conta para “startup”.
- **Definição de “sessão”** para a taxa de erro: (ex.: abertura do app até fechamento ou timeout).
