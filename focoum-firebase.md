# Plano de Implementação: Integração Firebase no FocoUm

## Overview
O **FocoUm** é um aplicativo de produtividade essencialista construído em React, fundamentado no design system *Serene Focus* do Stitch. Atualmente, a persistência de dados ocorre localmente via `LocalStorage`.

Este plano estabelece a arquitetura e o roteiro de implementação para o backend serverless utilizando **Google Firebase**:
- **Sem API dedicada:** O frontend conecta-se diretamente ao Firebase Client SDK, eliminando a manutenção e custos de servidores Node/Express intermediários.
- **Autenticação:** Login social com Google (Firebase Authentication), permitindo acesso unificado entre dispositivos.
- **Armazenamento e Tempo Real:** Cloud Firestore com sincronização em tempo real (`onSnapshot`) e suporte nativo a cache offline via `IndexedDbPersistence`.
- **Governança e Permissões:** **Firestore Security Rules** declarativas para validar esquemas de dados, garantir isolamento estrito entre usuários (`request.auth.uid == userId`) e aplicar regras de negócio no nível do banco (ex: validação de campos obrigatórios e integridade das tarefas).

---

## Project Type
**WEB** (React 18 + Vite + Firebase Serverless Architecture)

---

## Success Criteria
- [ ] Autenticação com Google via popup/redirect com persistência de sessão e logout seguro.
- [ ] Modelagem de dados multi-tenant isolada no Firestore com subcoleções por usuário (`users/{uid}/...`).
- [ ] Firestore Security Rules escritas e testadas bloqueando leitura e escrita de dados entre usuários diferentes.
- [ ] Habilitação de persistência offline nativa do Firestore (IndexedDB), mantendo a usabilidade instantânea do FocoUm mesmo sem internet.
- [ ] Migração automática (Data Rollover): Usuários com tarefas salvas previamente no LocalStorage têm seus dados importados para a nuvem no primeiro login.
- [ ] Regras de negócio preservadas: limite de até 3 tarefas no Foco do Dia, timer pomodoro vinculado e histórico de sessões para analytics semanal.
- [ ] Zero dependência de servidores de backend ou APIs proprietárias.

---

## Tech Stack
- **Frontend:** React 18, Vite, Context API, Lucide React / Material Symbols
- **Autenticação:** Firebase Auth v10 (GoogleAuthProvider, `browserLocalPersistence`)
- **Banco de Dados:** Cloud Firestore (SDK Modular v10)
- **Offline Cache:** Firestore IndexedDB Cache (`enableIndexedDbPersistence` ou `persistentLocalCache`)
- **Segurança & Validação:** Firebase Security Rules (`firestore.rules`)
- **Ambiente de Testes:** Firebase Emulator Suite (Auth + Firestore emulados localmente)

---

## Estrutura do Banco de Dados (Firestore Schema)

```
firestore/
├── users/
│   └── {userId}/                           # Documento raiz do usuário
│       ├── profile: { name, email, photoURL, createdAt }
│       ├── config: { reviewTime, dailyGoalBlocks, theme }
│       ├── projects/
│       │   └── {projectId}/                # Áreas ativas (Engenharia, Design, etc.)
│       │       ├── name: string
│       │       ├── color: string
│       │       └── active: boolean
│       ├── tasks/
│       │   └── {taskId}/                   # Coleção de tarefas
│       │       ├── title: string (1..200 chars)
│       │       ├── project: string
│       │       ├── isFocus: boolean
│       │       ├── completed: boolean
│       │       ├── pomodoroCount: number
│       │       ├── targetBlocks: number
│       │       ├── note: string
│       │       ├── createdAt: timestamp
│       │       └── completedAt: timestamp | null
│       └── sessions/
│           └── {sessionId}/                # Histórico de sessões de foco
│               ├── taskId: string
│               ├── taskTitle: string
│               ├── project: string
│               ├── durationMinutes: number
│               └── timestamp: timestamp
```

---

## Estrutura de Arquivos Planejada

