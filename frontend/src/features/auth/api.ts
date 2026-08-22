import { api } from "@/lib/api/axios";
import type { ApiSuccessResponse } from "@/types/api";
import type { AuthUser } from "@/store/slices/authSlice";

interface LoginResponse {
  token: string;
  type: string;
  expires_in: number;
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

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
