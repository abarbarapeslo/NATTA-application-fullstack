# Natta Mobile App - Design Document

## Visão Geral

O **Natta** é uma plataforma mobile completa que transforma candidatos estressados em competidores de alto nível, oferecendo ferramentas de IA para todo o ciclo de candidatura, desde a descoberta de oportunidades até a submissão final.

## Design System

### Paleta de Cores (Modo Claro)

- **Primary (Azul Neon)**: `#0066FF` - Botões principais, links ativos, indicadores de progresso
- **Background**: `#F5F5F5` - Fundo principal das telas
- **Surface**: `#FFFFFF` - Cards, áreas elevadas
- **Foreground**: `#1A1A1A` - Texto principal
- **Muted**: `#687076` - Texto secundário
- **Border**: `#E5E7EB` - Bordas e divisores
- **Success**: `#22C55E` - Estados de sucesso
- **Warning**: `#F59E0B` - Estados de atenção
- **Error**: `#EF4444` - Estados de erro

### Tipografia

- **Headings**: Fonte serifada (similar ao logo) para títulos principais
- **Body**: Sans-serif para legibilidade
- **Buttons**: Sans-serif bold para CTAs

## Arquitetura de Telas

### 1. Onboarding Screen
**Propósito**: Primeira impressão e login

**Conteúdo**:
- Logo Natta centralizado
- Headline: "Turn stress into success"
- Subheadline: "Your AI-powered companion from discovery to submission"
- Ilustração abstrata com formas geométricas em azul neon
- Botão primário: "Get Started" (azul neon)
- Botão secundário: "Sign In" (outline azul neon)
- Opções de login social: Google e Apple

**Layout**: Orientação portrait, elementos centralizados verticalmente

### 2. Dashboard (Home)
**Propósito**: Visão geral de aplicações e atalhos

**Conteúdo**:
- Header: Logo + notificações
- Saudação: "Welcome back, [Nome]"
- Cards de métricas (3 cards horizontais):
  - Applications in Progress: [número]
  - Upcoming Deadlines: [número]
  - Submitted: [número]
- Seção "Your Applications" com lista de cards:
  - Nome da oportunidade
  - Deadline
  - Barra de progresso (azul neon)
  - Status badge
- Bottom Tab Navigation (5 ícones)

**Funcionalidade**: Tap em card de aplicação → Detalhes da aplicação

### 3. AI Search Screen
**Propósito**: Buscar oportunidades via chat conversacional

**Conteúdo**:
- Header: Logo + botão voltar
- Área de chat com histórico de mensagens
- Cards de oportunidades nos resultados:
  - Título da oportunidade
  - Organização
  - Deadline com ícone de calendário
  - Tags (pills cinza claro)
  - Localização
  - Botão "View Details" (azul neon)
- Input de chat fixo no bottom com botão enviar (azul neon)

**Funcionalidade**: 
- Input de texto → Enviar query → IA retorna oportunidades
- Tap em card → Detalhes da oportunidade

### 4. Profile Screen
**Propósito**: Perfil completo do usuário

**Conteúdo**:
- Header: Logo + botão "Edit" (azul neon)
- Foto de perfil circular (centro)
- Nome do usuário (bold)
- Subtitle (instituição/cargo)
- Seções em cards brancos:
  - **Education**: Universidade, curso, datas + botão "Add"
  - **Experience**: Cargo, empresa, período, descrição + botão "Add"
  - **Projects**: Cards de projetos com título, descrição, tags + botão "Add"
  - **Skills**: Pills de habilidades + botão "Add"

**Layout**: Scroll vertical, cards com espaçamento generoso

### 5. Writing Hub Screen
**Propósito**: Editor de ensaios com IA

**Conteúdo**:
- Header: Logo + botão voltar + título "Writing Hub"
- Card de título do ensaio (editável)
- Área de editor de texto (grande, fundo branco)
- Sidebar colapsável: "Version History" com ícone
- Toolbar bottom:
  - Ícones de formatação (bold, italic, lista)
  - Botão "AI Suggestions" (azul neon com ícone sparkle)
  - Contador de palavras (cinza)
