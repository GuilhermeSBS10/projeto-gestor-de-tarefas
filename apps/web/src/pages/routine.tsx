import { FormEvent, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import type { RoutineFrequency } from "../lib/store";
import { routineIsDue, todayKey, useStore } from "../lib/store";

const frequencyLabel: Record<RoutineFrequency, string> = {
  DAILY: "Diaria",
  WEEKLY: "Semanal",
  MONTHLY: "Mensal"
};

export function RoutinePage() {
  const { routines, users, assignableUsers, currentUser, can, createRoutine, updateRoutine, toggleRoutine, deactivateRoutine } = useStore();
  const [open, setOpen] = useState(false);
  const [showTeamPending, setShowTeamPending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const dateKey = todayKey();
  const activeRoutines = routines.filter((routine) => routine.active);
  const dueToday = useMemo(() => activeRoutines.filter((routine) => routineIsDue(routine, dateKey)), [activeRoutines, dateKey]);
  const myDueToday = dueToday.filter((routine) => routine.assignedToId === currentUser?.id);
  const pending = dueToday.filter((routine) => !routine.completions[dateKey]);
  const myPending = myDueToday.filter((routine) => !routine.completions[dateKey]);
  const canManage = can("TASK_CREATE_FOR_OTHERS") || can("TASK_UPDATE");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    createRoutine({
      title: String(data.get("title")),
      description: String(data.get("description") ?? ""),
      frequency: data.get("frequency") as RoutineFrequency,
      assignedToId: String(data.get("assignedToId") || currentUser?.id),
      weeklyDay: Number(data.get("weeklyDay") || 1),
      monthlyDay: Number(data.get("monthlyDay") || 1)
    });
    event.currentTarget.reset();
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] bg-blue-700 p-5 text-white shadow-xl shadow-blue-200/70">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15">
            <img src="/brand/logo-symbol.jpeg" alt="" className="h-10 w-10 rounded-xl object-cover" />
          </div>
          <div>
            <p className="text-sm font-bold text-blue-100">Rotina de hoje</p>
            <h2 className="text-3xl font-black tracking-tight">{myPending.length} suas pendentes</h2>
            <p className="mt-1 text-sm leading-6 text-blue-50">Sua tela mostra suas rotinas. Use faltantes do time para ajudar outras pessoas.</p>
          </div>
        </div>
      </section>

      {canManage ? (
        <section className="space-y-3">
          <button onClick={() => setOpen((value) => !value)} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white sm:w-auto">
            <Plus size={18} />
            Criar rotina
          </button>
          {open ? (
            <form onSubmit={submit} className="grid gap-3 rounded-[24px] border border-slate-200 bg-white p-4 lg:grid-cols-2">
              <input name="title" required minLength={3} placeholder="Nome da rotina" className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none lg:col-span-2" />
              <textarea name="description" placeholder="Descricao" className="min-h-20 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none lg:col-span-2" />
              <select name="frequency" defaultValue="DAILY" className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm">
                <option value="DAILY">Diaria, segunda a sexta</option>
                <option value="WEEKLY">Semanal</option>
                <option value="MONTHLY">Mensal</option>
              </select>
              <select name="weeklyDay" defaultValue={1} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm">
                <option value={1}>Segunda</option>
                <option value={2}>Terca</option>
                <option value={3}>Quarta</option>
                <option value={4}>Quinta</option>
                <option value={5}>Sexta</option>
              </select>
              <input name="monthlyDay" type="number" min={1} max={28} defaultValue={1} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm" />
              <select name="assignedToId" className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm lg:col-span-2">
                {assignableUsers.map((user) => <option key={user.id} value={user.id}>{user.name} · {user.position}</option>)}
              </select>
              <button className="h-12 rounded-2xl bg-blue-700 text-sm font-black text-white lg:col-span-2">Salvar rotina</button>
            </form>
          ) : null}
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-black">Minhas rotinas de hoje</h3>
          <button onClick={() => setShowTeamPending((value) => !value)} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700">
            <Users size={17} />
            Faltantes do time
          </button>
        </div>
        {myDueToday.map((routine) => {
          const assignee = users.find((user) => user.id === routine.assignedToId);
          const done = Boolean(routine.completions[dateKey]);
          return (
            <RoutineCard key={routine.id} assigneeName={assignee?.name} done={done} title={routine.title} description={routine.description} frequency={routine.frequency} onToggle={() => toggleRoutine(routine.id, dateKey)} />
          );
        })}
        {!myDueToday.length ? <p className="rounded-2xl bg-white p-4 text-sm font-bold text-slate-500">Nenhuma rotina sua para hoje.</p> : null}
      </section>

      {showTeamPending ? (
        <section className="space-y-3 rounded-[28px] border border-slate-200 bg-white p-4">
          <h3 className="font-black">Faltantes do time</h3>
          {users.filter((user) => user.active).map((user) => {
            const userPending = pending.filter((routine) => routine.assignedToId === user.id);
            return (
              <div key={user.id} className="rounded-2xl bg-slate-50 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-black">{user.name}</h4>
                    <p className="text-xs font-bold text-slate-500">{user.position}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700">{userPending.length}</span>
                </div>
                <div className="space-y-2">
                  {userPending.map((routine) => (
                    <RoutineCard
                      key={routine.id}
                      assigneeName={user.name}
                      done={false}
                      title={routine.title}
                      description={routine.description}
                      frequency={routine.frequency}
                      onToggle={() => toggleRoutine(routine.id, dateKey)}
                    />
                  ))}
                  {!userPending.length ? <p className="text-sm font-bold text-slate-400">Nada pendente.</p> : null}
                </div>
              </div>
            );
          })}
        </section>
      ) : null}

      {canManage ? (
        <section className="space-y-3">
          <h3 className="font-black">Todas as rotinas</h3>
          <div className="grid gap-3 lg:grid-cols-2">
            {activeRoutines.map((routine) => {
              const assignee = users.find((user) => user.id === routine.assignedToId);
              return (
                <article key={routine.id} className="rounded-[24px] border border-slate-200 bg-white p-4">
                  {editingId === routine.id ? (
                    <EditRoutineForm
                      routine={routine}
                      users={users}
                      assignableUsers={assignableUsers}
                      onCancel={() => setEditingId(null)}
                      onSave={(input) => {
                        updateRoutine(routine.id, input);
                        setEditingId(null);
                      }}
                    />
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-black">{routine.title}</h4>
                        <p className="mt-1 text-sm text-slate-500">{frequencyLabel[routine.frequency]} · {assignee?.name}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingId(routine.id)} className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700">
                          <Pencil size={17} />
                        </button>
                        <button onClick={() => deactivateRoutine(routine.id)} className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-rose-50 text-rose-700">
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function RoutineCard({
  assigneeName,
  done,
  title,
  description,
  frequency,
  onToggle
}: {
  assigneeName?: string;
  done: boolean;
  title: string;
  description: string;
  frequency: RoutineFrequency;
  onToggle: () => void;
}) {
  return (
    <article className={`rounded-[24px] border p-4 ${done ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={`mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 ${done ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white"}`}
          aria-label="Marcar rotina"
        >
          {done ? "✓" : ""}
        </button>
        <div className="min-w-0 flex-1">
          <h4 className="font-black leading-snug">{title}</h4>
          <p className="mt-1 text-sm text-slate-600">{description || "Sem descricao"}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{frequencyLabel[frequency]}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{assigneeName}</span>
            {done ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">Feito</span> : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function EditRoutineForm({
  routine,
  users,
  assignableUsers,
  onSave,
  onCancel
}: {
  routine: { title: string; description: string; frequency: RoutineFrequency; assignedToId: string; weeklyDay?: number; monthlyDay?: number };
  users: Array<{ id: string; name: string; active: boolean }>;
  assignableUsers: Array<{ id: string; name: string; active: boolean }>;
  onSave: (input: { title: string; description: string; frequency: RoutineFrequency; assignedToId: string; weeklyDay: number; monthlyDay: number }) => void;
  onCancel: () => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSave({
      title: String(data.get("title")),
      description: String(data.get("description") ?? ""),
      frequency: data.get("frequency") as RoutineFrequency,
      assignedToId: String(data.get("assignedToId")),
      weeklyDay: Number(data.get("weeklyDay") || 1),
      monthlyDay: Number(data.get("monthlyDay") || 1)
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-2">
      <input name="title" defaultValue={routine.title} className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm" />
      <textarea name="description" defaultValue={routine.description} className="min-h-20 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
      <select name="frequency" defaultValue={routine.frequency} className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm">
        <option value="DAILY">Diaria</option>
        <option value="WEEKLY">Semanal</option>
        <option value="MONTHLY">Mensal</option>
      </select>
      <select name="weeklyDay" defaultValue={routine.weeklyDay ?? 1} className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm">
        <option value={1}>Segunda</option>
        <option value={2}>Terca</option>
        <option value={3}>Quarta</option>
        <option value={4}>Quinta</option>
        <option value={5}>Sexta</option>
      </select>
      <input name="monthlyDay" type="number" min={1} max={28} defaultValue={routine.monthlyDay ?? 1} className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm" />
      <select name="assignedToId" defaultValue={routine.assignedToId} className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm">
        {assignableUsers.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
      </select>
      <div className="flex gap-2">
        <button className="h-10 flex-1 rounded-2xl bg-blue-700 text-sm font-black text-white">Salvar</button>
        <button type="button" onClick={onCancel} className="h-10 flex-1 rounded-2xl bg-slate-100 text-sm font-black">Cancelar</button>
      </div>
    </form>
  );
}
