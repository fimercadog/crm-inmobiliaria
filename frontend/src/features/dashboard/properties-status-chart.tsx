"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { useReportRows } from "@/features/dashboard/use-report-rows";
import { PROPERTY_STATUS_LABELS, type PropertyStatusValue } from "@/types/property";
import type { PropertiesByStatusRow } from "@/types/report";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--muted-foreground)"];

function statusLabel(status: string): string {
  return PROPERTY_STATUS_LABELS[status as PropertyStatusValue] ?? status;
}

export function PropertiesStatusChart() {
  const { rows, error } = useReportRows<PropertiesByStatusRow>("/reports/properties-by-status");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Propiedades por estado</CardTitle>
        <CardDescription>Distribución del inventario actual.</CardDescription>
      </CardHeader>
      <CardContent>
        {rows === null && !error && <LoadingState rows={4} />}
        {error && <ErrorState description={error} />}
        {rows !== null && !error && rows.length === 0 && (
          <EmptyState title="Sin propiedades registradas" description="Aún no hay inventario para graficar." />
        )}
        {rows !== null && !error && rows.length > 0 && (
          <>
            <div className="relative">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={rows}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={2}
                    strokeWidth={0}
                    isAnimationActive={false}
                    label={({ value }: { value: number }) => value}
                    labelLine={false}
                  >
                    {rows.map((row, index) => (
                      <Cell key={row.status} style={{ fill: COLORS[index % COLORS.length] }} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, _name, entry) => [value, statusLabel(String((entry.payload as PropertiesByStatusRow).status))]}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-2xl font-semibold tabular-nums">{rows.reduce((sum, row) => sum + row.count, 0)}</p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              {rows.map((row, index) => (
                <div key={row.status} className="flex items-center gap-1.5">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  {statusLabel(row.status)} ({row.count})
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
