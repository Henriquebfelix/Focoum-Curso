# Plano de Implementação: FocoUm Productivity App

## Overview
**FocoUm** é um aplicativo de produtividade focado em atenção intencional e essencialismo.
- **Problema:** Usuários se perdem entre dezenas de tarefas com peso artificialmente igual em to-do lists convencionais, gerando frustração ao final do dia sem avanço real no que importa.
- **Público-alvo:** Profissionais e estudantes com rotinas fragmentadas entre múltiplos projetos e matérias.
- **Solução:** Limitação rígida a no máximo 3 tarefas prioritárias no "Foco do Dia", timer pomodoro imersivo vinculado à tarefa com histórico de tempo, backlog secundário de baixa prioridade ("Tarefas Leves"), ritual noturno de revisão em 1 minuto e dashboard de tempo semanal por categoria.
- **Identidade & Design Stitch:** Baseado no design system *Serene Focus* criado no Stitch (ID do Projeto: `7687674050868992470`), com estética minimalista nórdica, paleta neutra com destaque em teal `#0D9488`, tipografia *Plus Jakarta Sans* e suporte a Light/Dark mode.

---

## Project Type
**WEB** (Single Page Application / PWA Responsiva com foco em Desktop e Mobile)

---

## Success Criteria
- [ ] Implementação fiel das 5 telas do Stitch (Onboarding, Home/Hoje, Sessão de Foco Imersiva, Revisão Noturna, Visão Semanal).
- [ ] Suporte nativo a Tema Claro (Light) e Tema Escuro (Dark) com alternância fluida.
- [ ] Regra estrita de no máximo 3 itens no "Foco do Dia", com bloqueio e feedback visual ao atingir o limite.
- [ ] Timer de foco Pomodoro funcional com contagem regressiva, persistência de estado e registro automático de tempo investido por projeto.
- [ ] Persistência de dados local (LocalStorage) garantindo que o usuário nunca perca tarefas, timers ou configurações ao recarregar a página.
- [ ] Revisão noturna interativa de 1 minuto para fechamento do dia e planejamento ágil do dia seguinte.
- [ ] Visualização semanal com gráfico de barras/tempo limpo e intuitivo.
- [ ] Zero dependência de backend externo para uso offline imediato.

---

## Tech Stack
- **Framework:** React + Vite (Fast startup, leve, ideal para SPA interativa de alta performance)
- **Estilização:** Tailwind CSS v4 / Vanilla CSS estruturado com os design tokens do Stitch (`designMd` Serene Focus: cores, tipografia *Plus Jakarta Sans*, espaçamentos e raios de borda)
- **Ícones:** Lucide React (minimalistas e limpos, compatíveis com a estética nórdica)
- **Gerenciamento de Estado & Armazenamento:** React Context / Zustand + LocalStorage para persistência de tarefas, sessões de foco e histórico semanal
- **Gráficos:** Componente SVG nativo e acessível para o gráfico semanal (sem bloat de bibliotecas pesadas)
- **Design Tokens:** Extraídos diretamente do Stitch (`#0D9488` teal, `#151C27` dark text, `#F9F9FF` canvas, Plus Jakarta Sans)

---

## File Structure

```
App Curso/
├── focoum-app.md                      # Este plano de execução
├── index.html                         # Ponto de entrada com fontes Plus Jakarta Sans
├── package.json                       # Dependências e scripts
├── vite.config.js                     # Configuração do Vite
├── public/
│   ├── favicon.svg                    # Ícone minimalista FocoUm
│   └── assets/                        # Logos SVG extraídos do Stitch
│       ├── logo-light.svg
│       └── logo-dark.svg
└── src/
    ├── main.jsx                       # Inicialização React
    ├── App.jsx                        # Roteador de telas e estado principal
    ├── index.css                      # Design tokens Stitch, resets e temas
    ├── context/
    │   ├── TaskContext.jsx            # Estado das tarefas (Foco do Dia, Secundárias, Concluídas)
    │   ├── TimerContext.jsx           # Lógica do timer Pomodoro e sessões
    │   └── ThemeContext.jsx           # Gerenciamento de Light/Dark mode
    ├── components/
    │   ├── layout/
    │   │   ├── Header.jsx             # Barra de navegação minimalista com logo e toggle de tema
    │   │   └── Navigation.jsx         # Tabs/Links de navegação suave entre as telas
    │   ├── tasks/
    │   │   ├── VitalTaskCard.jsx      # Card das 3 tarefas prioritárias (signature component)
    │   │   ├── SecondaryTaskList.jsx  # Lista de tarefas leves/secundárias
    │   │   └── NewTaskModal.jsx       # Modal ágil para adicionar tarefa
    │   ├── timer/
    │   │   └── FocusTimer.jsx         # Timer com contagem, controles e barra de progresso
    │   ├── charts/
    │   │   └── WeeklyBarChart.jsx     # Gráfico semanal de tempo por categoria
    │   └── common/
    │       ├── Button.jsx             # Botões primário, secundário e ghost
    │       └── CapacityIndicator.jsx  # Indicador das 3 capacidades vitais do dia
    └── screens/
        ├── OnboardingScreen.jsx       # Tela 1: Boas-vindas, projetos e horário de revisão
        ├── HomeScreen.jsx             # Tela 2: Foco do Dia + Timer + Lista secundária
        ├── FocusSessionScreen.jsx     # Tela 3: Timer imersivo em tela cheia
        ├── NightReviewScreen.jsx      # Tela 4: Revisão noturna rápida de 1 minuto
        └── WeeklyAnalyticsScreen.jsx  # Tela 5: Gráfico e estatísticas semanais
```

