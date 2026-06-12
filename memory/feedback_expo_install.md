---
name: feedback-expo-install
description: Sempre instalar pacotes Expo com `npx expo install`, nunca `pnpm add` direto
metadata:
  type: feedback
---

Ao adicionar QUALQUER pacote Expo ou com código nativo neste projeto, usar **`npx expo install <pacote>`**, nunca `pnpm add <pacote>`.

**Why:** Em 2026-05-22, instalei expo-camera/document-picker/file-system com `pnpm add` (sem versão). O pnpm puxou as últimas versões publicadas (`@56.x`, de um Expo SDK futuro) num app SDK 54. O dev build EAS compilou mas crashou ao abrir com `java.lang.NoSuchMethodError` — incompatibilidade de versão nativa. Custou um rebuild inteiro (~20min) pra descobrir.

**How to apply:** `npx expo install` resolve a versão compatível com o `expo` instalado (SDK 54 → expo-camera ~17, file-system ~19, etc.). Depois de instalar nativos, rodar `npx expo install --check` pra confirmar que não há mismatch antes de disparar build EAS. Pacotes JS puros (ex: @react-navigation) toleram versões mais novas; nativos NÃO.
