import type { StatusConfig } from "@/components/shared/status-badge";
import { LEAD_STATUS_LABELS, type LeadStatusValue } from "@/types/lead";

export const LEAD_STATUS_CONFIG: Record<LeadStatusValue, StatusConfig> = {
  nuevo: { label: LEAD_STATUS_LABELS.nuevo, tone: "outline" },
  contactado: { label: LEAD_STATUS_LABELS.contactado, tone: "default" },
  calificado: { label: LEAD_STATUS_LABELS.calificado, tone: "warning" },
  descartado: { label: LEAD_STATUS_LABELS.descartado, tone: "destructive" },
  convertido: { label: LEAD_STATUS_LABELS.convertido, tone: "success" },
};
