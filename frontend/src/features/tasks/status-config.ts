import type { StatusConfig } from "@/components/shared/status-badge";
import { TASK_STATUS_LABELS, type TaskStatusValue } from "@/types/task";

export const TASK_STATUS_CONFIG: Record<TaskStatusValue, StatusConfig> = {
  pendiente: { label: TASK_STATUS_LABELS.pendiente, tone: "outline" },
  en_progreso: { label: TASK_STATUS_LABELS.en_progreso, tone: "warning" },
  completada: { label: TASK_STATUS_LABELS.completada, tone: "success" },
  cancelada: { label: TASK_STATUS_LABELS.cancelada, tone: "destructive" },
};
