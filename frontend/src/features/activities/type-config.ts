import type { StatusConfig } from "@/components/shared/status-badge";
import { ACTIVITY_TYPE_LABELS, type ActivityTypeValue } from "@/types/activity";

export const ACTIVITY_TYPE_CONFIG: Record<ActivityTypeValue, StatusConfig> = {
  llamada: { label: ACTIVITY_TYPE_LABELS.llamada, tone: "default" },
  whatsapp: { label: ACTIVITY_TYPE_LABELS.whatsapp, tone: "success" },
  correo: { label: ACTIVITY_TYPE_LABELS.correo, tone: "secondary" },
  reunion: { label: ACTIVITY_TYPE_LABELS.reunion, tone: "warning" },
  nota: { label: ACTIVITY_TYPE_LABELS.nota, tone: "outline" },
  seguimiento: { label: ACTIVITY_TYPE_LABELS.seguimiento, tone: "outline" },
};
