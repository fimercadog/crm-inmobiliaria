import { api } from "@/lib/api/axios";
import type { ApiSuccessResponse } from "@/types/api";
import type { AuthUser } from "@/store/slices/authSlice";

interface LoginResponse {
  user: AuthUser;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await api.post<ApiSuccessResponse<LoginResponse>>("/auth/login", { email, password });
  return response.data.data;
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const response = await api.get<ApiSuccessResponse<AuthUser>>("/auth/me");
  return response.data.data;
}

export interface UpdateProfileValues {
  name: string;
  email: string;
  password?: string;
  current_password?: string;
}

export async function updateProfile(values: UpdateProfileValues): Promise<AuthUser> {
  const response = await api.put<ApiSuccessResponse<AuthUser>>("/auth/profile", values);
  return response.data.data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post("/auth/forgot-password", { email });
}

export async function resetPassword(email: string, token: string, password: string): Promise<void> {
  await api.post("/auth/reset-password", { email, token, password });
}
