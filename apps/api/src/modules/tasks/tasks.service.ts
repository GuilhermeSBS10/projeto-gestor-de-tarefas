import type { z } from "zod";
import type { createTaskCommentSchema, createTaskSchema, taskFiltersSchema, updateTaskSchema } from "@gestor/shared";
import type { AuthUser } from "../../shared/auth/jwt";
import { AppError } from "../../shared/http/app-error";
import { prisma } from "../../shared/prisma";

type CreateTaskInput = z.infer<typeof createTaskSchema>;
type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
type CreateTaskCommentInput = z.infer<typeof createTaskCommentSchema>;
type TaskFilters = z.infer<typeof taskFiltersSchema>;

export class TasksService {
  async list(filters: TaskFilters) {
    const where = {
      assignedToId: filters.assigneeId,
      createdById: filters.createdBy,
      status: filters.status,
      priority: filters.priority,
      title: filters.search ? { contains: filters.search, mode: "insensitive" as const } : undefined
    };

    const [items, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: { assignedTo: true, createdBy: true },
        orderBy: { createdAt: "desc" },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      prisma.task.count({ where })
    ]);

    return { items: items.map(stripSensitiveUsers), total, page: filters.page, limit: filters.limit };
  }

  async create(user: AuthUser, input: CreateTaskInput) {
    const creator = await prisma.user.findUnique({ where: { id: user.id } });
    if (!creator || !creator.active) {
      throw new AppError("Usuario autenticado nao existe no banco. Faca login novamente.", 401);
    }

    const canAssignOthers = user.permissions.includes("TASK_CREATE_FOR_OTHERS");
    const assignedToId = canAssignOthers ? (input.assignedToId ?? user.id) : user.id;

    if (input.assignedToId && input.assignedToId !== user.id && !canAssignOthers) {
      throw new AppError("Voce nao pode criar tarefas para outras pessoas", 403);
    }

    const assignee = await prisma.user.findUnique({ where: { id: assignedToId } });
    if (!assignee || !assignee.active) {
      throw new AppError("Responsavel da tarefa nao existe ou esta inativo", 422);
    }

    const task = await prisma.task.create({
      data: {
        title: input.title,
        description: input.description,
        priority: input.priority,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        createdById: user.id,
        assignedToId,
        history: {
          create: {
            userId: user.id,
            action: "CREATE_TASK",
            newValue: input.title
          }
        }
      },
      include: { assignedTo: true, createdBy: true }
    });

    return stripSensitiveUsers(task);
  }

  async findById(id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: true,
        createdBy: true,
        comments: { include: { user: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: "desc" } },
        history: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } }
      }
    });

    if (!task) throw new AppError("Tarefa nao encontrada", 404);
    return stripSensitiveUsers(task);
  }

  async update(user: AuthUser, id: string, input: UpdateTaskInput) {
    const current = await prisma.task.findUnique({ where: { id } });
    if (!current) throw new AppError("Tarefa nao encontrada", 404);
    const canManageAll = canManageTeamTasks(user);
    const isOwnTask = current.assignedToId === user.id || current.createdById === user.id;

    if (!canManageAll) {
      const onlyCompleting = Object.keys(input).every((key) => key === "status") && (input.status === "DONE" || input.status === "IN_PROGRESS");
      if (!isOwnTask || !onlyCompleting) {
        throw new AppError("Voce so pode atualizar o andamento das suas tarefas", 403);
      }
    }

    const nextStatus = input.status;
    const completedAt = nextStatus === "DONE" ? new Date() : nextStatus ? null : current.completedAt;

    const task = await prisma.task.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        priority: input.priority,
        status: input.status,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        assignedToId: input.assignedToId,
        completedAt,
        history: {
          create: {
            userId: user.id,
            action: "UPDATE_TASK",
            oldValue: JSON.stringify(current),
            newValue: JSON.stringify(input)
          }
        }
      },
      include: { assignedTo: true, createdBy: true }
    });

    return stripSensitiveUsers(task);
  }

  async remove(user: AuthUser, id: string) {
    if (!canManageTeamTasks(user)) {
      throw new AppError("Apenas administradores e gestores podem excluir tarefas", 403);
    }

    const current = await prisma.task.findUnique({ where: { id } });
    if (!current) throw new AppError("Tarefa nao encontrada", 404);

    await prisma.taskHistory.create({
      data: { taskId: id, userId: user.id, action: "DELETE_TASK", oldValue: current.title }
    });
    await prisma.task.delete({ where: { id } });
  }

  async history(id: string) {
    return prisma.taskHistory.findMany({
      where: { taskId: id },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" }
    });
  }

  async comment(user: AuthUser, id: string, input: CreateTaskCommentInput) {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) throw new AppError("Tarefa nao encontrada", 404);

    if (!canManageTeamTasks(user) && task.assignedToId !== user.id && task.createdById !== user.id) {
      throw new AppError("Voce so pode comentar nas suas tarefas", 403);
    }

    return prisma.taskComment.create({
      data: {
        taskId: id,
        userId: user.id,
        content: input.content
      },
      include: { user: { select: { id: true, name: true, email: true } } }
    });
  }
}

function canManageTeamTasks(user: AuthUser) {
  return user.role === "Administrador" || user.role === "Gestor" || user.permissions.includes("TASK_UPDATE");
}

function stripSensitiveUsers<T extends { assignedTo?: unknown; createdBy?: unknown }>(task: T) {
  return JSON.parse(JSON.stringify(task, (_key, value) => {
    if (value && typeof value === "object" && "passwordHash" in value) {
      const { passwordHash: _passwordHash, ...safe } = value;
      return safe;
    }
    return value;
  })) as T;
}