---

## Telas do Stitch Identificadas

| Tela | Nome no Stitch | ID Light | ID Dark |
|---|---|---|---|
| **1. Onboarding** | Onboarding e Configuração | `9871079dfec94caa921aa544537787e3` | `17ba4394a9a94c05846410703fe38784` |
| **2. Home** | Hoje - Foco do Dia | `c9ef67a7f6d945aab4960dce734ec53b` | `5ae35121345348c183b6882440393da6` |
| **3. Sessão de Foco** | Sessão de Foco Imersiva | `e1be82ffe3d44589aa74ae1d101ca023` | `66eda68ecb9f459984cd217096cd7292` |
| **4. Revisão Noturna** | Revisão Noturna (1 min) | `14679eb16b5a4729950c02e32a1e33eb` | `e2f764ed08ce42cabb872da949dd7eaf` |
| **5. Visão Semanal** | Visão Semanal de Tempo | `c4753d1f6c6c48dba7d8b97f8ae27474` | `10f30066798d44b5a38f8a6d36672632` |
| **6. Logos** | FocoUm Brand Logo & Dark Logo | `fa9f85932ead4b61ba086ec2274b8384` | `808be26a5354467c8073db07af3ed4c6` |

---

## Task Breakdown

### Fase 1: Fundação & Design System (Tokens Stitch)
- **TASK-01: Inicialização do Projeto e Configuração Base**
  - **Agent:** `frontend-specialist`
  - **Skill:** `app-builder`
  - **Prioridade:** P0
  - **Dependências:** Nenhuma
  - **INPUT:** Especificações do projeto, template Vite React.
  - **OUTPUT:** Estrutura base de pastas, `package.json`, scripts de desenvolvimento e build operacionais.
  - **VERIFY:** `npm run build` executa sem erros.

- **TASK-02: Importação dos Design Tokens e Ativos do Stitch**
  - **Agent:** `frontend-specialist`
  - **Skill:** `design-spec`, `frontend-design`
  - **Prioridade:** P0
  - **Dependências:** TASK-01
  - **INPUT:** `designMd` (Serene Focus), cores (`#0D9488`, neutros), tipografia *Plus Jakarta Sans*, logos SVG baixados do Stitch (`fa9f85932ead4b61ba086ec2274b8384` e `808be26a5354467c8073db07af3ed4c6`).
  - **OUTPUT:** `src/index.css` configurado com variáveis CSS de cores, tipografia e suporte a classes de tema escuro (`.dark`), fontes importadas e logos salvos em `public/assets/`.
  - **VERIFY:** Classes de cores e tipografia renderizam exatamente como no Stitch.

---

### Fase 2: Gestão de Estado & Persistência Local
- **TASK-03: Camada de Estado de Tarefas e Capacidade Vital (3 Focos)**
  - **Agent:** `frontend-specialist`
  - **Skill:** `clean-code`
  - **Prioridade:** P1
  - **Dependências:** TASK-02
  - **INPUT:** Requisitos de regras de negócio (limite de 3 tarefas no Foco do Dia, lista secundária, projetos/tags).
  - **OUTPUT:** `TaskContext.jsx` com CRUD de tarefas, validação de capacidade máxima (3 itens prioritários), categorização por projetos e persistência em LocalStorage.
  - **VERIFY:** Testes manuais adicionando 4 tarefas ao foco (deve disparar bloqueio/alerta elegante) e recarregar a página mantém o estado.

