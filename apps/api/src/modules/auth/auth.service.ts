import bcrypt from "bcryptjs";
import type { z } from "zod";
import { permissions as allPermissions, type Permission, type loginSchema } from "@gestor/shared";
import { prisma } from "../../shared/prisma";
import { AppError } from "../../shared/http/app-error";
import { signAccessToken } from "../../shared/auth/jwt";

type LoginInput = z.infer<typeof loginSchema>;

export class AuthService {
  async login(input: LoginInput) {
    await this.bootstrapAdmin(input);

    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: { role: { include: { permissions: { include: { permission: true } } } } }
    });

    if (!user || !user.active) {
      throw new AppError("Credenciais invalidas", 401);
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new AppError("Credenciais invalidas", 401);
    }

    const permissions = user.role.permissions.map(({ permission }) => permission.name) as Permission[];
    const accessToken = signAccessToken({ id: user.id, role: user.role.name, permissions });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        permissions
      }
    };
  }

  private async bootstrapAdmin(input: LoginInput) {
    const email = process.env.BOOTSTRAP_ADMIN_EMAIL ?? "guisbs68@gmail.com";
    const password = process.env.BOOTSTRAP_ADMIN_PASSWORD ?? "G123456789";
    if (input.email !== email || input.password !== password) return;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return;

    await Promise.all(
      allPermissions.map((name) =>
        prisma.permission.upsert({
          where: { name },
          update: {},
          create: { name }
        })
      )
    );

    const role = await prisma.role.upsert({
      where: { name: "Administrador" },
      update: {},
      create: { name: "Administrador", description: "Perfil Administrador" }
    });

    await Promise.all(
      [
        { name: "Gestor", description: "Perfil Gestor" },
        { name: "Usuario", description: "Perfil Usuario" }
      ].map((item) =>
        prisma.role.upsert({
          where: { name: item.name },
          update: {},
          create: item
        })
      )
    );

    const granted = await prisma.permission.findMany();
    await Promise.all(
      granted.map((permission) =>
        prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
          update: {},
          create: { roleId: role.id, permissionId: permission.id }
        })
      )
    );

    await prisma.user.create({
      data: {
        name: "Guilherme",
        email,
        passwordHash: await bcrypt.hash(password, 12),
        roleId: role.id
      }
    });
  }
}
