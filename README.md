# Gestor de Tarefas Corporativo

Sistema web corporativo para gestao de tarefas, com base preparada para evoluir para SaaS sem transformar o MVP em microservices.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, React Hook Form, Zod, Lucide Icons
- Backend: Node.js, TypeScript, Express, Prisma, PostgreSQL, JWT, bcrypt
- Qualidade: TypeScript strict, ESLint, Prettier, Vitest
- Infra: Docker Compose para PostgreSQL e deploy independente entre web/API

## Estrutura

```txt
apps/
  api/        REST API com controllers, services, repositories e middlewares
  web/        Aplicacao React
packages/
  shared/     Tipos, enums e schemas Zod compartilhados
prisma/       Schema e seed do banco
docs/         Contexto de produto e decisoes tecnicas
```

## Como rodar

1. Instale dependencias:

```bash
npm install
```

2. Configure ambiente:

```bash
cp .env.example .env
```

3. Suba o PostgreSQL:

```bash
docker compose up -d db
```

4. Rode migrations e seed:

```bash
npm run db:migrate
npm run db:seed
```

5. Inicie API e web:

```bash
npm run dev
```

## Usuarios de desenvolvimento

Todos usam a senha `Admin@123456`.

- admin@empresa.com
- gestor@empresa.com
- distribuidor@empresa.com
- usuario@empresa.com

## Principios

- Backend concentra regras de negocio e permissoes.
- Frontend nunca acessa o banco diretamente.
- RBAC granular desde o MVP.
- Historico de tarefas imutavel pelo usuario.
- UI compacta, profissional e responsiva.
- Arquitetura pronta para `organization_id` no futuro, sem multi-tenancy completo agora.

