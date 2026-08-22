import { api } from "@/lib/api/axios";
import type { ApiSuccessResponse } from "@/types/api";
import type { DashboardSummary } from "@/types/dashboard";

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const response = await api.get<ApiSuccessResponse<DashboardSummary>>("/dashboard/summary");
  return response.data.data;
}
