import { z } from "zod";

export const taskStatuses = ["TODO", "IN_PROGRESS", "DONE", "CANCELLED"] as const;
export const taskPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export const permissions = [
  "USER_VIEW",
  "USER_CREATE",
  "USER_UPDATE",
  "USER_DELETE",
  "TASK_VIEW_ALL",
  "TASK_CREATE",
  "TASK_CREATE_FOR_OTHERS",
  "TASK_UPDATE",
  "TASK_DELETE",
  "TASK_ASSIGN",
  "TASK_COMPLETE",
  "REPORT_VIEW",
  "ROLE_MANAGE"
] as const;

export type TaskStatus = (typeof taskStatuses)[number];
export type TaskPriority = (typeof taskPriorities)[number];
export type Permission = (typeof permissions)[number];

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const createTaskSchema = z.object({
  title: z.string().min(3).max(140),
  description: z.string().max(5000).optional().default(""),
  assignedToId: z.string().uuid().optional(),
  priority: z.enum(taskPriorities).default("MEDIUM"),
  dueDate: z.string().datetime().optional().nullable()
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: z.enum(taskStatuses).optional()
});

export const createTaskCommentSchema = z.object({
  content: z.string().min(1).max(2000)
});

export const taskFiltersSchema = z.object({
  assigneeId: z.string().uuid().optional(),
  createdBy: z.string().uuid().optional(),
  status: z.enum(taskStatuses).optional(),
  priority: z.enum(taskPriorities).optional(),
  dueDate: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.string().optional()
});

export const createUserSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8),
  roleId: z.string().uuid()
});

export const updateUserSchema = createUserSchema
  .omit({ password: true })
  .partial()
  .extend({
    active: z.boolean().optional()
  });
