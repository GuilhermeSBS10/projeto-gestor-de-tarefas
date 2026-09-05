import type { TaskPriority, TaskStatus } from "@gestor/shared";

export const statusLabel: Record<TaskStatus, string> = {
  TODO: "A fazer",
  IN_PROGRESS: "Em andamento",
  DONE: "Concluida",
  CANCELLED: "Cancelada"
};

export const priorityLabel: Record<TaskPriority, string> = {
  LOW: "Baixa",
  MEDIUM: "Media",
  HIGH: "Alta",
  URGENT: "Urgente"
};

export const statusTone: Record<TaskStatus, string> = {
  TODO: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  DONE: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-zinc-100 text-zinc-600"
};

export const priorityTone: Record<TaskPriority, string> = {
  LOW: "text-slate-600",
  MEDIUM: "text-blue-700",
  HIGH: "text-amber-700",
  URGENT: "text-rose-700"
};
