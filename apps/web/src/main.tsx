import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppLayout } from "./ui/app-layout";
import { RequireAuth, StoreProvider } from "./lib/store";
import { DashboardPage } from "./pages/dashboard";
import { LandingPage } from "./pages/landing";
import { LoginPage } from "./pages/login";
import { RolesPage } from "./pages/roles";
import { RoutinePage } from "./pages/routine";
import { TaskDetailPage } from "./pages/task-detail";
import { TasksPage } from "./pages/tasks";
import { UsersPage } from "./pages/users";
import "./styles.css";

const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  {
    path: "/app",
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "rotina", element: <RoutinePage /> },
      { path: "tarefas", element: <TasksPage /> },
      { path: "tarefas/:id", element: <TaskDetailPage /> },
      { path: "usuarios", element: <UsersPage /> },
      { path: "cargos", element: <RolesPage /> }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StoreProvider>
      <RouterProvider router={router} />
    </StoreProvider>
  </React.StrictMode>
);
