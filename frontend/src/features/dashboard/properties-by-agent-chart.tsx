"use client";

import { Bar, BarChart, CartesianGrid, Legend, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { useReportRows } from "@/features/dashboard/use-report-rows";
import { PROPERTY_STATUS_LABELS, PROPERTY_STATUSES, type PropertyStatusValue } from "@/types/property";
import type { PropertiesByAgentStatusRow } from "@/types/report";

const STATUS_COLORS: Record<PropertyStatusValue, string> = {
  borrador: "var(--muted-foreground)",
  disponible: "var(--chart-2)",
  reservado: "var(--chart-3)",
  vendido: "var(--chart-1)",
  arrendado: "var(--chart-4)",
  inactivo: "var(--destructive)",
};

export function PropertiesByAgentChart() {
  const { rows, error } = useReportRows<PropertiesByAgentStatusRow>("/reports/properties-by-agent-status");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Propiedades por agente</CardTitle>
        <CardDescription>Cartera de cada agente, por estado.</CardDescription>
      </CardHeader>
      <CardContent>
        {rows === null && !error && <LoadingState rows={4} />}
        {error && <ErrorState description={error} />}
        {rows !== null && !error && rows.length === 0 && (
          <EmptyState title="Sin propiedades asignadas" description="Ningún agente tiene propiedades todavía." />
        )}
        {rows !== null && !error && rows.length > 0 && (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={rows} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
              <XAxis dataKey="agent" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickMargin={8} />
              <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
                animationDuration={150}
              />
              {/* Always-rendered legend — a chart with 6 stacked segments has
               * to identify its colors without waiting for a hover. */}
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              {PROPERTY_STATUSES.map((status) => (
                <Bar
                  key={status}
                  dataKey={status}
                  name={PROPERTY_STATUS_LABELS[status]}
                  stackId="properties"
                  // Both needed: `fill` (recharts reads this prop, not the
                  // DOM, to color the Legend swatch) and `style.fill` (a
                  // CSS var doesn't resolve as a plain SVG attribute, so the
                  // bar itself needs it as real inline style — see
                  // properties-status-chart.tsx for the same fix).
                  fill={STATUS_COLORS[status]}
                  style={{ fill: STATUS_COLORS[status] }}
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
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
