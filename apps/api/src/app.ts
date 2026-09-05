import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { authRouter } from "./modules/auth/auth.routes";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes";
import { rolesRouter } from "./modules/roles/roles.routes";
import { tasksRouter } from "./modules/tasks/tasks.routes";
import { usersRouter } from "./modules/users/users.routes";
import { errorHandler } from "./shared/http/error-handler";

export const app = express();

const allowedOrigins = (process.env.WEB_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1):517\d$/.test(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origem nao permitida pelo CORS"));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));

app.use(
  "/auth/login",
  rateLimit({
    windowMs: 60_000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/roles", rolesRouter);
app.use("/tasks", tasksRouter);
app.use("/dashboard", dashboardRouter);
app.use(errorHandler);
