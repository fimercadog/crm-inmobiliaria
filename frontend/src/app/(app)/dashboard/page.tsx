"use client";

import { Filter } from "lucide-react";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { StatCard, IconBadge, RateBadge } from "@/components/shared/stat-card";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FunnelChart } from "@/features/dashboard/funnel-chart";
import { PropertiesStatusChart } from "@/features/dashboard/properties-status-chart";
import { PropertiesByAgentChart } from "@/features/dashboard/properties-by-agent-chart";
import { ClosingsChart } from "@/features/dashboard/closings-chart";
import { useDashboardSummary } from "@/features/dashboard/use-dashboard-summary";

// "notation: compact" reads as "$11 mil M" in es-CO for billions (numerically
// correct — "mil millones" is how Spanish expresses 10^9 — but unreadable as an
// abbreviation). Plain grouped digits are unambiguous at any magnitude.
const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export default function DashboardPage() {
  const { summary, isLoading, error, retry } = useDashboardSummary();

  const funnel = summary?.funnel ?? [];
  const firstStageCount = funnel[0]?.count ?? 0;
  const lastStageCount = funnel[funnel.length - 1]?.count ?? 0;
  const conversionRate = firstStageCount > 0 ? Math.round((lastStageCount / firstStageCount) * 100) : null;

  return (
    // Scoped dark theme — this page only, not the sidebar/topbar shell —
    // copying the reference BI-dashboard's dark look. Every Card/StatCard
    // already reads its colors from CSS vars, so flipping `.dark` here is
    // enough; no chart component needs its own dark-mode branch.
    <PageContainer className="dark bg-background text-foreground">
      <PageHeader title="Dashboard" description="Vista general del negocio inmobiliario." />

      {isLoading && <LoadingState rows={6} />}

      {!isLoading && error && <ErrorState description={error} onRetry={retry} />}

      {!isLoading && !error && summary && (
        <>
          <div>
            <h2 className="mb-3 text-sm font-medium">Propiedades</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard label="Activas" value={summary.properties.active} tone="chart-1" />
              <StatCard label="Disponibles" value={summary.properties.available} tone="success" />
              <StatCard label="Reservadas" value={summary.properties.reserved} tone="chart-3" />
              <StatCard label="Vendidas" value={summary.properties.sold} tone="chart-4" />
              <StatCard label="Arrendadas" value={summary.properties.rented} tone="chart-5" />
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-medium">Personas y comercial</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Leads nuevos" value={summary.leads_new} tone="chart-1" />
              <StatCard label="Clientes activos" value={summary.clients_active} tone="chart-2" />
              <StatCard label="Visitas de hoy" value={summary.visits_today} tone="chart-3" />
              <StatCard label="Visitas próximas" value={summary.visits_upcoming} tone="chart-4" />
              <StatCard label="Oportunidades abiertas" value={summary.opportunities_open} tone="chart-5" />
              <StatCard label="En negociación" value={summary.deals_in_negotiation} tone="warning" />
              <StatCard label="Cierres del mes" value={summary.closings_this_month} tone="success" />
              <StatCard label="Tareas pendientes" value={summary.tasks_pending} tone="destructive" />
            </div>
          </div>

          <StatCard
            label="Valor estimado del pipeline (oportunidades abiertas)"
            value={currencyFormatter.format(summary.pipeline_value)}
            tone="success"
          />

          {/* Material-style elevation on the chart cards specifically — the
           * default Card is just a 1px ring with no shadow, which read as
           * "flat" once several charts sat side by side. Scoped to this
           * grid's direct children rather than the shared Card component,
           * so the rest of the app's cards (forms, tables) are unaffected. */}
          <div className="grid gap-4 lg:grid-cols-2 *:shadow-md *:transition-shadow *:hover:shadow-lg">
            <Card>
              <CardHeader>
                <CardTitle>Embudo inmobiliario</CardTitle>
                <CardDescription>Lead → Contactado → Propiedad recomendada → Visita → Negociación → Cierre</CardDescription>
                <CardAction>
                  <IconBadge icon={Filter} tone="chart-1" />
                </CardAction>
                {conversionRate !== null && (
                  <div className="mt-2">
                    <RateBadge value={`${conversionRate}%`} label="conversión a cierre" tone="success" />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <FunnelChart data={summary.funnel} />
              </CardContent>
            </Card>

            <PropertiesStatusChart />
            <PropertiesByAgentChart />
            <ClosingsChart />
          </div>
        </>
      )}
    </PageContainer>
  );
}
