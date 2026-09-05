import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "./app-error";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(422).json({ message: "Dados invalidos", issues: error.flatten() });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({ message: error.message });
    return;
  }

  console.error(error);
  response.status(500).json({
    message: "Erro interno",
    detail: process.env.NODE_ENV === "production" ? undefined : error instanceof Error ? error.message : String(error)
  });
};
