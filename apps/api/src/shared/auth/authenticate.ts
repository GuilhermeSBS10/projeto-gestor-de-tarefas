import type { NextFunction, Request, Response } from "express";
import { AppError } from "../http/app-error";
import { verifyAccessToken, type AuthUser } from "./jwt";

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

export function authenticate(request: Request, _response: Response, next: NextFunction) {
  const [, token] = request.headers.authorization?.split(" ") ?? [];

  if (!token) {
    throw new AppError("Token nao informado", 401);
  }

  request.user = verifyAccessToken(token);
  next();
}

