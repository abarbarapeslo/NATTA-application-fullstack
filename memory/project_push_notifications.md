---
name: project-push-notifications
description: Como push notifications estão (e vão ficar) configuradas no NATTA Mobile
metadata:
  type: project
---

Push é via `@react-native-firebase/messaging` (FCM). Decisão arquitetural:

**Fase 1 (no app — primeiro rebuild EAS):**
- Cliente apenas. App recebe notificações, mostra handler foreground/background, e envia o **FCM token** do device pro backend próprio quando o usuário loga.
- Broadcast e notificações por tópico são feitas **manualmente no Firebase Console** por enquanto.

**Fase 2 (no backend, depois):**
- Backend (`server/`) implementa endpoint que registra `{uid, fcmToken, platform}` (provavelmente em MySQL via drizzle).
- Backend dispara notificações personalizadas chamando **FCM HTTP v1 API** com Firebase Admin SDK.
- **Não usar Cloud Functions** — decisão explícita da usuária (2026-05-22).

**Why:** Cloud Functions adiciona uma stack a manter (JS no Firebase) e a usuária prefere centralizar lógica no backend tRPC/Express que já existe. Backend próprio também permite controle fino, integração com lógica de negócio (deadlines de candidaturas, etc.) sem ficar pulando entre dois lugares.

**How to apply:** Não sugerir Cloud Functions. Quando for hora da Fase 2, integrar com `server/_core/` usando `firebase-admin` npm package, e adicionar endpoint pra registrar token. Cliente já vai estar mandando.

Relacionado: [[project-mvp-scope]].
