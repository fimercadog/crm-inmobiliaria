import { z } from "zod";
import { OWNER_STATUSES } from "@/types/owner";

export const ownerFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(255),
  document: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(OWNER_STATUSES, { message: "Selecciona un estado" }),
});

export type OwnerFormSchema = z.infer<typeof ownerFormSchema>;
