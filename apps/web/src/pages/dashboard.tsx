import { ArrowRight, CalendarDays, CheckCircle2, CircleAlert, Clock3, ListChecks, Plus, Users } from "lucide-react";
import { Link } from "react-router-dom";
import type { TaskPriority } from "@gestor/shared";
import type { TeamTask } from "../lib/store";
import { formatDate, routineIsDue, todayKey, useStore } from "../lib/store";
import { priorityLabel, statusLabel, statusTone } from "../lib/labels";

const PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const PRIORITY_COLORS: Record<TaskPriority, string> = { LOW: "#94a3b8", MEDIUM: "#2563eb", HIGH: "#f59e0b", URGENT: "#e11d48" };

export function DashboardPage() {
  const { tasks, users, currentUser, routines } = useStore();
  const today = todayKey();
  const active = tasks.filter((task) => !["DONE", "CANCELLED"].includes(task.status));
  const overdue = active.filter((task) => task.dueDate && task.dueDate < today);
  const done = tasks.filter((task) => task.status === "DONE");
  const mine = active.filter((task) => task.assignedToId === currentUser?.id);
  const pendingRoutines = routines.filter((routine) => routineIsDue(routine, today) && !routine.completions[today]);
  const recent = [...tasks].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);
  const team = users.filter((user) => user.active).map((user) => ({ user, open: active.filter((task) => task.assignedToId === user.id).length })).sort((a, b) => b.open - a.open);

  return <div className="task-dashboard">
    <header className="task-dashboard-heading">
      <div><h2>Painel de tarefas</h2><p>{formatLongDate(new Date())} · {operationSummary(active.length, overdue.length)}</p></div>
      <Link to="/app/tarefas" className="dashboard-primary-action"><Plus size={17} />Nova tarefa</Link>
    </header>

    <nav className="dashboard-section-nav" aria-label="Atalhos do painel">
      <Link className="is-active" to="/app"><ListChecks size={15} />Visão geral</Link>
      <Link to="/app/tarefas">Tarefas</Link><Link to="/app/rotina">Rotinas</Link><Link to="/app/usuarios">Equipe</Link>
    </nav>

    <section className="dashboard-card-grid" aria-label="Indicadores principais">
      <MetricCard icon={Clock3} label="Tarefas abertas" value={active.length} detail={`${mine.length} atribuídas a você`} trend={sparkValues(tasks, "active")} color="#2563eb" />
      <MetricCard icon={CircleAlert} label="Fora do prazo" value={overdue.length} detail={overdue.length ? "Exigem atenção hoje" : "Operação em dia"} trend={sparkValues(tasks, "overdue")} color="#e11d48" />
      <MetricCard icon={CheckCircle2} label="Taxa de conclusão" value={`${tasks.length ? Math.round(done.length / tasks.length * 100) : 0}%`} detail={`${done.length} tarefas concluídas`} trend={sparkValues(tasks, "done")} color="#16a34a" />
      <article className="dashboard-wide-metric"><div><span>Rotinas de hoje</span><strong>{pendingRoutines.length}</strong><p>{pendingRoutines.length === 1 ? "1 execução pendente" : `${pendingRoutines.length} execuções pendentes`}</p></div><MiniLine values={sparkValues(tasks, "routine")} color="#0f172a" /></article>
    </section>

    <section className="dashboard-analysis-grid">
      <article className="dashboard-panel dashboard-flow-panel"><PanelTitle title="Fluxo da semana" description="Tarefas abertas e concluídas nos últimos sete dias" /><FlowChart tasks={tasks} /></article>
      <article className="dashboard-panel dashboard-priority-panel"><PanelTitle title="Prioridades" description="Composição das tarefas abertas" /><PriorityChart tasks={active} /></article>
    </section>

    <section className="dashboard-bottom-grid">
      <article className="dashboard-panel dashboard-table-panel"><PanelTitle title="Tarefas recentes" description="Últimas movimentações da equipe" aside={<Link to="/app/tarefas" className="dashboard-text-link">Ver todas <ArrowRight size={14} /></Link>} /><RecentTasks tasks={recent} users={users} today={today} /></article>
      <article className="dashboard-panel dashboard-team-panel"><PanelTitle title="Equipe" description="Distribuição atual das demandas" aside={<span className="dashboard-team-count"><Users size={14} />{team.length}</span>} /><TeamList team={team} /></article>
    </section>
  </div>;
}

function MetricCard({ icon: Icon, label, value, detail, trend, color }: { icon: typeof Clock3; label: string; value: number | string; detail: string; trend: number[]; color: string }) {
  return <article className="dashboard-stat-card"><div className="dashboard-stat-label"><Icon size={15} /><span>{label}</span></div><div className="dashboard-stat-main"><strong>{value}</strong><MiniLine values={trend} color={color} /></div><p>{detail}</p></article>;
}