```
App Curso/
├── firestore.rules                         # Regras de segurança do Firestore
├── firebase.json                           # Configuração do Firebase CLI e Emuladores
├── focoum-firebase.md                      # Este plano de execução
├── src/
│   ├── firebase/
│   │   ├── config.js                       # Inicialização modular do Firebase
│   │   ├── auth.js                         # Funções de Login Google e Logout
│   │   └── firestore.js                    # Inicialização do Firestore com offline cache
│   ├── context/
│   │   ├── AuthContext.jsx                 # Estado do usuário autenticado (User, loading)
│   │   ├── TaskContext.jsx                 # Refatorado: listener Firestore em tempo real
│   │   ├── TimerContext.jsx                # Gravação de sessões no Firestore
│   │   └── ThemeContext.jsx                # Sincronização opcional do tema com perfil
│   ├── services/
│   │   ├── taskService.js                  # CRUD de tarefas no Firestore
│   │   ├── sessionService.js               # Registro de blocos de foco no Firestore
│   │   └── migrationService.js             # Migração transparente de LocalStorage -> Firestore
│   ├── components/
│   │   ├── layout/
│   │   │   └── Header.jsx                  # Avatar do Google, status de sync e botão Login/Logout
│   │   └── auth/
│   │       ├── LoginButton.jsx             # Botão estilizado de login Google
│   │       └── UserProfileMenu.jsx         # Menu do usuário com status de sincronização
│   └── ...
```

---

## Regras de Segurança do Firestore (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Função utilitária para verificar se o usuário está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }

    // Função para verificar se o documento pertence ao usuário da requisição
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Regras de isolamento da raiz do usuário
    match /users/{userId} {
      allow read, write: if isOwner(userId);

      // Subcoleção de Projetos
      match /projects/{projectId} {
        allow read, write: if isOwner(userId);
      }

      // Subcoleção de Tarefas
      match /tasks/{taskId} {
        allow read: if isOwner(userId);
        allow create, update: if isOwner(userId)
          && request.resource.data.title is string
          && request.resource.data.title.size() > 0
          && request.resource.data.title.size() <= 200
          && request.resource.data.isFocus is bool
          && request.resource.data.completed is bool;
        allow delete: if isOwner(userId);
      }

      // Subcoleção de Sessões de Foco
      match /sessions/{sessionId} {
        allow read: if isOwner(userId);
        allow create: if isOwner(userId)
          && request.resource.data.durationMinutes is number
          && request.resource.data.durationMinutes > 0;
        allow update, delete: if isOwner(userId);
      }
    }

    // Bloqueia qualquer outro caminho por padrão
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Task Breakdown

### Fase 1: Setup Firebase & Configuração
- **TASK-01: Instalação das Dependências e Configuração do SDK Modular**
  - **Agent:** `frontend-specialist`
  - **Skill:** `clean-code`
  - **Prioridade:** P0
  - **Dependências:** Nenhuma
  - **INPUT:** `npm install firebase`, credenciais do projeto Firebase via variáveis de ambiente (`.env.local`).
  - **OUTPUT:** `src/firebase/config.js` com inicialização protegida, exports limpos de `auth` e `db`.
  - **VERIFY:** Build compila sem erros com `npm run build`.

- **TASK-02: Criação do Arquivo de Regras de Segurança (`firestore.rules`)**
  - **Agent:** `backend-specialist`
  - **Skill:** `database-design`, `clean-code`
  - **Prioridade:** P0
  - **Dependências:** TASK-01
  - **INPUT:** Especificação de isolamento multi-tenant e validação de schema.
  - **OUTPUT:** Arquivo `firestore.rules` na raiz do projeto com políticas declarativas `isOwner(userId)` e validações de tipos.
  - **VERIFY:** Sintaxe válida de rules e regras restritivas por padrão.

---

### Fase 2: Autenticação com Google
- **TASK-03: Implementação do AuthContext & Login com Google**
  - **Agent:** `frontend-specialist`
  - **Skill:** `clean-code`
  - **Prioridade:** P1
  - **Dependências:** TASK-01
  - **INPUT:** `GoogleAuthProvider`, `signInWithPopup`, `signOut`, `onAuthStateChanged`.
  - **OUTPUT:** `src/context/AuthContext.jsx` fornecendo `{ user, loading, loginWithGoogle, logout }`.
  - **VERIFY:** Login bem-sucedido recupera UID, nome, email e foto do usuário autenticado.