- FAB (Floating Action Button) azul neon com "+" para novo ensaio

**Funcionalidade**:
- Digitar texto → Salvar automaticamente
- Tap em "AI Suggestions" → Modal com sugestões da IA
- Tap em "Version History" → Lista de versões anteriores

### 6. Resume Assistant Screen
**Propósito**: Criar CVs e Cover Letters

**Conteúdo**:
- Header: Logo + título "Resume Assistant"
- 2 cards grandes de opção:
  - "Create CV" com ícone de documento
  - "Create Cover Letter" com ícone de carta
- Seção "Recent Documents":
  - Cards de documentos com thumbnail, título, data, ações (view, download, delete)
- Botão bottom: "Start with AI Assistant" (azul neon)

**Funcionalidade**:
- Tap em "Create CV" → Wizard de criação de CV
- Tap em documento → Preview do documento

### 7. Design Space Screen
**Propósito**: Editor visual de CVs

**Conteúdo**:
- Header: Logo + botão voltar + título "Design Space"
- Carrossel de templates (Harvard, Modern, Creative)
- Área de editor central com preview do CV
- Sidebar esquerda: Ícones de elementos drag-and-drop (text, image, line, shape)
- Sidebar direita: Opções de formatação (fonte, tamanho, cor, alinhamento)
- Toolbar bottom: Botões "Save", "Export PDF", "Preview" (azul neon)

**Layout**: Landscape-friendly, grid guides visíveis

### 8. Video Space Screen
**Propósito**: Gravar vídeos de pitch com teleprompter

**Conteúdo**:
- Header: Logo + título "Video Space"
- Preview da câmera (grande, centro)
- Card de teleprompter com texto rolável e indicador de auto-scroll
- Controles de gravação:
  - Botão record (círculo azul neon grande)
  - Ícone flip camera
  - Timer "00:00"
  - Ícone settings
- Seção "Your Videos":
  - Thumbnails de vídeos com título, duração, botões (play, delete)

**Funcionalidade**:
- Tap em record → Iniciar gravação
- Tap em flip → Trocar câmera frontal/traseira
- Tap em play → Reproduzir vídeo gravado

### 9. Interview Simulator Screen
**Propósito**: Simular entrevistas com IA

**Conteúdo**:
- Header: Logo + título "Interview Simulator"
- Card de oportunidade selecionada (logo placeholder + nome)
- Card de pergunta:
  - "Question X of Y"
  - Texto da pergunta (bold, grande)
  - Timer countdown "02:30"
- Botão "Start Recording" (azul neon, grande)
- Link "Skip Question" (cinza)
- Indicador de progresso (dots)
- Card colapsável "Interview Tips" com ícone de lâmpada

**Funcionalidade**:
- Tap em "Start Recording" → Gravar resposta em vídeo
- Tap em "Skip" → Próxima pergunta
- Após completar → Feedback da IA

### 10. Calendar/Deadlines Screen
**Propósito**: Gerenciar prazos de aplicações

**Conteúdo**:
- Header: Logo + título "Deadlines" + toggle "Month/List"
- Seletor de mês com setas
- Grid de calendário mensal:
  - Datas com deadlines marcadas com dot azul neon
  - Data atual com círculo azul claro
- Seção "Upcoming Deadlines":
  - Cards de deadline com:
    - Nome da oportunidade
    - Data
    - "X days left" (azul neon)
    - Ícone de status
- FAB azul neon com "+" para adicionar deadline

**Funcionalidade**:
- Tap em data → Ver deadlines daquele dia
- Tap em card → Detalhes da aplicação

## Navegação

### Bottom Tab Navigation (5 tabs)

1. **Home** (house.fill) → Dashboard
2. **Search** (magnifyingglass) → AI Search
3. **Profile** (person.fill) → Profile
4. **Calendar** (calendar) → Deadlines
5. **More** (ellipsis) → Menu adicional

