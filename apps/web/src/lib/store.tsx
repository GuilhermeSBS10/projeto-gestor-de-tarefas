import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { Permission, TaskPriority, TaskStatus } from "@gestor/shared";

type RoleName = "Administrador" | "Gestor" | "Usuario";

export type TeamUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: RoleName;
  position: string;
  focus: string;
  managerIds: string[];
  active: boolean;
};

export type TaskComment = {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
};

export type TaskHistory = {
  id: string;
  userId: string;
  action: string;
  createdAt: string;
};

export type TeamTask = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdById: string;
  assignedToId: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  comments: TaskComment[];
  history: TaskHistory[];
};

export type RoutineFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

export type RoutineTask = {
  id: string;
  title: string;
  description: string;
  frequency: RoutineFrequency;
  assignedToId: string;
  createdById: string;
  weeklyDay?: number;
  monthlyDay?: number;
  active: boolean;
  completions: Record<string, string>;
  createdAt: string;
};

type StoreState = {
  currentUserId: string | null;
  theme: "light" | "dark";
  users: TeamUser[];
  tasks: TeamTask[];
  routines: RoutineTask[];
};

type StoreContextValue = {
  currentUser: TeamUser | null;
  theme: "light" | "dark";
  users: TeamUser[];
  assignableUsers: TeamUser[];
  tasks: TeamTask[];
  routines: RoutineTask[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  can: (permission: Permission) => boolean;
  canAssignToUser: (userId: string) => boolean;
  createTask: (input: Pick<TeamTask, "title" | "description" | "priority" | "assignedToId" | "dueDate">) => void;
  updateTask: (id: string, input: Partial<Pick<TeamTask, "title" | "description" | "priority" | "status" | "assignedToId" | "dueDate">>) => void;
  deleteTask: (id: string) => void;
  addComment: (taskId: string, content: string) => void;
  createUser: (input: Omit<TeamUser, "id" | "active" | "managerIds"> & { managerIds?: string[] }) => void;
  updateUser: (id: string, input: Partial<Omit<TeamUser, "id">>) => void;
  deactivateUser: (id: string) => void;
  deleteUser: (id: string) => void;
  createRoutine: (input: Pick<RoutineTask, "title" | "description" | "frequency" | "assignedToId" | "weeklyDay" | "monthlyDay">) => void;
  updateRoutine: (id: string, input: Partial<Pick<RoutineTask, "title" | "description" | "frequency" | "assignedToId" | "weeklyDay" | "monthlyDay">>) => void;
  toggleRoutine: (id: string, dateKey: string) => void;
  deactivateRoutine: (id: string) => void;
  toggleTheme: () => void;
};

const STORAGE_KEY = "taskflow.front.v1";

const rolePermissions: Record<RoleName, Permission[]> = {
  Administrador: [
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
  ],
  Gestor: ["USER_VIEW", "TASK_VIEW_ALL", "TASK_CREATE", "TASK_CREATE_FOR_OTHERS", "TASK_UPDATE", "TASK_ASSIGN", "TASK_COMPLETE"],
  Usuario: ["TASK_VIEW_ALL", "TASK_CREATE", "TASK_COMPLETE"]
};

const initialUsers: TeamUser[] = [
  {
    id: "u-thayce",
    name: "Thayce",
    email: "thayce@empresa.com",
    password: "G123456789",
    role: "Gestor",
    position: "Gestora/Gerente",
    focus: "Gestao geral do financeiro",
    managerIds: [],
    active: true
  },
  {
    id: "u-forti",
    name: "Mateus Forti",
    email: "forti@empresa.com",
    password: "G123456789",
    role: "Gestor",
    position: "Analista",
    focus: "Contas a pagar",
    managerIds: ["u-thayce"],
    active: true
  },
  {
    id: "u-admin",
    name: "Guilherme",
    email: "guisbs68@gmail.com",
    password: "G123456789",
    role: "Administrador",
    position: "Programador e estagiario financeiro",
    focus: "Auxiliar de Forti",
    managerIds: ["u-forti", "u-renata", "u-thayce"],
    active: true
  },
  {
    id: "u-renata",
    name: "Renata Calazans",
    email: "renata@empresa.com",
    password: "G123456789",
    role: "Gestor",
    position: "Analista",
    focus: "Contas a receber",
    managerIds: ["u-thayce"],
    active: true
  },
  {
    id: "u-pedro",
    name: "Pedro",
    email: "pedro@empresa.com",
    password: "G123456789",
    role: "Usuario",
    position: "Estagiario da contabilidade",
    focus: "Apoio contabil",
    managerIds: ["u-forti", "u-renata", "u-thayce"],
    active: true
  }
];

const now = new Date().toISOString();

const initialTasks: TeamTask[] = [
  {
    id: "t-1",
    title: "Organizar tarefas da equipe",
    description: "Definir responsaveis, prioridades e prazos do ciclo atual.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    createdById: "u-admin",
    assignedToId: "u-thayce",
    dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    createdAt: now,
    updatedAt: now,
    comments: [],
    history: [{ id: "h-1", userId: "u-admin", action: "Tarefa criada", createdAt: now }]
  },
  {
    id: "t-2",
    title: "Conferir pendencias operacionais",
    description: "Revisar o que esta atrasado e atualizar o andamento.",
    status: "TODO",
    priority: "URGENT",
    createdById: "u-forti",
    assignedToId: "u-pedro",
    dueDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    createdAt: now,
    updatedAt: now,
    comments: [],
    history: [{ id: "h-2", userId: "u-gestor", action: "Tarefa criada", createdAt: now }]
  }
];

const initialRoutines: RoutineTask[] = [
  {
    id: "r-1",
    title: "Abrir caixa e conferir pendencias",
    description: "Checar tarefas urgentes e avisos antes do inicio do trabalho.",
    frequency: "DAILY",
    assignedToId: "u-admin",
    createdById: "u-admin",
    active: true,
    completions: {},
    createdAt: now
  },
  {
    id: "r-2",
    title: "Fechamento mensal das atividades",
    description: "Revisar tarefas concluidas e pendencias do mes.",
    frequency: "MONTHLY",
    monthlyDay: 1,
    assignedToId: "u-thayce",
    createdById: "u-admin",
    active: true,
    completions: {},
    createdAt: now
  },
  {
    id: "r-3",
    title: "Revisao semanal de pendencias",
    description: "Separar pendencias que precisam de apoio do time.",
    frequency: "WEEKLY",
    weeklyDay: 1,
    assignedToId: "u-forti",
    createdById: "u-thayce",
    active: true,
    completions: {},
    createdAt: now
  }
];

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoreState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) as Partial<StoreState> : null;
    const users = mergeInitialUsers(parsed?.users ?? initialUsers);
    return {
      currentUserId: parsed?.currentUserId ?? null,
      theme: parsed?.theme ?? "light",
      users,
      tasks: parsed?.tasks ?? initialTasks,
      routines: parsed?.routines ?? initialRoutines
    };
  });

  function save(next: StoreState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setState(next);
  }

  const currentUser = state.users.find((user) => user.id === state.currentUserId) ?? null;
  const canAssignTo = (userId: string) => canAssignToUser(currentUser, state.users.find((user) => user.id === userId));
  const assignableUsers = state.users.filter((user) => user.active && canAssignTo(user.id));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.theme === "dark");
  }, [state.theme]);

  const value = useMemo<StoreContextValue>(() => ({
    currentUser,
    theme: state.theme,
    users: state.users,
    assignableUsers,
    tasks: state.tasks,
    routines: state.routines,
    login(email, password) {
      const user = state.users.find((item) => item.email === email && item.password === password && item.active);
      if (!user) return false;
      save({ ...state, currentUserId: user.id });
      return true;
    },
    logout() {
      save({ ...state, currentUserId: null });
    },
    can(permission) {
      return Boolean(currentUser && rolePermissions[currentUser.role].includes(permission));
    },
    canAssignToUser(userId) {
      return canAssignTo(userId);
    },
    createTask(input) {
      if (!currentUser) return;
      if (!canAssignTo(input.assignedToId)) return;
      const task: TeamTask = {
        id: crypto.randomUUID(),
        ...input,
        status: "TODO",
        createdById: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: [],
        history: [{ id: crypto.randomUUID(), userId: currentUser.id, action: "Tarefa criada", createdAt: new Date().toISOString() }]
      };
      save({ ...state, tasks: [task, ...state.tasks] });
    },
    updateTask(id, input) {
      if (!currentUser) return;
      if (input.assignedToId && !canAssignTo(input.assignedToId)) return;
      save({
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === id
            ? {
                ...task,
                ...input,
                updatedAt: new Date().toISOString(),
                history: [{ id: crypto.randomUUID(), userId: currentUser.id, action: "Tarefa atualizada", createdAt: new Date().toISOString() }, ...task.history]
              }
            : task
        )
      });
    },
    deleteTask(id) {
      save({ ...state, tasks: state.tasks.filter((task) => task.id !== id) });
    },
    addComment(taskId, content) {
      if (!currentUser) return;
      save({
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? { ...task, comments: [{ id: crypto.randomUUID(), userId: currentUser.id, content, createdAt: new Date().toISOString() }, ...task.comments] }
            : task
        )
      });
    },
    createUser(input) {
      save({ ...state, users: [{ id: crypto.randomUUID(), active: true, managerIds: [], ...input }, ...state.users] });
    },
    updateUser(id, input) {
      save({ ...state, users: state.users.map((user) => user.id === id ? { ...user, ...input } : user) });
    },
    deactivateUser(id) {
      save({ ...state, users: state.users.map((user) => user.id === id ? { ...user, active: false } : user) });
    },
    deleteUser(id) {
      if (id === state.currentUserId) return;
      save({
        ...state,
        users: state.users.filter((user) => user.id !== id),
        tasks: state.tasks.filter((task) => task.assignedToId !== id && task.createdById !== id),
        routines: state.routines.filter((routine) => routine.assignedToId !== id && routine.createdById !== id)
      });
    },
    createRoutine(input) {
      if (!currentUser) return;
      if (!canAssignTo(input.assignedToId)) return;
      const routine: RoutineTask = {
        id: crypto.randomUUID(),
        ...input,
        createdById: currentUser.id,
        active: true,
        completions: {},
        createdAt: new Date().toISOString()
      };
      save({ ...state, routines: [routine, ...state.routines] });
    },
    updateRoutine(id, input) {
      if (input.assignedToId && !canAssignTo(input.assignedToId)) return;
      save({ ...state, routines: state.routines.map((routine) => routine.id === id ? { ...routine, ...input } : routine) });
    },
    toggleRoutine(id, dateKey) {
      if (!currentUser) return;
      save({
        ...state,
        routines: state.routines.map((routine) => {
          if (routine.id !== id) return routine;
          const completions = { ...routine.completions };
          if (completions[dateKey]) {
            delete completions[dateKey];
          } else {
            completions[dateKey] = currentUser.id;
          }
          return { ...routine, completions };
        })
      });
    },
    deactivateRoutine(id) {
      save({ ...state, routines: state.routines.map((routine) => routine.id === id ? { ...routine, active: false } : routine) });
    },
    toggleTheme() {
      save({ ...state, theme: state.theme === "dark" ? "light" : "dark" });
    }
  }), [currentUser, state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore deve ser usado dentro de StoreProvider");
  return context;
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { currentUser } = useStore();
  const location = useLocation();
  if (!currentUser) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

export const formatDate = (value?: string) => {
  if (!value) return "Sem prazo";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(`${value}T12:00:00`));
};

