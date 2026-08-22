"use client";

import { useEffect, useState } from "react";
import { fetchDashboardSummary } from "@/features/dashboard/api";
import { ApiError } from "@/types/api";
import type { DashboardSummary } from "@/types/dashboard";

export function useDashboardSummary() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let ignore = false;

    fetchDashboardSummary()
      .then((data) => {
        if (!ignore) setSummary(data);
      })
      .catch((err: unknown) => {
        if (!ignore) setError(err instanceof ApiError ? err.message : "No fue posible cargar el dashboard");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [retryToken]);

  function retry() {
    setIsLoading(true);
    setError(null);
    setRetryToken((token) => token + 1);
  }

  return { summary, isLoading, error, retry };
}
