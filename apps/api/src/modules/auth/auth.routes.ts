import { Router } from "express";
import { loginSchema } from "@gestor/shared";
import { asyncHandler } from "../../shared/http/async-handler";
import { AuthService } from "./auth.service";

export const authRouter = Router();
const service = new AuthService();

authRouter.post(
  "/login",
  asyncHandler(async (request, response) => {
    const input = loginSchema.parse(request.body);
    response.json(await service.login(input));
  })
);

authRouter.post("/refresh", (_request, response) => {
  response.status(501).json({ message: "Refresh token sera implementado na proxima etapa" });
});

authRouter.post("/logout", (_request, response) => {
  response.status(204).send();
});

