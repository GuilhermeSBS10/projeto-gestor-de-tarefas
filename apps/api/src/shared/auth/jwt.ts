import jwt from "jsonwebtoken";
import type { Permission } from "@gestor/shared";

export type AuthUser = {
  id: string;
  role: string;
  permissions: Permission[];
};

export function signAccessToken(user: AuthUser) {
  return jwt.sign(user, process.env.JWT_ACCESS_SECRET ?? "dev-access", {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ?? "8h") as jwt.SignOptions["expiresIn"]
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET ?? "dev-access") as AuthUser;
}
