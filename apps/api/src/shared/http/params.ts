import { AppError } from "./app-error";

export function requiredParam(value: string | string[] | undefined, name: string) {
  if (!value || Array.isArray(value)) {
    throw new AppError(`Parametro invalido: ${name}`, 400);
  }

  return value;
}

