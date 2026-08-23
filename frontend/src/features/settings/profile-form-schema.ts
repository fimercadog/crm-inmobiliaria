import { z } from "zod";

function emptyToUndefined(val: unknown) {
  return val === "" ? undefined : val;
}

export const profileFormSchema = z
  .object({
    name: z.string().min(1, "El nombre es obligatorio").max(255),
    email: z.string().min(1, "El correo es obligatorio").email("Correo inválido"),
    password: z.preprocess(
      emptyToUndefined,
      z.string().min(8, "La contraseña debe tener al menos 8 caracteres").optional(),
    ),
    current_password: z.preprocess(emptyToUndefined, z.string().optional()),
  })
  .refine((data) => !data.password || data.current_password, {
    message: "Ingresa tu contraseña actual para poder cambiarla",
    path: ["current_password"],
  });

export type ProfileFormInput = z.input<typeof profileFormSchema>;
export type ProfileFormOutput = z.output<typeof profileFormSchema>;
