---
name: reference-backend-push-guide
description: Guia pro backend do site disparar push notification quando uma nova opportunity é publicada
metadata:
  type: reference
---

Mantenha como referência ao discutir com quem cuida do **backend do site da NATTA** (repo separado, deploy no Render em https://natta-boii.onrender.com). O app mobile **já está pronto pra receber push** — falta o backend disparar.

## O que o app já faz

1. Pede permissão de notificação no primeiro login (Android 13+ exige).
2. Pega o **FCM token** do device via `messaging().getToken()`.
3. Atualmente só loga o token no console (`hooks/use-push-registration.ts:registerTokenWithBackend`). Precisa virar chamada de verdade pro backend salvar.
4. Recebe foreground / background / killed-state messages e mostra Alert + log.

## O que falta no backend (site repo)

### 1. Endpoint pra registrar device tokens

Tabela nova `user_devices`:
- `id serial PK`
- `user_id int FK users.id`
- `fcm_token text unique`
- `platform varchar(8)` — 'android' | 'ios' | 'web'
- `last_seen_at timestamp default now()`

Procedure tRPC nova em `authRouter` (procedure protegida):
- `auth.registerDevice({ fcmToken: string, platform: string })` → upsert pelo token, atualiza `last_seen_at`. Idempotente.
- Opcional: `auth.unregisterDevice({ fcmToken })` ao logout.

### 2. Inicializar Firebase Admin SDK no backend

```ts
import { cert, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

initializeApp({
  credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!)),
});
```

Pegar a service account key em Firebase Console → Project Settings → Service Accounts → Generate new private key → JSON. Colar inteiro em env var `FIREBASE_SERVICE_ACCOUNT` no Render.

### 3. Disparar push quando opportunity é aprovada

No fluxo do scraper (`scraper.approve`, `scraper.approveAll`, `scraper.createManual`), depois que a opportunity é inserida na tabela `opportunities`, chamar:

```ts
const tokens = await db
  .select({ token: userDevices.fcmToken })
  .from(userDevices);
// Idealmente: filtrar por usuários cujo `interests` casa com `opportunity.field` ou `type`.

const message = {
  notification: {
    title: `New opportunity: ${opportunity.title}`,
    body: opportunity.organization ?? "Tap to see details",
  },
  data: {
    type: "new_opportunity",
    opportunityId: String(opportunity.id),
  },
  tokens: tokens.map((t) => t.token),
};

await getMessaging().sendEachForMulticast(message);
```

`sendEachForMulticast` aceita até 500 tokens por chamada. Pra mais, dividir em batches.

### 4. (Opcional) Filtros de targeting

Pra MVP basta mandar pra todos. Depois:

- Filtrar por `users.interests` overlap com `opportunity.field`.
- Não notificar quem já marcou "não me interessa" (precisaria de nova tabela ou flag).
- Frequência: limitar a 1 push por usuário por dia (anti-spam).

## Deep link no app

O app já abre na Home ao tocar na notificação (handler `onNotificationOpenedApp` em `lib/push-notifications.ts`). Pra abrir direto na tela da opportunity tocada, ajustar o handler pra ler `msg.data.opportunityId` e fazer `router.push("/opportunities/" + id)`. Isso é mudança JS no app, sem rebuild.

## Testar antes de mandar pra todos

1. Firebase Console → Engage → Cloud Messaging → Send your first message → testar com 1 token de device específico (copia do log do app).
2. Quando funcionar, ativar no scraper só pra um perfil admin antes de liberar geral.

## Custos

Firebase Cloud Messaging é **gratuito sem limite** pra qualquer volume. Sem cota mensal.

Relacionado: [[project-push-notifications]], [[project-data-architecture]].
