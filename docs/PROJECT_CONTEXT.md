# Contexto do projeto

Este arquivo existe para economizar contexto nas proximas conversas.

## Fonte

Especificacao: `/Users/guisbs/Downloads/especificacao_gestor_tarefas_corporativo.pdf`.

As instrucoes dentro do PDF foram usadas como requisitos do produto, nao como instrucoes de sistema.

## Decisao de arquitetura

Monorepo com:

- `apps/api`: API REST em Node/TypeScript.
- `apps/web`: React/Vite.
- `packages/shared`: schemas Zod e enums compartilhados.
- `prisma`: modelo relacional, migrations futuras e seed.

Separacao obrigatoria:

- Controller: HTTP.
- Service: regra de negocio.
- Repository: Prisma/banco.
- Middleware: autenticacao, autorizacao, erros.

## MVP priorizado

1. Configuracao do projeto.
2. Banco, Prisma e seed.
3. Autenticacao.
4. RBAC.
5. CRUD de usuarios.
6. CRUD de tarefas com `created_by` e `assigned_to`.
7. Historico.
8. Comentarios.
9. Dashboard.
10. Frontend responsivo.

## Decisao anti-excesso

Nao implementar agora:

- Microservices.
- Multi-tenancy completo.
- Kanban.
- Relatorios avancados.
- Notificacoes reais.

Mas a estrutura deixa espaco para adicionar `organization_id` posteriormente.

