"use client";

import { Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { IconBadge } from "@/components/shared/stat-card";
import { useReportRows } from "@/features/dashboard/use-report-rows";
import { usePowerBiPalette } from "@/lib/chart-palette";
import { PROPERTY_STATUS_LABELS, PROPERTY_STATUSES } from "@/types/property";
import type { PropertiesByAgentStatusRow } from "@/types/report";

const chartConfig: ChartConfig = Object.fromEntries(
  PROPERTY_STATUSES.map((status) => [status, { label: PROPERTY_STATUS_LABELS[status] }]),
);

export function PropertiesByAgentChart() {
  const { rows, error } = useReportRows<PropertiesByAgentStatusRow>("/reports/properties-by-agent-status");
  const palette = usePowerBiPalette();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Propiedades por agente</CardTitle>
        <CardDescription>Cartera de cada agente, por estado.</CardDescription>
        <CardAction>
          <IconBadge icon={Users} tone="chart-4" />
        </CardAction>
      </CardHeader>
      <CardContent>
        {rows === null && !error && <LoadingState rows={4} />}
        {error && <ErrorState description={error} />}
        {rows !== null && !error && rows.length === 0 && (
          <EmptyState title="Sin propiedades asignadas" description="Ningún agente tiene propiedades todavía." />
        )}
        {rows !== null && !error && rows.length > 0 && (
          <>
            <ChartContainer config={chartConfig} className="aspect-auto h-70 w-full">
              <BarChart data={rows} margin={{ left: -20 }} barCategoryGap="30%">
                <defs>
                  {/* Bottom-to-top gradient per status for some depth. */}
                  {PROPERTY_STATUSES.map((status, index) => (
                    <linearGradient key={status} id={`agent-gradient-${status}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={palette[index % palette.length]} stopOpacity={1} />
                      <stop offset="100%" stopColor={palette[index % palette.length]} stopOpacity={0.75} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
                <XAxis dataKey="agent" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickMargin={8} />
                <ChartTooltip cursor={{ fill: "var(--muted)", opacity: 0.5 }} content={<ChartTooltipContent />} />
                {PROPERTY_STATUSES.map((status, index) => (
                  <Bar
                    key={status}
                    dataKey={status}
                    name={PROPERTY_STATUS_LABELS[status]}
                    stackId="properties"
                    fill={`url(#agent-gradient-${status})`}
                    // Only the topmost segment of the stack gets rounded top
                    // corners — rounding every segment would look like a
                    // stack of separate pills instead of one bar.
                    radius={index === PROPERTY_STATUSES.length - 1 ? [8, 8, 0, 0] : 0}
                    isAnimationActive={false}
                    className="transition-opacity hover:opacity-80"
                  >
                    <LabelList
                      dataKey={status}
                      position="inside"
                      fill="white"
                      fontSize={11}
                      // Hide the label on a segment with nothing in it — a "0"
                      // floating in an empty stack reads as noise, not data.
                      formatter={(value) => (Number(value) > 0 ? value : "")}
                    />
                  </Bar>
                ))}
              </BarChart>
            </ChartContainer>
            {/* Always-visible legend — a stack of 6 segments needs its colors
             * identified without waiting for a hover. */}
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              {PROPERTY_STATUSES.map((status, index) => (
                <div key={status} className="flex items-center gap-1.5">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
                  {PROPERTY_STATUS_LABELS[status]}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
