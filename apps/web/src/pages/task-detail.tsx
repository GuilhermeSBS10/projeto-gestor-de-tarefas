import { FormEvent, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import type { TaskStatus } from "@gestor/shared";
import { useStore, formatDate } from "../lib/store";
import { priorityLabel, statusLabel, statusTone } from "../lib/labels";

export function TaskDetailPage() {
  const { id } = useParams();
  const { tasks, users, currentUser, can, updateTask, addComment } = useStore();
  const [comment, setComment] = useState("");
  const task = tasks.find((item) => item.id === id);

  if (!task) return <p className="rounded-2xl bg-white p-4 font-bold">Tarefa nao encontrada.</p>;
  const currentTask = task;

  const assignee = users.find((user) => user.id === currentTask.assignedToId);
  const creator = users.find((user) => user.id === currentTask.createdById);
  const canEdit = can("TASK_UPDATE") || currentTask.assignedToId === currentUser?.id || currentTask.createdById === currentUser?.id;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!comment.trim()) return;
    addComment(currentTask.id, comment);
    setComment("");
  }

  return (
    <div className="space-y-4">
      <Link to="/app/tarefas" className="inline-flex items-center gap-2 text-sm font-black text-blue-700">
        <ArrowLeft size={17} />
        Voltar
      </Link>
      <section className="rounded-[28px] border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black tracking-tight">{currentTask.title}</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{currentTask.description || "Sem descricao."}</p>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${statusTone[currentTask.status]}`}>{statusLabel[currentTask.status]}</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Info label="Responsavel" value={assignee?.name ?? "-"} />
          <Info label="Criada por" value={creator?.name ?? "-"} />
          <Info label="Prazo" value={formatDate(currentTask.dueDate)} />
          <Info label="Prioridade" value={priorityLabel[currentTask.priority]} />
        </div>
        {canEdit ? (
          <select value={currentTask.status} onChange={(event) => updateTask(currentTask.id, { status: event.target.value as TaskStatus })} className="mt-4 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black sm:w-auto">
            {(["TODO", "IN_PROGRESS", "DONE", "CANCELLED"] as TaskStatus[]).map((status) => <option key={status} value={status}>{statusLabel[status]}</option>)}
          </select>
        ) : null}
      </section>
      <section className="rounded-[24px] border border-slate-200 bg-white p-4">
        <h3 className="font-black">Comentarios</h3>
        <form onSubmit={submit} className="mt-3 flex flex-col gap-2">
          <textarea value={comment} onChange={(event) => setComment(event.target.value)} className="min-h-24 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" placeholder="Escrever comentario" />
          <button className="h-11 rounded-2xl bg-blue-700 px-4 text-sm font-black text-white sm:w-max">Comentar</button>
        </form>
        <div className="mt-4 space-y-3">
          {currentTask.comments.map((item) => {
            const user = users.find((user) => user.id === item.userId);
            return (
              <div key={item.id} className="rounded-2xl bg-slate-50 p-3 text-sm">
                <p>{item.content}</p>
                <p className="mt-2 text-xs font-bold text-slate-500">{user?.name} · {formatDate(item.createdAt.slice(0, 10))}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}
