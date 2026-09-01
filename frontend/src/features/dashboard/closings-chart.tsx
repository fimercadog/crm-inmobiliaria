"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { useReportRows } from "@/features/dashboard/use-report-rows";
import { usePowerBiPalette } from "@/lib/chart-palette";
import type { ClosingsByPeriodRow } from "@/types/report";

const currencyFormatter = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

const chartConfig = {
  won_count: { label: "Ganados" },
  lost_count: { label: "Perdidos" },
} satisfies ChartConfig;

export function ClosingsChart() {
  const { rows, error } = useReportRows<ClosingsByPeriodRow>("/reports/closings-by-period");
  const palette = usePowerBiPalette();
  const hasData = rows?.some((row) => row.won_count > 0 || row.lost_count > 0) ?? false;
  const totalWon = rows?.reduce((sum, row) => sum + row.won_count, 0) ?? 0;
  const totalLost = rows?.reduce((sum, row) => sum + row.lost_count, 0) ?? 0;
  const totalWonValue = rows?.reduce((sum, row) => sum + row.won_value, 0) ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cierres por periodo</CardTitle>
        <CardDescription>
          {hasData
            ? `${totalWon} ganados · ${totalLost} perdidos · ${currencyFormatter.format(totalWonValue)} en negocios ganados`
            : "Negocios ganados y perdidos en los últimos 6 meses."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rows === null && !error && <LoadingState rows={4} />}
        {error && <ErrorState description={error} />}
        {rows !== null && !error && !hasData && (
          <EmptyState title="Sin cierres recientes" description="Todavía no hay negocios ganados o perdidos en este periodo." />
        )}
        {rows !== null && !error && hasData && (
          <>
            <ChartContainer config={chartConfig} className="aspect-auto h-60 w-full">
              <BarChart data={rows} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  tickFormatter={(value: string) => value.split(" ")[0]}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                />
                <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} allowDecimals={false} axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                {/* Literal hex from the shuffled palette — works directly as
                 * `fill`, no CSS-var-in-SVG-attribute workaround needed. */}
                <Bar dataKey="won_count" name="Ganados" fill={palette[0]} radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  <LabelList dataKey="won_count" position="top" fontSize={11} fill="var(--muted-foreground)" formatter={(value) => (Number(value) > 0 ? value : "")} />
                </Bar>
                <Bar dataKey="lost_count" name="Perdidos" fill={palette[1]} radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  <LabelList dataKey="lost_count" position="top" fontSize={11} fill="var(--muted-foreground)" formatter={(value) => (Number(value) > 0 ? value : "")} />
                </Bar>
              </BarChart>
            </ChartContainer>
            {/* Always-visible legend — no hover required to read the colors. */}
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: palette[0] }} />
                Ganados
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: palette[1] }} />
                Perdidos
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
