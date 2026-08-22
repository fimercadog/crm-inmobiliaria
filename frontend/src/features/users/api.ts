import { api } from "@/lib/api/axios";
import type { ApiSuccessResponse } from "@/types/api";
import type { CrmUser, UserCreateValues, UserUpdateValues } from "@/types/user";

export async function createUser(values: UserCreateValues): Promise<CrmUser> {
  const response = await api.post<ApiSuccessResponse<CrmUser>>("/users", values);
  return response.data.data;
}

export async function updateUser(id: number, values: UserUpdateValues): Promise<CrmUser> {
  const response = await api.put<ApiSuccessResponse<CrmUser>>(`/users/${id}`, values);
  return response.data.data;
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/users/${id}`);
}

export async function fetchUser(id: number): Promise<CrmUser> {
  const response = await api.get<ApiSuccessResponse<CrmUser>>(`/users/${id}`);
  return response.data.data;
}
