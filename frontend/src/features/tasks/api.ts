import { api } from "@/lib/api/axios";
import type { ApiSuccessResponse } from "@/types/api";
import type { Task } from "@/types/task";
import type { TaskFormOutput } from "@/features/tasks/task-form-schema";

export async function createTask(values: TaskFormOutput): Promise<Task> {
  const response = await api.post<ApiSuccessResponse<Task>>("/tasks", values);
  return response.data.data;
}

export async function updateTask(id: number, values: TaskFormOutput): Promise<Task> {
  const response = await api.put<ApiSuccessResponse<Task>>(`/tasks/${id}`, values);
  return response.data.data;
}

export async function deleteTask(id: number): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

export async function fetchTask(id: number): Promise<Task> {
  const response = await api.get<ApiSuccessResponse<Task>>(`/tasks/${id}`);
  return response.data.data;
}
