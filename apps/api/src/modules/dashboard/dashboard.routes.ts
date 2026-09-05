import { Router } from "express";
import { authenticate } from "../../shared/auth/authenticate";
import { authorize } from "../../shared/auth/authorize";
import { asyncHandler } from "../../shared/http/async-handler";
import { prisma } from "../../shared/prisma";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/",
  authenticate,
  authorize("TASK_VIEW_ALL"),
  asyncHandler(async (request, response) => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    const [open, inProgress, today, overdue, completed, mine, byStatus, byAssignee, activity] =
      await Promise.all([
        prisma.task.count({ where: { status: { in: ["TODO", "IN_PROGRESS"] } } }),
        prisma.task.count({ where: { status: "IN_PROGRESS" } }),
        prisma.task.count({ where: { dueDate: { gte: start, lte: end } } }),
        prisma.task.count({ where: { dueDate: { lt: now }, status: { notIn: ["DONE", "CANCELLED"] } } }),
        prisma.task.count({ where: { status: "DONE" } }),
        prisma.task.findMany({
          where: { assignedToId: request.user!.id, status: { notIn: ["DONE", "CANCELLED"] } },
          take: 6,
          orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }]
        }),
        prisma.task.groupBy({ by: ["status"], _count: true }),
        prisma.task.groupBy({ by: ["assignedToId"], _count: true }),
        prisma.taskHistory.findMany({
          take: 8,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true } }, task: { select: { title: true } } }
        })
      ]);

    response.json({ open, inProgress, today, overdue, completed, mine, byStatus, byAssignee, activity });
  })
);

