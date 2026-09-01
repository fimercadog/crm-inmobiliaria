"use client";

import { ChartPie } from "lucide-react";
import { Cell, Pie, PieChart } from "recharts";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { IconBadge } from "@/components/shared/stat-card";
import { useReportRows } from "@/features/dashboard/use-report-rows";
import { usePowerBiPalette } from "@/lib/chart-palette";
import { PROPERTY_STATUS_LABELS, type PropertyStatusValue } from "@/types/property";
import type { PropertiesByStatusRow } from "@/types/report";

function statusLabel(status: string): string {
  return PROPERTY_STATUS_LABELS[status as PropertyStatusValue] ?? status;
}

interface PieLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  value?: number;
}

// Recharts' default Pie label sits just outside the slice — with a full pie
// (no legend gap to grow into) that overflows the card and gets clipped by
// its `overflow-hidden`. Placing it inside the slice instead means it can
// never spill past the chart's own bounds.
function renderInsideLabel({ cx = 0, cy = 0, midAngle = 0, outerRadius = 0, value = 0 }: PieLabelProps) {
  const radius = outerRadius * 0.65;
  const radians = (-midAngle * Math.PI) / 180;
  const x = cx + radius * Math.cos(radians);
  const y = cy + radius * Math.sin(radians);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600}>
      {value}
    </text>
  );
}

export function PropertiesStatusChart() {
  const { rows, error } = useReportRows<PropertiesByStatusRow>("/reports/properties-by-status");
  const palette = usePowerBiPalette();

  const chartConfig: ChartConfig = Object.fromEntries(
    (rows ?? []).map((row) => [row.status, { label: statusLabel(row.status) }]),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Propiedades por estado</CardTitle>
        <CardDescription>
          Distribución del inventario actual — {rows?.reduce((sum, row) => sum + row.count, 0) ?? 0} propiedades en total.
        </CardDescription>
        <CardAction>
          <IconBadge icon={ChartPie} tone="chart-3" />
        </CardAction>
      </CardHeader>
      <CardContent>
        {rows === null && !error && <LoadingState rows={4} />}
        {error && <ErrorState description={error} />}
        {rows !== null && !error && rows.length === 0 && (
          <EmptyState title="Sin propiedades registradas" description="Aún no hay inventario para graficar." />
        )}
        {rows !== null && !error && rows.length > 0 && (
          <>
            <ChartContainer config={chartConfig} className="mx-auto aspect-auto h-60 w-full">
              <PieChart>
                <defs>
                  {/* Top-to-bottom gradient per slice for some depth — literal
                   * hex from the palette, not a CSS var (a var() doesn't
                   * resolve through the raw `stop-color` attribute). */}
                  {rows.map((row, index) => (
                    <linearGradient key={row.status} id={`pie-gradient-${row.status}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={palette[index % palette.length]} stopOpacity={1} />
                      <stop offset="100%" stopColor={palette[index % palette.length]} stopOpacity={0.75} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={rows}
                  dataKey="count"
                  nameKey="status"
                  outerRadius={95}
                  paddingAngle={3}
                  strokeWidth={2}
                  // A CSS var doesn't resolve through the plain `stroke`
                  // attribute, only via `style` — matches the card's own
                  // background so the border reads as a crisp separator in
                  // both themes instead of a hardcoded color.
                  style={{ stroke: "var(--card)" }}
                  isAnimationActive={false}
                  label={renderInsideLabel}
                  labelLine={false}
                >
                  {rows.map((row) => (
                    <Cell key={row.status} fill={`url(#pie-gradient-${row.status})`} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
              </PieChart>
            </ChartContainer>
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              {rows.map((row, index) => (
                <div key={row.status} className="flex items-center gap-1.5">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
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
