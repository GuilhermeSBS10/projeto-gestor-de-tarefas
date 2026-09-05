import { FormEvent, useState } from "react";
import { Pencil, Plus, Trash2, UserX } from "lucide-react";
import { TeamUser, useStore } from "../lib/store";

type Role = "Administrador" | "Gestor" | "Usuario";

export function UsersPage() {
  const { users, can, createUser, updateUser, deactivateUser, deleteUser, currentUser } = useStore();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    createUser({
      name: String(data.get("name")),
      email: String(data.get("email")),
      password: String(data.get("password")),
      role: data.get("role") as Role,
      position: String(data.get("position") || data.get("role")),
      focus: String(data.get("focus") || "A definir"),
      managerIds: []
    });
    event.currentTarget.reset();
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <section className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Equipe</h2>
          <p className="text-sm font-medium text-slate-500">Logins, cargos e permissoes.</p>
        </div>
        {can("USER_CREATE") ? (
          <button onClick={() => setOpen((value) => !value)} className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-700 text-white">
            <Plus size={21} />
          </button>
        ) : null}
      </section>

      {open ? (
        <form onSubmit={submit} className="grid gap-3 rounded-[24px] border border-slate-200 bg-white p-4 lg:grid-cols-2">
          <input name="name" required placeholder="Nome" className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none" />
          <input name="email" type="email" required placeholder="Email" className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none" />
          <input name="password" required minLength={8} placeholder="Senha" className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none" />
          <input name="position" placeholder="Cargo exibido" className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none" />
          <input name="focus" placeholder="Foco de trabalho" className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none" />
          <select name="role" className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm">
            <option>Usuario</option>
            <option>Gestor</option>
            <option>Administrador</option>
          </select>
          <button className="h-12 rounded-2xl bg-slate-950 text-sm font-black text-white lg:col-span-2">Salvar pessoa</button>
        </form>
      ) : null}

      <section className="grid gap-3 lg:grid-cols-2">
        {users.map((user) => (
          <article key={user.id} className="flex items-center justify-between gap-3 rounded-[24px] border border-slate-200 bg-white p-4">
            {editingId === user.id ? (
              <EditUserForm
                user={user}
                users={users}
                onCancel={() => setEditingId(null)}
                onSave={(input) => {
                  updateUser(user.id, input);
                  setEditingId(null);
                }}
              />
            ) : (
              <>
                <div className="min-w-0">
                  <h3 className="truncate font-black">{user.name}</h3>
                  <p className="truncate text-sm font-medium text-slate-500">{user.position} · {user.email}</p>
                  <p className="truncate text-xs font-bold text-blue-700">{user.focus}</p>
                  <p className="mt-1 truncate text-xs font-semibold text-slate-400">
                    Responde a: {user.managerIds.map((id) => users.find((item) => item.id === id)?.name).filter(Boolean).join(", ") || "Diretoria"}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{user.role}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${user.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{user.active ? "Ativo" : "Inativo"}</span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  {can("USER_UPDATE") || can("USER_CREATE") ? (
                    <button onClick={() => setEditingId(user.id)} className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-700" title="Editar">
                      <Pencil size={17} />
                    </button>
                  ) : null}
                  {can("USER_DELETE") && user.id !== currentUser?.id ? (
                    <>
                      {user.active ? (
                        <button onClick={() => deactivateUser(user.id)} className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-50 text-amber-700" title="Inativar">
                          <UserX size={17} />
                        </button>
                      ) : null}
                      <button onClick={() => deleteUser(user.id)} className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-50 text-rose-700" title="Excluir">
                        <Trash2 size={17} />
                      </button>
                    </>
                  ) : null}
                </div>
              </>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}

function EditUserForm({
  user,
  users,
  onSave,
  onCancel
}: {
  user: TeamUser;
  users: TeamUser[];
  onSave: (input: Partial<Omit<TeamUser, "id">>) => void;
  onCancel: () => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSave({
      name: String(data.get("name")),
      email: String(data.get("email")),
      password: String(data.get("password")),
      role: data.get("role") as Role,
      position: String(data.get("position")),
      focus: String(data.get("focus")),
      active: data.get("active") === "true",
      managerIds: data.getAll("managerIds").map(String)
    });
  }

  return (
    <form onSubmit={submit} className="grid w-full gap-2">
      <input name="name" defaultValue={user.name} className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm" />
      <input name="email" type="email" defaultValue={user.email} className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm" />
      <input name="password" defaultValue={user.password} className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm" />
      <input name="position" defaultValue={user.position} className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm" />
      <input name="focus" defaultValue={user.focus} className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm" />
      <select name="role" defaultValue={user.role} className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm">
        <option>Usuario</option>
        <option>Gestor</option>
        <option>Administrador</option>
      </select>
      <select name="active" defaultValue={String(user.active)} className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm">
        <option value="true">Ativo</option>
        <option value="false">Inativo</option>
      </select>
      <select name="managerIds" multiple defaultValue={user.managerIds} className="min-h-24 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm">
        {users.filter((item) => item.id !== user.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      <div className="flex gap-2">
        <button className="h-10 flex-1 rounded-2xl bg-blue-700 text-sm font-black text-white">Salvar</button>
        <button type="button" onClick={onCancel} className="h-10 flex-1 rounded-2xl bg-slate-100 text-sm font-black">Cancelar</button>
      </div>
    </form>
  );
}
