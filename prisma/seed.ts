import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { permissions } from "../packages/shared/src/index";

const prisma = new PrismaClient();

const rolePermissions: Record<string, string[]> = {
  Administrador: [...permissions],
  Gestor: [...permissions],
  Distribuidor: [
    "TASK_VIEW_ALL",
    "TASK_CREATE",
    "TASK_CREATE_FOR_OTHERS",
    "TASK_ASSIGN",
    "TASK_COMPLETE"
  ],
  Usuario: ["TASK_VIEW_ALL", "TASK_CREATE", "TASK_COMPLETE"]
};

async function main() {
  await Promise.all(
    permissions.map((name) =>
      prisma.permission.upsert({
        where: { name },
        update: {},
        create: { name }
      })
    )
  );

  const roles = await Promise.all(
    Object.keys(rolePermissions).map((name) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: { name, description: `Perfil ${name}` }
      })
    )
  );

  for (const role of roles) {
    const granted = await prisma.permission.findMany({
      where: { name: { in: rolePermissions[role.name] } }
    });

    await Promise.all(
      granted.map((permission) =>
        prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
          update: {},
          create: { roleId: role.id, permissionId: permission.id }
        })
      )
    );
  }

  const passwordHash = await bcrypt.hash("Admin@123456", 12);
  const guilhermePasswordHash = await bcrypt.hash("G123456789", 12);
  const users = [
    ["Guilherme Admin", "admin@empresa.com", "Administrador"],
    ["Guilherme", "guisbs68@gmail.com", "Administrador"],
    ["Maria Gestora", "gestor@empresa.com", "Gestor"],
    ["Pedro Distribuidor", "distribuidor@empresa.com", "Distribuidor"],
    ["Joao Usuario", "usuario@empresa.com", "Usuario"]
  ] as const;

  for (const [name, email, roleName] of users) {
    const role = roles.find((item) => item.name === roleName);
    if (!role) throw new Error(`Role nao encontrada: ${roleName}`);

    await prisma.user.upsert({
      where: { email },
      update: email === "guisbs68@gmail.com" ? { passwordHash: guilhermePasswordHash, roleId: role.id, active: true } : {},
      create: { name, email, passwordHash: email === "guisbs68@gmail.com" ? guilhermePasswordHash : passwordHash, roleId: role.id }
    });
  }

  const [admin, gestor, distribuidor, usuario] = await prisma.user.findMany({
    orderBy: { email: "asc" }
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Revisar fluxo de autenticacao",
        description: "Validar login, refresh token e estados de erro.",
        createdById: admin.id,
        assignedToId: gestor.id,
        priority: "HIGH",
        status: "IN_PROGRESS",
        dueDate: new Date(Date.now() + 86400000)
      },
      {
        title: "Preparar lista de usuarios piloto",
        description: "Separar usuarios ativos para teste interno.",
        createdById: gestor.id,
        assignedToId: distribuidor.id,
        priority: "MEDIUM",
        status: "TODO"
      },
      {
        title: "Conferir historico de tarefas",
        description: "Garantir rastreabilidade das alteracoes principais.",
        createdById: distribuidor.id,
        assignedToId: usuario.id,
        priority: "URGENT",
        status: "TODO",
        dueDate: new Date(Date.now() - 86400000)
      }
    ],
    skipDuplicates: true
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
