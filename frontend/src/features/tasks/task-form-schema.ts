import { z } from "zod";
import { TASK_STATUSES } from "@/types/task";

export const taskFormSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(255),
  description: z.string().optional(),
  due_date: z.string().optional(),
  status: z.enum(TASK_STATUSES, { message: "Selecciona un estado" }),
});

export type TaskFormSchema = z.infer<typeof taskFormSchema>;
export type TaskFormOutput = z.output<typeof taskFormSchema>;
