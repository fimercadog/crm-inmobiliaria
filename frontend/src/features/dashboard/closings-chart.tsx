"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { useReportRows } from "@/features/dashboard/use-report-rows";
import type { ClosingsByPeriodRow } from "@/types/report";

export function ClosingsChart() {
  const { rows, error } = useReportRows<ClosingsByPeriodRow>("/reports/closings-by-period");
  const hasData = rows?.some((row) => row.won_count > 0 || row.lost_count > 0) ?? false;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cierres por periodo</CardTitle>
        <CardDescription>Negocios ganados y perdidos en los últimos 6 meses.</CardDescription>
      </CardHeader>
      <CardContent>
        {rows === null && !error && <LoadingState rows={4} />}
        {error && <ErrorState description={error} />}
        {rows !== null && !error && !hasData && (
          <EmptyState title="Sin cierres recientes" description="Todavía no hay negocios ganados o perdidos en este periodo." />
        )}
        {rows !== null && !error && hasData && (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={rows} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} tickFormatter={(value: string) => value.split(" ")[0]} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {/* `fill` (for the Legend swatch color, recharts reads the
               * prop directly) + `style.fill` (for the bar itself, since a
               * CSS var doesn't resolve as a plain SVG attribute). */}
              <Bar dataKey="won_count" name="Ganados" fill="var(--chart-2)" style={{ fill: "var(--chart-2)" }} radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="lost_count" name="Perdidos" fill="var(--chart-4)" style={{ fill: "var(--chart-4)" }} radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