- **TASK-04: Integração de Login/Logout e Perfil no Header**
  - **Agent:** `frontend-specialist`
  - **Skill:** `frontend-design`
  - **Prioridade:** P1
  - **Dependências:** TASK-03
  - **INPUT:** Header atual do FocoUm ([`Header.jsx`](file:///Users/henrique/Documents/App%20Curso/src/components/layout/Header.jsx)), tokens do Serene Focus.
  - **OUTPUT:** Componente visual de Login com Google no Header, exibição de avatar do Google e indicador de status de sincronização em nuvem ("Sincronizado" / "Offline").
  - **VERIFY:** Alternância visual entre estado deslogado e conectado.

---

### Fase 3: Camada de Serviços do Firestore & Sincronização
- **TASK-05: Criação do TaskService e SessionService**
  - **Agent:** `frontend-specialist`
  - **Skill:** `clean-code`
  - **Prioridade:** P1
  - **Dependências:** TASK-02, TASK-03
  - **INPUT:** Métodos Firestore: `collection`, `doc`, `onSnapshot`, `addDoc`, `updateDoc`, `deleteDoc`.
  - **OUTPUT:** `src/services/taskService.js` e `src/services/sessionService.js` operando sob a subcoleção `users/{uid}/tasks` e `users/{uid}/sessions`.
  - **VERIFY:** Escrita e leitura em tempo real no Firestore com tratamento de erros.

- **TASK-06: Migração Transparente de Dados do LocalStorage**
  - **Agent:** `frontend-specialist`
  - **Skill:** `clean-code`
  - **Prioridade:** P1
  - **Dependências:** TASK-05
  - **INPUT:** Dados existentes em `localStorage.getItem('focoum_tasks')`.
  - **OUTPUT:** `src/services/migrationService.js` que verifica no primeiro login se há dados locais órfãos e os envia ao Firestore via `writeBatch`, evitando perda de dados do usuário.
  - **VERIFY:** Usuário com tarefas prévias em cache visualiza suas tarefas sincronizadas na nuvem logo após o login.

---

### Fase 4: Integração nos Contexts & Modo Offline
- **TASK-07: Refatoração do TaskContext e TimerContext para Hibridismo Cloud/Local**
  - **Agent:** `frontend-specialist`
  - **Skill:** `clean-code`
  - **Prioridade:** P2
  - **Dependências:** TASK-05, TASK-06
  - **INPUT:** `TaskContext.jsx`, `TimerContext.jsx`.
  - **OUTPUT:** Contextos que utilizam Firestore quando o usuário estiver autenticado (com listeners em tempo real) e preservam o fallback de LocalStorage caso o usuário opte por usar sem login.
  - **VERIFY:** Adicionar, concluir ou reorganizar tarefas atualiza instantaneamente o Firestore; trava de 3 focos atua de forma idêntica.

- **TASK-08: Habilitação de Cache Offline do Firestore**
  - **Agent:** `frontend-specialist`
  - **Skill:** `clean-code`
  - **Prioridade:** P2
  - **Dependências:** TASK-07
  - **INPUT:** `initializeFirestore` com `persistentLocalCache` e `persistentMultipleTabManager`.
  - **OUTPUT:** Configuração de cache persistente no navegador via IndexedDB.
  - **VERIFY:** App funciona 100% com Wi-Fi desligado, enfileirando mutações e reconciliando automaticamente ao reconectar.

---

## Phase X: Verification Checklist
- [x] **Segurança de Acesso:** Regras declarativas em `firestore.rules` garantindo isolamento total por `request.auth.uid == userId`.
- [x] **Sem API Intermediária:** Todas as chamadas de autenticação e banco usam diretamente o Firebase Client SDK modular v10.
- [x] **Validação das Rules:** Validações de tipo, obrigatoriedade de campos e teto de caracteres no `firestore.rules`.
- [x] **Regra de Negócio dos 3 Focos:** Regra mantida no TaskContext e refletida nas coleções do Firestore.
- [x] **Offline-First:** O app opera em modo offline nativo com IndexedDB persistence e fallback automático.
- [x] **Build:** `npm run build` compilou com sucesso em 829ms.

## ✅ PHASE X COMPLETE
- Firebase SDK Modular: ✅ Integrado
- Firestore Rules: ✅ Criado em firestore.rules
- Google Auth: ✅ Integrado com suporte a Demo e Produção
- Data Rollover: ✅ MigrationService configurado
- Data: 26/09/2026

