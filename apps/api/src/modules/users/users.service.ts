import bcrypt from "bcryptjs";
import type { z } from "zod";
import type { createUserSchema, updateUserSchema } from "@gestor/shared";
import { AppError } from "../../shared/http/app-error";
import { prisma } from "../../shared/prisma";

type CreateUserInput = z.infer<typeof createUserSchema>;
type UpdateUserInput = z.infer<typeof updateUserSchema>;

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  active: true,
  role: true,
  createdAt: true,
  updatedAt: true
};

export class UsersService {
  async list() {
    return prisma.user.findMany({
      select: safeUserSelect,
      orderBy: { name: "asc" }
    });
  }

  async create(input: CreateUserInput) {
    const passwordHash = await bcrypt.hash(input.password, 12);

    return prisma.user.create({
      data: { name: input.name, email: input.email, passwordHash, roleId: input.roleId },
      select: safeUserSelect
    });
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({ where: { id }, select: safeUserSelect });
    if (!user) throw new AppError("Usuario nao encontrado", 404);
    return user;
  }

  async update(id: string, input: UpdateUserInput) {
    await this.findById(id);

    return prisma.user.update({
      where: { id },
      data: input,
      select: safeUserSelect
    });
  }

  async deactivate(id: string) {
    await this.findById(id);
    await prisma.user.update({ where: { id }, data: { active: false } });
  }
}

