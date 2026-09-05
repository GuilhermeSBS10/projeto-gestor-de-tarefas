import type { Permission } from "@gestor/shared";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../http/app-error";

export function authorize(...required: Permission[]) {
  return (request: Request, _response: Response, next: NextFunction) => {
    const permissions = request.user?.permissions ?? [];
    const allowed = required.every((permission) => permissions.includes(permission));

    if (!allowed) {
      throw new AppError("Permissao insuficiente", 403);
    }

    next();
  };
}

