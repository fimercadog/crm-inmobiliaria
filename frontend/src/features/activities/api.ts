import { api } from "@/lib/api/axios";
import type { ApiSuccessResponse } from "@/types/api";
import type { Activity } from "@/types/activity";
import type { ActivityFormOutput } from "@/features/activities/activity-form-schema";

export async function createActivity(values: ActivityFormOutput): Promise<Activity> {
  const response = await api.post<ApiSuccessResponse<Activity>>("/activities", values);
  return response.data.data;
}

export async function updateActivity(id: number, values: ActivityFormOutput): Promise<Activity> {
  const response = await api.put<ApiSuccessResponse<Activity>>(`/activities/${id}`, values);
  return response.data.data;
}

export async function deleteActivity(id: number): Promise<void> {
  await api.delete(`/activities/${id}`);
}

export async function fetchActivity(id: number): Promise<Activity> {
  const response = await api.get<ApiSuccessResponse<Activity>>(`/activities/${id}`);
  return response.data.data;
}
