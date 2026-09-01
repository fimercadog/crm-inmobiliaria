"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/axios";
import { ApiError } from "@/types/api";
import type { ApiSuccessResponse } from "@/types/api";

/** Same fetch-on-mount pattern as ReportCard, reused by the dashboard charts. */
export function useReportRows<T>(endpoint: string) {
  const [rows, setRows] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    api
      .get<ApiSuccessResponse<T[]>>(endpoint)
      .then((response) => {
        if (!ignore) setRows(response.data.data);
      })
      .catch((err: unknown) => {
        if (!ignore) setError(err instanceof ApiError ? err.message : "No fue posible cargar el gráfico");
      });

    return () => {
      ignore = true;
    };
  }, [endpoint]);

  return { rows, error };
}
