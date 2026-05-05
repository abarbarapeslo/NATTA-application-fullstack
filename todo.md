# Natta Mobile App - TODO

## Setup e Configuração
- [x] Atualizar tema e cores no theme.config.js (azul neon #0066FF como primary)
- [x] Configurar app.config.ts com nome e logo do Natta
- [x] Criar componentes base reutilizáveis (Button, Card, Input, Tag)
- [x] Configurar navegação bottom tabs (Home, Search, Profile, Calendar, More)

## Telas Principais
- [ ] Onboarding Screen com login social (Google, Apple)
- [x] Dashboard Screen com métricas e lista de aplicações
- [x] AI Search Screen com interface de chat
- [x] Profile Screen com seções de educação, experiência, projetos, skills
- [x] Calendar/Deadlines Screen com visualização mensal
- [x] More Screen com menu de features adicionais

## Features de Escrita e Documentos
- [x] Writing Hub Screen com editor de texto e AI suggestions
- [x] Resume Assistant Screen com opções de criar CV e Cover Letter
- [x] Design Space Screen com editor drag-and-drop de CVs
- [x] Sistema de templates de CV (Harvard, Modern, Creative)

## Features de Vídeo e Entrevista
- [x] Video Space Screen com gravação e teleprompter
- [x] Interview Simulator Screen com perguntas da IA
- [ ] Sistema de feedback de IA para respostas de entrevista

## Integrações Backend
- [ ] Configurar autenticação OAuth com Manus
- [ ] Criar schema de banco de dados (applications, opportunities, essays, documents)
- [ ] Implementar tRPC routes para CRUD de aplicações
- [ ] Integrar LLM para AI Search
- [ ] Integrar LLM para AI Suggestions no Writing Hub
- [ ] Integrar LLM para Interview Simulator
- [ ] Configurar S3 storage para vídeos e documentos

## Funcionalidades Adicionais
- [ ] Sistema de notificações para deadlines
- [ ] Sincronização de dados entre dispositivos
- [ ] Export de documentos em PDF
- [ ] Sistema de tags para oportunidades
- [ ] Filtros avançados na busca
- [ ] Histórico de versões de ensaios

## Polimento e Testes
- [ ] Adicionar animações e transições
- [ ] Implementar haptic feedback
- [ ] Testar em iOS e Android
- [ ] Otimizar performance
- [ ] Adicionar loading states
- [ ] Adicionar error handling
- [ ] Criar testes unitários

## Melhorias Solicitadas
- [x] Redesenhar AI Search como catálogo de oportunidades com filtros avançados
- [x] Adicionar botão de AI Chat para buscas específicas na tela Search
- [x] Criar modal de chat IA para interação conversacional
- [x] Substituir texto da marca nos headers por logo em todas as telas
- [x] Reposicionar logo para canto esquerdo dos headers em tamanho proporcional
- [x] Criar página Tools separada das configurações
- [x] Mover Calendar para dentro de Tools
- [x] Mover todas as ferramentas (Writing Hub, Resume Assistant, etc) para Tools
- [x] Trocar ícone da navbar de Calendar para Tools
- [x] Atualizar navegação para acessar ferramentas via Tools
- [x] Criar modal para adicionar nova aplicação
- [x] Implementar formulário com campos: nome, deadline, status, tipo (área)
- [x] Remover barras de progresso dos cards de aplicação
- [x] Implementar funcionalidade de salvar aplicações
- [x] Atualizar dashboard para exibir aplicações criadas
- [x] Ajustar modal de adicionar aplicação para caber nos limites da tela
- [x] Transformar modal em popup sem navbar
- [x] Implementar funcionalidade de editar status de aplicações
- [x] Adicionar modal/menu para alterar status ao tocar em uma aplicação
- [x] Corrigir cor do texto do status Draft no modal de criar aplicação (mudar de branco para preto)
- [x] Trocar ícone de seta do botão de filtros por ícone de filtragem na página Search
- [x] Remover modal AI Search Assistant da página Search
- [x] Remover botão flutuante de AI Chat
- [x] Remover estados e funções relacionadas ao AI Chat
- [x] Implementar edição de informações pessoais (nome, email, bio)
- [x] Implementar edição de educação
- [x] Implementar edição de experiência
- [x] Implementar edição de projetos
- [x] Implementar edição de skills
- [x] Salvar dados editados com AsyncStorage
- [x] Trocar setas de voltar por X de sair em todas as telas do app (Writing Hub, Resume Assistant, Design Space, Video Space, Interview Simulator, Calendar View)
- [x] Remover botão X duplicado da tela de calendário
- [x] Remover seta de navegação inútil ao lado do mês/ano no calendário
- [x] Adicionar campos de data de início e fim (período de duração) nas aplicações
- [x] Implementar algoritmo de detecção de conflitos de tempo entre oportunidades
- [x] Criar visualização de conflitos no calendário com alertas visuais
- [x] Adicionar seção de conflitos detectados na tela do calendário
- [x] Mostrar quais aplicações estão em conflito e o período de sobreposição
- [x] Ativar botões de configurações na página More
- [x] Fazer botão About abrir o site da marca (natta.app)
- [x] Criar tela funcional de Account Settings
- [x] Criar tela funcional de Notifications Settings
- [x] Criar tela funcional de Help & Support
- [x] Remover opção de Dark Mode das configurações de conta
- [x] Remover seta da caixa "Applications in Progress" no dashboard
- [x] Remover seta do lado direito do mês/ano na página do calendário
- [x] Adicionar exemplo de conflito de datas no calendário para visualização
- [x] Corrigir exibição do exemplo de conflito no calendário (não aparece no Expo Go)
- [x] Ativar botão de criar novo documento na página Writing Hub
- [x] Adicionar funcionalidade de busca por palavras-chave no Writing Hub
- [x] Verificar se existe tela de login/signup
- [x] Adicionar botão de Sign Out nas configurações
- [x] Implementar autenticação com Firebase
- [x] Configurar Firebase no projeto
- [x] Criar tela de login/signup com Firebase Auth
- [x] Integrar Firebase Auth com o app
- [x] Desabilitar temporariamente proteção de autenticação para visualização
