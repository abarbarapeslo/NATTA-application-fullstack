---
name: feedback-rnfirebase-crashlytics
description: Não adicionar @react-native-firebase/crashlytics 23.x ao Expo sem plugin Gradle manual
metadata:
  type: feedback
---

NUNCA instalar `@react-native-firebase/crashlytics` versão **23.x ou inferior** em projeto Expo sem configurar o Gradle plugin manualmente — APK crasha no startup com:

```
java.lang.IllegalStateException: The Crashlytics build ID is missing
```

**Why:** A 23.x ainda não tem **Expo config plugin** (só a 24.x+). Sem config plugin, o Gradle plugin oficial do Crashlytics (`com.google.firebase.crashlytics`) não é aplicado no `build.gradle` do Android, então o build ID obrigatório nunca é gerado, e o FirebaseInitProvider crasha ao tentar registrar o componente. Custou um rebuild EAS de 30min em 2026-05-22 pra descobrir.

**How to apply:**
- Quando for adicionar Crashlytics de novo, atualizar **toda** a suíte `@react-native-firebase/*` (app, auth, messaging, firestore, analytics, crashlytics) pra **24.x em uma única leva**.
- Verificar que o config plugin existe (`node_modules/@react-native-firebase/crashlytics/app.plugin.js`) antes de adicionar ao `app.config.ts` em `plugins`.
- Mesmo problema vale pra outros pacotes RN Firebase que precisam de Gradle plugin: `perf`, `messaging` em algumas versões. Sempre conferir antes.

Relacionado: [[feedback-expo-install]] (alinhamento de versões), [[project-data-architecture]].
