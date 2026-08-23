"use client";

import { type ReactNode, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExportButtons } from "@/components/shared/export-buttons";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { api } from "@/lib/api/axios";
import { ApiError } from "@/types/api";
import type { ApiSuccessResponse } from "@/types/api";

export interface ReportColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  align?: "left" | "right";
}

interface ReportCardProps<T> {
  title: string;
  description: string;
  endpoint: string;
  fileBaseName: string;
  columns: ReportColumn<T>[];
}

export function ReportCard<T>({ title, description, endpoint, fileBaseName, columns }: ReportCardProps<T>) {
  const [rows, setRows] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let ignore = false;

    api
      .get<ApiSuccessResponse<T[]>>(endpoint)
      .then((response) => {
        if (!ignore) {
          setRows(response.data.data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) setError(err instanceof ApiError ? err.message : "No fue posible cargar el reporte");
      });

    return () => {
      ignore = true;
    };
  }, [endpoint, retryToken]);

  function handleRetry() {
    setRows(null);
    setError(null);
    setRetryToken((token) => token + 1);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <ExportButtons endpoint={endpoint} fileBaseName={fileBaseName} />
      </CardHeader>
      <CardContent>
        {rows === null && !error && <LoadingState rows={4} />}
        {error && <ErrorState description={error} onRetry={handleRetry} />}
        {rows !== null && !error && rows.length === 0 && (
          <EmptyState title="Sin datos para este reporte" description="Todavía no hay información suficiente." />
        )}
        {rows !== null && !error && rows.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key} className={column.align === "right" ? "text-right" : undefined}>
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.align === "right" ? "text-right" : undefined}>
                      {column.render
                        ? column.render(row)
                        : String((row as Record<string, unknown>)[column.key] ?? "—")}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
