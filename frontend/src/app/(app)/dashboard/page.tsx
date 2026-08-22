"use client";

import {
  Bookmark,
  Building2,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Handshake,
  Home,
  KeyRound,
  ListTodo,
  Target,
  Trophy,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FunnelChart } from "@/features/dashboard/funnel-chart";
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

  return (
    <PageContainer>
      <PageHeader title="Dashboard" description="Vista general del negocio inmobiliario." />

      {isLoading && <LoadingState rows={6} />}

      {!isLoading && error && <ErrorState description={error} onRetry={retry} />}

      {!isLoading && !error && summary && (
        <>
          <div>
            <h2 className="mb-3 text-sm font-medium">Propiedades</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard label="Activas" value={summary.properties.active} icon={Building2} />
              <StatCard label="Disponibles" value={summary.properties.available} icon={Home} />
              <StatCard label="Reservadas" value={summary.properties.reserved} icon={Bookmark} />
              <StatCard label="Vendidas" value={summary.properties.sold} icon={CheckCircle2} />
              <StatCard label="Arrendadas" value={summary.properties.rented} icon={KeyRound} />
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-medium">Personas y comercial</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Leads nuevos" value={summary.leads_new} icon={UserPlus} />
              <StatCard label="Clientes activos" value={summary.clients_active} icon={Users} />
              <StatCard label="Visitas de hoy" value={summary.visits_today} icon={CalendarClock} />
              <StatCard label="Visitas próximas" value={summary.visits_upcoming} icon={CalendarDays} />
              <StatCard label="Oportunidades abiertas" value={summary.opportunities_open} icon={Target} />
              <StatCard label="En negociación" value={summary.deals_in_negotiation} icon={Handshake} />
              <StatCard label="Cierres del mes" value={summary.closings_this_month} icon={Trophy} />
              <StatCard label="Tareas pendientes" value={summary.tasks_pending} icon={ListTodo} />
            </div>
          </div>

          <StatCard
            label="Valor estimado del pipeline (oportunidades abiertas)"
            value={currencyFormatter.format(summary.pipeline_value)}
            icon={Wallet}
          />

          <Card>
            <CardHeader>
              <CardTitle>Embudo inmobiliario</CardTitle>
              <CardDescription>Lead → Contactado → Propiedad recomendada → Visita → Negociación → Cierre</CardDescription>
            </CardHeader>
            <CardContent>
              <FunnelChart data={summary.funnel} />
            </CardContent>
          </Card>
        </>
      )}
    </PageContainer>
  );
}
