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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Propiedades por estado</CardTitle>
        <CardDescription>
          Distribución del inventario actual — {rows?.reduce((sum, row) => sum + row.count, 0) ?? 0} propiedades en total.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rows === null && !error && <LoadingState rows={4} />}
        {error && <ErrorState description={error} />}
        {rows !== null && !error && rows.length === 0 && (
          <EmptyState title="Sin propiedades registradas" description="Aún no hay inventario para graficar." />
        )}
        {rows !== null && !error && rows.length > 0 && (
          <>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <defs>
                  {/* Subtle top-to-bottom gradient per slice instead of a
                   * flat fill — a plain saturated color on every wedge is
                   * exactly the "looks flat" complaint. stopColor is a raw
                   * SVG attribute, same as `fill`: a CSS var only resolves
                   * through `style`, not the attribute itself. */}
                  {rows.map((row, index) => (
                    <linearGradient key={row.status} id={`pie-gradient-${row.status}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" style={{ stopColor: COLORS[index % COLORS.length], stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: COLORS[index % COLORS.length], stopOpacity: 0.7 }} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={rows}
                  dataKey="count"
                  nameKey="status"
                  outerRadius={95}
                  strokeWidth={0}
                  isAnimationActive={false}
                  label={renderInsideLabel}
                  labelLine={false}
                >
                  {rows.map((row) => (
                    <Cell key={row.status} fill={`url(#pie-gradient-${row.status})`} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, _name, entry) => [value, statusLabel(String((entry.payload as PropertiesByStatusRow).status))]}
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
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
