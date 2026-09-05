import { z } from "zod";
import { LEAD_SOURCES, LEAD_STATUSES } from "@/types/lead";

function emptyToUndefined(val: unknown) {
  return val === "" ? undefined : val;
}

export const leadFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(255),
  phone: z.string().max(50).optional(),
  email: z.preprocess(emptyToUndefined, z.string().email("Correo inválido").max(255).optional()),
  source: z.enum(LEAD_SOURCES, { message: "Selecciona un origen" }),
  status: z.enum(LEAD_STATUSES, { message: "Selecciona un estado" }),
  notes: z.string().optional(),
});

export type LeadFormSchema = z.infer<typeof leadFormSchema>;
export type LeadFormInput = z.input<typeof leadFormSchema>;
export type LeadFormOutput = z.output<typeof leadFormSchema>;