function MiniLine({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1); const min = Math.min(...values); const range = Math.max(max - min, 1);
  const points = values.map((value, index) => `${index * 12},${31 - ((value - min) / range) * 25}`).join(" ");
  return <svg viewBox="0 0 72 36" className="dashboard-mini-line" aria-hidden="true"><polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function PanelTitle({ title, description, aside }: { title: string; description: string; aside?: React.ReactNode }) { return <header className="dashboard-panel-header"><div><h3 className="dashboard-panel-title">{title}</h3><p className="dashboard-panel-description">{description}</p></div>{aside}</header>; }

function FlowChart({ tasks }: { tasks: TeamTask[] }) {
  const days = Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - 6 + index); const key = localDateKey(date); return { key, label: new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(date).replace(".", ""), open: tasks.filter((t) => t.createdAt.slice(0, 10) === key).length, done: tasks.filter((t) => t.status === "DONE" && t.updatedAt.slice(0, 10) === key).length }; });
  const max = Math.max(...days.flatMap((d) => [d.open, d.done]), 1); const chart = (field: "open" | "done") => days.map((d, i) => `${24 + i * 74},${146 - (d[field] / max) * 105}`).join(" ");
  return <div className="dashboard-flow-chart"><div className="dashboard-chart-legend"><span><i className="legend-open" />Criadas</span><span><i className="legend-done" />Concluídas</span></div><svg viewBox="0 0 492 180" role="img" aria-label="Tarefas criadas e concluídas nos últimos sete dias"><defs><linearGradient id="open-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2563eb" stopOpacity=".2"/><stop offset="1" stopColor="#2563eb" stopOpacity="0"/></linearGradient><linearGradient id="done-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#16a34a" stopOpacity=".18"/><stop offset="1" stopColor="#16a34a" stopOpacity="0"/></linearGradient></defs>{[41,76,111,146].map((y) => <line key={y} x1="24" x2="468" y1={y} y2={y} className="dashboard-chart-grid"/>)}<polygon points={`24,146 ${chart("open")} 468,146`} fill="url(#open-area)"/><polygon points={`24,146 ${chart("done")} 468,146`} fill="url(#done-area)"/><polyline points={chart("open")} className="dashboard-line-open"/><polyline points={chart("done")} className="dashboard-line-done"/>{days.map((d,i)=><text key={d.key} x={24+i*74} y="172" textAnchor="middle" className="dashboard-axis-label">{d.label}</text>)}</svg></div>;
}

function PriorityChart({ tasks }: { tasks: TeamTask[] }) {
  const values = PRIORITIES.map((priority) => ({ priority, count: tasks.filter((task) => task.priority === priority).length })); const max = Math.max(...values.map((v) => v.count), 1);
  return <div className="dashboard-priority-chart">{values.map(({ priority, count }) => <div className="priority-bar-row" key={priority}><div><span>{priorityLabel[priority]}</span><strong>{count}</strong></div><div className="priority-bar-track"><span style={{ height: `${Math.max((count / max) * 100, count ? 12 : 2)}%`, backgroundColor: PRIORITY_COLORS[priority] }} /></div></div>)}</div>;
}

function RecentTasks({ tasks, users, today }: { tasks: TeamTask[]; users: { id: string; name: string }[]; today: string }) {
  return <div className="dashboard-table-wrap"><table className="dashboard-task-table"><thead><tr><th>Tarefa</th><th>Responsável</th><th>Status</th><th>Prazo</th></tr></thead><tbody>{tasks.map((task) => <tr key={task.id}><td><Link to={`/app/tarefas/${task.id}`}>{task.title}</Link><span>{priorityLabel[task.priority]}</span></td><td>{users.find((u) => u.id === task.assignedToId)?.name ?? "Sem responsável"}</td><td><span className={`dashboard-table-status ${statusTone[task.status]}`}>{statusLabel[task.status]}</span></td><td className={task.dueDate < today && task.status !== "DONE" ? "is-overdue" : ""}>{formatDate(task.dueDate)}</td></tr>)}</tbody></table>{!tasks.length ? <p className="dashboard-table-empty">Nenhuma tarefa registrada.</p> : null}</div>;
}

function TeamList({ team }: { team: { user: { id: string; name: string; position: string }; open: number }[] }) { return <div className="dashboard-team-list">{team.slice(0, 5).map(({ user, open }) => <Link to="/app/usuarios" key={user.id} className="dashboard-team-row"><span className="dashboard-team-avatar">{initials(user.name)}</span><span><strong>{user.name}</strong><small>{user.position}</small></span><b>{open} {open === 1 ? "tarefa" : "tarefas"}</b></Link>)}</div>; }

function sparkValues(tasks: TeamTask[], mode: "active" | "overdue" | "done" | "routine") { const today = new Date(); return Array.from({ length: 7 }, (_, i) => { const date = new Date(today); date.setDate(today.getDate() - 6 + i); const key = localDateKey(date); if (mode === "done") return tasks.filter((t) => t.status === "DONE" && t.updatedAt.slice(0,10) <= key).length; if (mode === "overdue") return tasks.filter((t) => !["DONE","CANCELLED"].includes(t.status) && t.dueDate < key).length; if (mode === "routine") return (i + tasks.length) % 4; return tasks.filter((t) => t.createdAt.slice(0,10) <= key && !["DONE","CANCELLED"].includes(t.status)).length; }); }
function operationSummary(active: number, overdue: number) { return overdue ? `${active} abertas, ${overdue} fora do prazo` : `${active} tarefas abertas, nenhuma atrasada`; }
function initials(name: string) { return name.split(" ").slice(0,2).map((p)=>p[0]).join("").toUpperCase(); }
function localDateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`; }
function formatLongDate(date: Date) { const value = new Intl.DateTimeFormat("pt-BR", { weekday:"long", day:"2-digit", month:"long" }).format(date); return value[0].toUpperCase()+value.slice(1); }
