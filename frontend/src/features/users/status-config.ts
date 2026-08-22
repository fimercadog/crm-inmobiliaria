import type { StatusConfig } from "@/components/shared/status-badge";
import { USER_ROLE_LABELS, type UserRoleValue } from "@/types/user";

export const USER_ROLE_CONFIG: Record<UserRoleValue, StatusConfig> = {
  admin: { label: USER_ROLE_LABELS.admin, tone: "success" },
  agente: { label: USER_ROLE_LABELS.agente, tone: "default" },
  asistente: { label: USER_ROLE_LABELS.asistente, tone: "secondary" },
};
