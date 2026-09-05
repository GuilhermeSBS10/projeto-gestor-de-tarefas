import { Router } from "express";
import { createUserSchema, updateUserSchema } from "@gestor/shared";
import { authenticate } from "../../shared/auth/authenticate";
import { authorize } from "../../shared/auth/authorize";
import { asyncHandler } from "../../shared/http/async-handler";
import { requiredParam } from "../../shared/http/params";
import { UsersService } from "./users.service";

export const usersRouter = Router();
const service = new UsersService();

usersRouter.use(authenticate);

usersRouter.get(
  "/",
  authorize("USER_VIEW"),
  asyncHandler(async (_request, response) => {
    response.json(await service.list());
  })
);

usersRouter.post(
  "/",
  authorize("USER_CREATE"),
  asyncHandler(async (request, response) => {
    response.status(201).json(await service.create(createUserSchema.parse(request.body)));
  })
);

usersRouter.get(
  "/:id",
  authorize("USER_VIEW"),
  asyncHandler(async (request, response) => {
    response.json(await service.findById(requiredParam(request.params.id, "id")));
  })
);

usersRouter.patch(
  "/:id",
  authorize("USER_UPDATE"),
  asyncHandler(async (request, response) => {
    response.json(await service.update(requiredParam(request.params.id, "id"), updateUserSchema.parse(request.body)));
  })
);

usersRouter.delete(
  "/:id",
  authorize("USER_DELETE"),
  asyncHandler(async (request, response) => {
    await service.deactivate(requiredParam(request.params.id, "id"));
    response.status(204).send();
  })
);