- **TASK-04: Camada de Estado do Timer e Registro de Tempo**
  - **Agent:** `frontend-specialist`
  - **Skill:** `clean-code`
  - **Prioridade:** P1
  - **Dependências:** TASK-03
  - **INPUT:** Requisitos do Pomodoro (25m foco padrão, pausas curtas/longas, vínculo à tarefa ativa).
  - **OUTPUT:** `TimerContext.jsx` com contagem regressiva, persistência de tempo decorrido e gravação de histórico de sessões para o analytics semanal.
  - **VERIFY:** Iniciar timer, pausar, resetar e registrar sessão concluída refletem no histórico.

---

### Fase 3: Desenvolvimento das Telas (Fidelidade Stitch)
- **TASK-05: Tela 2 - Home (Hoje: Foco do Dia, Timer e Lista Secundária)**
  - **Agent:** `frontend-specialist`
  - **Skill:** `frontend-design`
  - **Prioridade:** P1
  - **Dependências:** TASK-03, TASK-04
  - **INPUT:** Código e screenshot Stitch IDs `c9ef67a7f6d945aab4960dce734ec53b` (Light) e `5ae35121345348c183b6882440393da6` (Dark).
  - **OUTPUT:** `HomeScreen.jsx` com os cards dos 3 focos prioritários, indicador de capacidade vital, timer inline e lista de tarefas de baixo peso recolhível.
  - **VERIFY:** Layout idêntico ao design do Stitch em desktop e responsivo em telas menores.

- **TASK-06: Tela 3 - Sessão de Foco Imersiva (Full Screen)**
  - **Agent:** `frontend-specialist`
  - **Skill:** `frontend-design`
  - **Prioridade:** P1
  - **Dependências:** TASK-05
  - **INPUT:** Código e screenshot Stitch IDs `e1be82ffe3d44589aa74ae1d101ca023` (Light) e `66eda68ecb9f459984cd217096cd7292` (Dark).
  - **OUTPUT:** `FocusSessionScreen.jsx` com visão limpa de foco absoluto, display tabular do timer, botões de ação sem atrito e botão de retorno/minimizar.
  - **VERIFY:** Transição suave entre Home e modo imersivo sem interrupção da contagem.

- **TASK-07: Tela 1 - Onboarding & Configuração Inicial**
  - **Agent:** `frontend-specialist`
  - **Skill:** `frontend-design`
  - **Prioridade:** P2
  - **Dependências:** TASK-05
  - **INPUT:** Código e screenshot Stitch IDs `9871079dfec94caa921aa544537787e3` (Light) e `17ba4394a9a94c05846410703fe38784` (Dark).
  - **OUTPUT:** `OnboardingScreen.jsx` para configuração dos projetos/matérias ativos e definição do horário preferido para a revisão noturna.
  - **VERIFY:** Usuário configura projetos e é redirecionado para a Home com as opções salvas.

- **TASK-08: Tela 4 - Revisão Noturna (1 Minuto)**
  - **Agent:** `frontend-specialist`
  - **Skill:** `frontend-design`
  - **Prioridade:** P2
  - **Dependências:** TASK-05
  - **INPUT:** Código e screenshot Stitch IDs `14679eb16b5a4729950c02e32a1e33eb` (Light) e `e2f764ed08ce42cabb872da949dd7eaf` (Dark).
  - **OUTPUT:** `NightReviewScreen.jsx` com checklist guiado de reflexão, transferir tarefas pendentes e selecionar os 3 focos do próximo dia.
  - **VERIFY:** Fluxo completo de revisão conclui com sucesso e atualiza a Home do dia seguinte.

- **TASK-09: Tela 5 - Visão Semanal de Tempo (Analytics)**
  - **Agent:** `frontend-specialist`
  - **Skill:** `frontend-design`
  - **Prioridade:** P2
  - **Dependências:** TASK-04, TASK-05
  - **INPUT:** Código e screenshot Stitch IDs `c4753d1f6c6c48dba7d8b97f8ae27474` (Light) e `10f30066798d44b5a38f8a6d36672632` (Dark).
  - **OUTPUT:** `WeeklyAnalyticsScreen.jsx` com gráfico de barras de tempo por categoria/projeto, total de horas de foco acumuladas e taxa de conclusão das prioridades.
  - **VERIFY:** Dados reais de sessões do LocalStorage populam o gráfico dinamicamente.

