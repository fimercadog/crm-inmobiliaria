import { z } from "zod";
import { ACTIVITY_TYPES } from "@/types/activity";

export const activityFormSchema = z.object({
  type: z.enum(ACTIVITY_TYPES, { message: "Selecciona un tipo" }),
  notes: z.string().min(1, "Las notas son obligatorias"),
  // See visit-form-schema.ts for why datetime-local values need this conversion:
  // they're timezone-naive, but the Laravel app timezone is UTC.
  occurred_at: z
    .string()
    .min(1, "La fecha es obligatoria")
    .transform((val) => new Date(val).toISOString()),
});

export type ActivityFormSchema = z.infer<typeof activityFormSchema>;
export type ActivityFormInput = z.input<typeof activityFormSchema>;
export type ActivityFormOutput = z.output<typeof activityFormSchema>;
