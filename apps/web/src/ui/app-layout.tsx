import { CalendarCheck2, CheckSquare, Home, LogOut, Moon, Shield, Sun, Users } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useStore } from "../lib/store";

const nav = [
  { to: "/app", label: "Inicio", icon: Home },
  { to: "/app/rotina", label: "Rotina", icon: CalendarCheck2 },
  { to: "/app/tarefas", label: "Tarefas", icon: CheckSquare },
  { to: "/app/usuarios", label: "Equipe", icon: Users },
  { to: "/app/cargos", label: "Acesso", icon: Shield }
];

export function AppLayout() {
  const { currentUser, logout, can, theme, toggleTheme } = useStore();
  const visibleNav = nav.filter((item) => item.to !== "/cargos" || can("USER_VIEW"));

  return (
    <div className="min-h-screen bg-[#f6f7fb] pb-20 text-slate-950 lg:grid lg:grid-cols-[280px_1fr] lg:pb-0">
      <aside className="hidden border-r border-slate-200 bg-white lg:block">
        <div className="p-5">
          <div className="flex items-center gap-3">
            <img src="/brand/logo-symbol-transparent.png" alt="TaskFlow" className="h-16 w-16 object-contain" />
            <div>
              <p className="font-black tracking-tight">TaskFlow</p>
              <p className="text-xs font-semibold text-slate-500">Equipe conectada</p>
            </div>
          </div>
        </div>
        <nav className="space-y-1 px-3">
          {visibleNav.map((item) => <NavItem key={item.to} {...item} />)}
        </nav>
      </aside>

      <div>
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <img src="/brand/logo-symbol.jpeg" alt="" className="h-8 w-8 rounded-xl object-cover" />
                <p className="text-xs font-bold uppercase text-blue-700">TaskFlow</p>
              </div>
              <h1 className="text-lg font-black tracking-tight">Ola, {currentUser?.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 sm:inline">{currentUser?.role}</span>
              <button onClick={toggleTheme} className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" title="Alternar tema">
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={logout} className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-4 lg:px-6 lg:py-6">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-slate-200 bg-white px-2 py-2 lg:hidden">
        {visibleNav.slice(0, 4).map((item) => <MobileNavItem key={item.to} {...item} />)}
      </nav>
    </div>
  );
}

function NavItem({ to, label, icon: Icon }: (typeof nav)[number]) {
  return (
    <NavLink to={to} end={to === "/app"} className={({ isActive }) => `flex h-12 items-center gap-3 rounded-2xl px-4 text-sm font-bold ${isActive ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
      <Icon size={19} />
      {label}
    </NavLink>
  );
}

function MobileNavItem({ to, label, icon: Icon }: (typeof nav)[number]) {
  return (
    <NavLink to={to} end={to === "/app"} className={({ isActive }) => `flex flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-[11px] font-bold ${isActive ? "bg-slate-950 text-white" : "text-slate-500"}`}>
      <Icon size={18} />
      {label}
    </NavLink>
  );
}
