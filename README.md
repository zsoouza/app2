# Nexus Study

Hub da rotina de estudos: registre, organize e exporte o que você aprendeu.

## Visão Geral

O Nexus Study é o centro da rotina de estudo para vestibulandos, concurseiros e estudantes em geral. O aluno inicia blocos de estudo (estilo Pomodoro), registra o que aprendeu ao final de cada bloco e acompanha histórico e estatísticas por matéria/assunto.

### O que o app faz

- Blocos de estudo com timer (Pomodoro ou livre)
- Registro pós-bloco: o que aprendeu, dificuldades, pontos-chave
- Histórico organizado por matéria → assunto → sessão
- Estatísticas: tempo por matéria, sessões feitas, progresso de metas
- Exportação de notas em PDF ou Markdown (para usar no NotebookLM, ChatGPT, etc.)

### O que o app **não** faz (por design)

- Não substitui o Anki (sem flashcards por ora)
- Não substitui o NotebookLM (sem IA integrada no MVP)
- Não é um to-do genérico

---

## Stack

| Camada     | Tecnologia                              |
|------------|-----------------------------------------|
| Backend    | NestJS (Node.js + TypeScript)           |
| Banco      | PostgreSQL 16 via Prisma ORM            |
| Frontend   | Next.js 14 (App Router) + Tailwind CSS  |
| Auth       | JWT (email/senha) — estrutura pronta para OAuth |
| PDF Export | PDFKit (server-side)                    |
| Estado FE  | Zustand                                 |

---

## Estrutura de Pastas

```
nexus-study/
├── backend/              # API NestJS
│   ├── prisma/           # Schema e migrations
│   └── src/
│       ├── auth/         # Login, registro, JWT
│       ├── users/        # Perfil do usuário
│       ├── subjects/     # Matérias
│       ├── topics/       # Assuntos
│       ├── sessions/     # Sessões de estudo
│       ├── notes/        # Anotações pós-bloco
│       ├── goals/        # Metas diárias/semanais
│       ├── export/       # Geração PDF/Markdown
│       ├── dashboard/    # Dados do "Hoje"
│       └── common/       # Decorators, guards compartilhados
└── frontend/             # App Next.js
    └── src/
        ├── app/          # Rotas (App Router)
        │   ├── (auth)/   # Login e cadastro
        │   └── (app)/    # Área autenticada
        ├── components/   # Componentes reutilizáveis
        ├── lib/          # Cliente HTTP, helpers
        ├── store/        # Estado global (Zustand)
        └── types/        # Tipos TypeScript compartilhados
```

---

## Como Rodar

### Com Docker (recomendado)

```bash
cp .env.example .env
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Swagger docs: http://localhost:3001/api

### Manualmente

**Backend:**
```bash
cd backend
cp .env.example .env   # Configure DATABASE_URL
npm install
npx prisma migrate dev
npm run start:dev
```

**Frontend:**
```bash
cd frontend
cp .env.example .env   # Configure NEXT_PUBLIC_API_URL
npm install
npm run dev
```

---

## Principais Endpoints

| Método | Rota                                      | Descrição                        |
|--------|-------------------------------------------|----------------------------------|
| POST   | /auth/register                            | Criar conta                      |
| POST   | /auth/login                               | Login (retorna JWT)              |
| GET    | /dashboard/today                          | Dados do dia (metas + progresso) |
| GET    | /subjects                                 | Listar matérias                  |
| POST   | /subjects                                 | Criar matéria                    |
| GET    | /subjects/:id/topics                      | Listar assuntos de uma matéria   |
| POST   | /subjects/:id/topics                      | Criar assunto                    |
| POST   | /sessions                                 | Iniciar sessão de estudo         |
| PATCH  | /sessions/:id/finish                      | Finalizar sessão + registrar nota|
| GET    | /sessions?subjectId=&topicId=             | Listar sessões (com filtros)     |
| GET    | /goals                                    | Listar metas                     |
| POST   | /goals                                    | Criar meta                       |
| GET    | /export/subject/:id?format=pdf            | Exportar matéria (PDF/Markdown)  |
| GET    | /export/topic/:id?format=md               | Exportar assunto (PDF/Markdown)  |

---

## Modelo de Dados

```
User ──< Subject ──< Topic
  │           └──────────┐
  └──< StudySession >────┘
            │
            └── Note (1:1)

User ──< Goal
```

---

## Roadmap Futuro

- [ ] Login com Google (OAuth2)
- [ ] IA: geração de perguntas/flashcards a partir das notas
- [ ] Revisão espaçada (tabela `Review` com agendamentos)
- [ ] Integração com Google Agenda
- [ ] Export para deck Anki
- [ ] App mobile (React Native / Expo)
