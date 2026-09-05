import { FormEvent, useMemo, useState } from "react";
import { Check, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { TaskPriority, TaskStatus } from "@gestor/shared";
import { useStore, formatDate, todayKey } from "../lib/store";
import { priorityLabel, priorityTone, statusLabel, statusTone } from "../lib/labels";
import { DeadlineField } from "../components/ui/deadline-field";

const priorities: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const statuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE", "CANCELLED"];

export function TasksPage() {
  const { tasks, users, assignableUsers, currentUser, can, createTask, updateTask, deleteTask } = useStore();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const visibleTasks = useMemo(() => tasks.filter((task) => task.title.toLowerCase().includes(search.toLowerCase())), [tasks, search]);
  const activeUsers = users.filter((user) => user.active);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    createTask({
      title: String(data.get("title")),
      description: String(data.get("description") ?? ""),
      priority: data.get("priority") as TaskPriority,
      assignedToId: String(data.get("assignedToId") || currentUser?.id),
      dueDate: String(data.get("dueDate") || "")
    });
    event.currentTarget.reset();
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <section className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Tarefas</h2>
          <p className="text-sm font-medium text-slate-500">{visibleTasks.length} tarefas no quadro</p>
        </div>
        <button onClick={() => setOpen((value) => !value)} className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-700 text-white lg:w-auto lg:px-4">
          <Plus size={21} />
        </button>
      </section>

      {open ? (
        <form onSubmit={submit} noValidate className="grid gap-3 rounded-[24px] border border-slate-200 bg-white p-4 lg:grid-cols-2">
          <input name="title" required minLength={3} placeholder="Titulo da tarefa" className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none lg:col-span-2" />
          <textarea name="description" placeholder="Descricao" className="min-h-24 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none lg:col-span-2" />
          <select name="priority" defaultValue="MEDIUM" className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm">
            {priorities.map((priority) => <option key={priority} value={priority}>{priorityLabel[priority]}</option>)}
          </select>
          <DeadlineField id="new-task-deadline" minimum={todayKey()} />
          {assignableUsers.length > 1 ? (
            <select name="assignedToId" className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm lg:col-span-2">
              {assignableUsers.map((user) => <option key={user.id} value={user.id}>{user.name} · {user.position}</option>)}
            </select>
          ) : null}
          <button className="h-12 rounded-2xl bg-slate-950 text-sm font-black text-white lg:col-span-2">Salvar tarefa</button>
        </form>
      ) : null}

      <div className="flex h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4">
        <Search size={18} className="text-slate-400" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Buscar tarefa" />
      </div>

      <section className="grid gap-4 xl:grid-cols-2">
        {activeUsers.map((user) => {
          const userTasks = visibleTasks.filter((task) => task.assignedToId === user.id);
          return (
            <section key={user.id} className="rounded-[28px] border border-slate-200 bg-white p-4">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-black">{user.name}</h3>
                  <p className="truncate text-sm font-semibold text-slate-500">{user.position}</p>
                  <p className="truncate text-xs font-semibold text-blue-700">{user.focus}</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{userTasks.length}</span>
              </div>
              <div className="space-y-3">
                {userTasks.map((task) => {
                  const manager = can("TASK_UPDATE");
                  const own = task.assignedToId === currentUser?.id || task.createdById === currentUser?.id;
                  return (
                    <article key={task.id} className="rounded-[22px] border border-slate-200 bg-slate-50 p-3">
                      {editingId === task.id ? (
                        <EditTaskForm
                          task={task}
                          users={assignableUsers}
                          canAssign={assignableUsers.length > 1}
                          onCancel={() => setEditingId(null)}
                          onSave={(input) => {
                            updateTask(task.id, input);
                            setEditingId(null);
                          }}
                        />
                      ) : (
                        <>
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => updateTask(task.id, { status: task.status === "DONE" ? "TODO" : "DONE" })}
                              className={`mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 ${task.status === "DONE" ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white"}`}
                              title="Marcar feito"
                            >
                              {task.status === "DONE" ? <Check size={16} /> : null}
                            </button>
                            <Link to={`/tarefas/${task.id}`} className="min-w-0 flex-1">
                              <h4 className="font-black leading-snug">{task.title}</h4>
                              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{task.description || "Sem descricao"}</p>
                            </Link>
                            <div className="flex shrink-0 gap-2">
                              {(manager || own) ? (
                                <button onClick={() => setEditingId(task.id)} className="grid h-9 w-9 place-items-center rounded-2xl bg-blue-50 text-blue-700" title="Editar">
                                  <Pencil size={16} />
                                </button>
                              ) : null}
                              {can("TASK_DELETE") ? (
                                <button onClick={() => deleteTask(task.id)} className="grid h-9 w-9 place-items-center rounded-2xl bg-rose-50 text-rose-700" title="Excluir">
                                  <Trash2 size={16} />
                                </button>
                              ) : null}
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className={`rounded-full px-3 py-1 text-xs font-black ${statusTone[task.status]}`}>{statusLabel[task.status]}</span>
                            <span className={`rounded-full bg-white px-3 py-1 text-xs font-black ${priorityTone[task.priority]}`}>{priorityLabel[task.priority]}</span>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600">{formatDate(task.dueDate)}</span>
                          </div>
                          {(manager || own) ? (
                            <select value={task.status} onChange={(event) => updateTask(task.id, { status: event.target.value as TaskStatus })} className="mt-3 h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-xs font-black">
                              {(manager ? statuses : (["TODO", "IN_PROGRESS", "DONE"] as TaskStatus[])).map((status) => <option key={status} value={status}>{statusLabel[status]}</option>)}
                            </select>
                          ) : null}
                        </>
                      )}
                    </article>
                  );
                })}
                {!userTasks.length ? <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-400">Sem tarefas avulsas.</p> : null}
              </div>
            </section>
          );
        })}
      </section>
    </div>
  );
}

function EditTaskForm({
  task,
  users,
  canAssign,
  onSave,
  onCancel
}: {
  task: { title: string; description: string; priority: TaskPriority; assignedToId: string; dueDate: string };
  users: Array<{ id: string; name: string }>;
  canAssign: boolean;
  onSave: (input: { title: string; description: string; priority: TaskPriority; assignedToId?: string; dueDate: string }) => void;
  onCancel: () => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSave({
      title: String(data.get("title")),
      description: String(data.get("description") ?? ""),
      priority: data.get("priority") as TaskPriority,
      assignedToId: canAssign ? String(data.get("assignedToId")) : undefined,
      dueDate: String(data.get("dueDate") || "")
    });
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-2">
      <input name="title" defaultValue={task.title} className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm" />
      <textarea name="description" defaultValue={task.description} className="min-h-20 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm" />
      <select name="priority" defaultValue={task.priority} className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm">
        {priorities.map((priority) => <option key={priority} value={priority}>{priorityLabel[priority]}</option>)}
      </select>
      <DeadlineField id={`edit-task-deadline-${task.assignedToId}`} defaultValue={task.dueDate} compact />
      {canAssign ? (
        <select name="assignedToId" defaultValue={task.assignedToId} className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm">
          {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
        </select>
      ) : null}
      <div className="flex gap-2">
        <button className="h-10 flex-1 rounded-2xl bg-blue-700 text-sm font-black text-white">Salvar</button>
        <button type="button" onClick={onCancel} className="h-10 flex-1 rounded-2xl bg-white text-sm font-black">Cancelar</button>
      </div>
    </form>
  );
}