**Tab ativo**: Azul neon (#0066FF)  
**Tab inativo**: Preto (#1A1A1A)

### Stack Navigation

- Onboarding → Dashboard (primeira vez)
- Dashboard → Application Details
- AI Search → Opportunity Details → Apply Flow
- Profile → Edit Profile
- Writing Hub → Essay Editor
- Resume Assistant → CV Creator → Design Space
- Video Space → Video Player
- Interview Simulator → Question → Feedback

## Fluxo de Usuário Principal

1. **Onboarding** → Login/Criar conta
2. **Dashboard** → Ver aplicações em progresso
3. **AI Search** → Descobrir nova oportunidade
4. **Profile** → Completar perfil (se necessário)
5. **Writing Hub** → Escrever personal statement
6. **Resume Assistant** → Criar CV
7. **Design Space** → Customizar layout do CV
8. **Video Space** → Gravar vídeo de pitch (opcional)
9. **Interview Simulator** → Praticar entrevista
10. **Submit** → Enviar aplicação completa

## Componentes Reutilizáveis

### Button
- **Primary**: Fundo azul neon, texto branco, bordas arredondadas (12px)
- **Secondary**: Borda azul neon, texto azul neon, fundo transparente
- **Press state**: Scale 0.97 + opacity 0.9

### Card
- Fundo branco, bordas arredondadas (16px), shadow sutil
- Padding: 16px

### Input Field
- Borda cinza clara, foco: borda azul neon
- Placeholder: cinza médio
- Background: branco

### Progress Bar
- Background: cinza claro (#E5E7EB)
- Fill: azul neon (#0066FF)
- Altura: 6px, bordas arredondadas

### Tag/Pill
- Background: cinza claro (#F5F5F5)
- Texto: preto (#1A1A1A)
- Padding: 6px 12px, bordas arredondadas (20px)

## Interações

### Feedback Tátil (Haptics)
- Tap em botão primário: `impactAsync(Light)`
- Toggle/Switch: `impactAsync(Medium)`
- Sucesso: `notificationAsync(Success)`
- Erro: `notificationAsync(Error)`

### Animações
- Transições de tela: 250ms
- Press feedback: 80ms
- Scale: 0.97 (nunca abaixo de 0.95)

## Considerações Técnicas

### Estado Local vs Backend
- **Local (AsyncStorage)**: Rascunhos de ensaios, preferências de UI
- **Backend (Database + tRPC)**: Aplicações, perfil do usuário, oportunidades salvas

### Features de IA (Backend LLM)
- AI Search: Query → LLM → Oportunidades relevantes
- AI Suggestions (Writing Hub): Texto → LLM → Sugestões de melhoria
- Interview Simulator: Oportunidade → LLM → Perguntas personalizadas
- Resume Assistant: Perfil → LLM → CV otimizado

### Armazenamento de Mídia (S3)
- Foto de perfil
- Vídeos de pitch
- Documentos (CVs, Cover Letters)

## Princípios de Design

1. **Clareza**: Hierarquia visual clara, tipografia consistente
2. **Acessibilidade**: Contraste adequado, tamanhos de fonte legíveis
3. **Consistência**: Componentes reutilizáveis, padrões de interação uniformes
4. **Feedback**: Estados visuais para todas as ações do usuário
5. **Eficiência**: Atalhos, ações rápidas, fluxos otimizados
6. **Mobile-first**: Design pensado para uso com uma mão, orientação portrait

## Próximos Passos

1. Configurar tema e cores no `theme.config.js`
2. Criar componentes base (Button, Card, Input)
3. Implementar navegação (tabs + stack)
4. Desenvolver telas uma a uma seguindo o fluxo de usuário
5. Integrar backend (auth, database, LLM, storage)
6. Testar em dispositivos reais (iOS e Android)
7. Polir animações e interações
