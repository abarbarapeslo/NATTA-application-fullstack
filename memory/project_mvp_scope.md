---
name: project-mvp-scope
description: NATTA Mobile MVP scope — features ativas e desativadas no app por enquanto
metadata:
  type: project
---

NATTA Mobile (app-only, sem versão web) começa com escopo enxuto. Features que VÃO existir no MVP:

1. **Gravação de vídeo** → `app/video-space.tsx` (teleprompter + capturar vídeo)
2. **Escrever texto com IA** → `app/resume-assistant.tsx`
3. **Leitor de documentos** → `app/writing-hub.tsx`
4. **Applications** (criar/listar candidaturas) → `app/(tabs)/index.tsx` — parte do MVP, Home continua como está

Features que NÃO entram no MVP (ocultar da navegação ou deletar):
- Design Space (`app/design-space.tsx`) — templates de CV
- Interview Simulator (`app/interview-simulator.tsx`)
- Calendar View (`app/calendar-view.tsx`)
- qualquer outra encontrada em `app/` fora das 3 acima

**Why:** Decidido em 2026-05-22 — foco em entregar essas três antes de expandir. Reduz superfície a manter, simplifica a estrutura do Firestore (só os dados que essas features precisam).

**How to apply:** Antes de plugar Firestore ou refatorar telas, considerar primeiro se a tela faz parte das 3 features. Se não, perguntar à usuária se deve ser removida da navegação em vez de migrada.

Stack confirmada: Firebase Auth (`@react-native-firebase/auth`) + Firestore (próximo passo, [[firebase-stack]]). Projeto Firebase compartilhado com o site da NATTA: `natta-app-b9e3b` (mesmos usuários, perfil ainda não existe em DB estruturado).
