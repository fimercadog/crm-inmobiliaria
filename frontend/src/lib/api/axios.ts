import axios from "axios";
import { ApiError } from "@/types/api";

const TOKEN_STORAGE_KEY = "crm_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      const body = error.response?.data as
        | { message?: string; errors?: Record<string, string[]> }
        | undefined;

      if (status === 401) {
        setStoredToken(null);
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- outside React tree, useRouter is unavailable here
          window.location.href = "/login";
        }
      }

      return Promise.reject(
        new ApiError(
          body?.message ?? "No fue posible completar la operación",
          status,
          body?.errors ?? null,
        ),
      );
    }

    return Promise.reject(error);
  },
);
