import { Router } from "express";
import { createTaskCommentSchema, createTaskSchema, taskFiltersSchema, updateTaskSchema } from "@gestor/shared";
import { authenticate } from "../../shared/auth/authenticate";
import { authorize } from "../../shared/auth/authorize";
import { asyncHandler } from "../../shared/http/async-handler";
import { requiredParam } from "../../shared/http/params";
import { TasksService } from "./tasks.service";

export const tasksRouter = Router();
const service = new TasksService();

tasksRouter.use(authenticate);

tasksRouter.get(
  "/",
  authorize("TASK_VIEW_ALL"),
  asyncHandler(async (request, response) => {
    response.json(await service.list(taskFiltersSchema.parse(request.query)));
  })
);

tasksRouter.post(
  "/",
  authorize("TASK_CREATE"),
  asyncHandler(async (request, response) => {
    response.status(201).json(await service.create(request.user!, createTaskSchema.parse(request.body)));
  })
);

tasksRouter.get(
  "/:id",
  authorize("TASK_VIEW_ALL"),
  asyncHandler(async (request, response) => {
    response.json(await service.findById(requiredParam(request.params.id, "id")));
  })
);

tasksRouter.patch(
  "/:id",
  authorize("TASK_COMPLETE"),
  asyncHandler(async (request, response) => {
    response.json(await service.update(request.user!, requiredParam(request.params.id, "id"), updateTaskSchema.parse(request.body)));
  })
);

tasksRouter.delete(
  "/:id",
  authorize("TASK_DELETE"),
  asyncHandler(async (request, response) => {
    await service.remove(request.user!, requiredParam(request.params.id, "id"));
    response.status(204).send();
  })
);

tasksRouter.get(
  "/:id/history",
  authorize("TASK_VIEW_ALL"),
  asyncHandler(async (request, response) => {
    response.json(await service.history(requiredParam(request.params.id, "id")));
  })
);

tasksRouter.post(
  "/:id/comments",
  authorize("TASK_COMPLETE"),
  asyncHandler(async (request, response) => {
    response
      .status(201)
      .json(await service.comment(request.user!, requiredParam(request.params.id, "id"), createTaskCommentSchema.parse(request.body)));
  })
);