export const todayKey = () => new Date().toISOString().slice(0, 10);

export function routineIsDue(routine: RoutineTask, dateKey = todayKey()) {
  const date = new Date(`${dateKey}T12:00:00`);
  const weekday = date.getDay();
  if (!routine.active) return false;
  if (routine.frequency === "DAILY") return weekday !== 0 && weekday !== 6;
  if (routine.frequency === "WEEKLY") return weekday === (routine.weeklyDay ?? 1);
  return date.getDate() === (routine.monthlyDay ?? 1);
}

function canAssignToUser(currentUser: TeamUser | null, targetUser?: TeamUser) {
  if (!currentUser || !targetUser || !targetUser.active) return false;
  if (currentUser.role === "Administrador") return true;
  if (targetUser.id === currentUser.id) return true;
  return targetUser.managerIds.includes(currentUser.id);
}

function mergeInitialUsers(savedUsers: TeamUser[]) {
  const savedByEmail = new Map(savedUsers.map((user) => [user.email, user]));
  const merged = initialUsers.map((user) => ({
    ...user,
    ...(savedByEmail.get(user.email) ?? {}),
    position: user.position,
    focus: user.focus,
    managerIds: user.managerIds,
    role: user.role
  }));

  const extraUsers = savedUsers.filter((user) => !initialUsers.some((initialUser) => initialUser.email === user.email));
  return [
    ...merged,
    ...extraUsers.map((user) => ({
      ...user,
      position: user.position ?? user.role,
      focus: user.focus ?? "A definir",
      managerIds: user.managerIds ?? []
    }))
  ];
}
