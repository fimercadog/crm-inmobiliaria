import { z } from "zod";
import { USER_ROLES } from "@/types/user";

function emptyToUndefined(val: unknown) {
  return val === "" ? undefined : val;
}

export const createUserFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(255),
  email: z.string().min(1, "El correo es obligatorio").email("Correo inválido").max(255),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  role: z.enum(USER_ROLES, { message: "Selecciona un rol" }),
});

export const editUserFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(255),
  email: z.string().min(1, "El correo es obligatorio").email("Correo inválido").max(255),
  password: z.preprocess(
    emptyToUndefined,
    z.string().min(8, "La contraseña debe tener al menos 8 caracteres").optional(),
  ),
  role: z.enum(USER_ROLES, { message: "Selecciona un rol" }),
});

export type CreateUserFormInput = z.input<typeof createUserFormSchema>;
export type CreateUserFormOutput = z.output<typeof createUserFormSchema>;
export type EditUserFormInput = z.input<typeof editUserFormSchema>;
export type EditUserFormOutput = z.output<typeof editUserFormSchema>;
