import axios from "axios";
import { ApiError } from "@/types/api";

// The JWT lives only in the httpOnly cookie the backend sets on login — never
// in localStorage or any other place JS can read it. An XSS payload that ran
// on this page could read localStorage directly; it cannot read an httpOnly
// cookie. `withCredentials` is what makes the browser attach that cookie (and
// accept the Set-Cookie from login/refresh/logout) on every request, and the
// backend mirrors this with CORS `supports_credentials` + an explicit origin
// allowlist (required together — credentialed requests can't use `*`).
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
  timeout: 15000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
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