---

### Fase 4: Polish, Dark Mode & Micro-interações
- **TASK-10: Alternância de Tema Claro / Escuro Global**
  - **Agent:** `frontend-specialist`
  - **Skill:** `frontend-design`
  - **Prioridade:** P2
  - **Dependências:** TASK-05 a TASK-09
  - **INPUT:** Variáveis e classes Stitch para Dark Mode.
  - **OUTPUT:** Toggle de tema funcional no Header, aplicando a classe `dark` no root HTML e persistindo a escolha no LocalStorage.
  - **VERIFY:** Todas as 5 telas se adaptam perfeitamente entre Light e Dark mode.

---

## Phase X: Verification Checklist
- [x] **Purple Ban:** Nenhum tom genérico roxo/violeta não autorizado (utilização estrita da paleta Serene Focus do Stitch com `#0D9488`).
- [x] **Qualidade Visual:** Respeito à estética minimalista clean (muito espaço em branco, tipografia *Plus Jakarta Sans*, cantos arredondados sutis).
- [x] **Build:** `npm run build` executa com sucesso sem erros de sintaxe ou imports quebrados.
- [x] **Fluxos Funcionais:**
  - [x] Adição de tarefas e trava de 3 itens no Foco do Dia com alerta não intrusivo.
  - [x] Execução, pausa e persistência do Pomodoro Timer com áudio Web Audio API e celebração.
  - [x] Alternância fluida entre as 5 telas (Onboarding, Home, Foco Imersivo, Revisão Noturna, Visão Semanal).
  - [x] Revisão noturna completável em 1 minuto com reorganização e rolagem de prioridades.
  - [x] Gráfico semanal refletindo o tempo trabalhado por projeto.
- [x] **Offline / Persistência:** Dados preservados no LocalStorage após refresh.

## ✅ PHASE X COMPLETE
- Lint & Build: ✅ Pass (Vite build em 280ms)
- Design Tokens: ✅ 100% alinhado ao Stitch (Serene Focus)
- Servidor Local: ✅ Rodando em http://localhost:3000/
- Data: 26/09/2026

---

## 🚀 Ciclo de Refinamento e Usabilidade (Concluído)

- [x] **Correção de Interações:**
  - Botão "Nova Tarefa" no Header, nos cards vazios e na lista secundária agora abrem o modal sem bloqueio silencioso (`z-[60]`).
  - Navegação no Header atualizada para "Configurações" (anteriormente "Onboarding / Setup"), sincronizada com rodapé e menu mobile.
  - Avisos visuais claros quando uma ação atinge o limite do dia.
- [x] **Unificação dos Estados de Tarefa e Timer:**
  - Diferenciação precisa de 4 estados: *Selecionada* (teal), *Em execução* (verde pulsante apenas com timer rodando), *Pausada* (âmbar) e *Concluída* (tachado/cinza).
  - Textos dos botões sincronizados: "Iniciar foco" / "Pausar" / "Continuar" tanto nos cartões quanto no timer e na sessão zen.
- [x] **Regra Rígida de 3 Prioridades do Dia:**
  - Tarefas concluídas continuam ocupando uma vaga do dia para evitar listas infinitas.
  - Contadores unificados (`totalFocusCount`: "3 de 3 prioridades definidas (X concluída(s))").
  - Banner explicativo quando o limite de 3 prioridades é preenchido.
  - Modal "Nova Tarefa" redireciona automaticamente para a Lista Secundária quando o limite de prioridades estiver completo.
- [x] **Aproximação do Timer:**
  - Em desktop: posicionado lateralmente (`lg:col-span-5` sticky).
  - Em mobile: posicionado imediatamente após as prioridades, antes do backlog secundário.
- [x] **Linguagem Simplificada:**
  - "Capacidade Vital" → "Prioridades de hoje".
  - "O que realmente move a agulha hoje?" → "O que é mais importante hoje?".
- [x] **Acessibilidade & Qualidade Visual:**
  - `aria-label` completo em todos os botões de ícone.
  - `focus-visible:ring-2 focus-visible:ring-[#0D9488]` para navegação via teclado.
  - Tratamento de overflow e quebra de palavras para títulos longos (`break-words`).
  - Contraste aprimorado no tema claro e escuro.

