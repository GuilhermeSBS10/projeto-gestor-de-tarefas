import { Router } from "express";
import { authenticate } from "../../shared/auth/authenticate";
import { authorize } from "../../shared/auth/authorize";
import { asyncHandler } from "../../shared/http/async-handler";
import { prisma } from "../../shared/prisma";

export const rolesRouter = Router();

rolesRouter.use(authenticate);

rolesRouter.get(
  "/",
  authorize("USER_VIEW"),
  asyncHandler(async (_request, response) => {
    response.json(
      await prisma.role.findMany({
        include: { permissions: { include: { permission: true } } },
        orderBy: { name: "asc" }
      })
    );
  })
);

