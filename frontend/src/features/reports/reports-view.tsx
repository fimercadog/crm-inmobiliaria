"use client";

import { ReportCard, type ReportColumn } from "@/features/reports/report-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { PROPERTY_STATUS_CONFIG } from "@/features/properties/status-config";
import type { PropertyStatusValue } from "@/types/property";
import type { AgentPerformanceRow, ClosingsByPeriodRow, PropertiesByStatusRow } from "@/types/report";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const propertiesColumns: ReportColumn<PropertiesByStatusRow>[] = [
  {
    key: "status",
    header: "Estado",
    render: (row) => <StatusBadge status={row.status as PropertyStatusValue} config={PROPERTY_STATUS_CONFIG} />,
  },
  { key: "count", header: "Cantidad", align: "right" },
  { key: "total_value", header: "Valor total", align: "right", render: (row) => currencyFormatter.format(row.total_value) },
];

const closingsColumns: ReportColumn<ClosingsByPeriodRow>[] = [
  { key: "period", header: "Periodo" },
  { key: "won_count", header: "Ganados", align: "right" },
  { key: "lost_count", header: "Perdidos", align: "right" },
  { key: "won_value", header: "Valor ganado", align: "right", render: (row) => currencyFormatter.format(row.won_value) },
];

const agentColumns: ReportColumn<AgentPerformanceRow>[] = [
  { key: "agent", header: "Agente" },
  { key: "properties_count", header: "Propiedades", align: "right" },
  { key: "closed_count", header: "Cierres", align: "right" },
  { key: "closed_value", header: "Valor cerrado", align: "right", render: (row) => currencyFormatter.format(row.closed_value) },
  { key: "pending_tasks_count", header: "Tareas pendientes", align: "right" },
];

export function ReportsView() {
  return (
    <div className="flex flex-col gap-6">
      <ReportCard
        title="Propiedades por estado"
        description="Cantidad y valor total del inventario, agrupado por estado."
        endpoint="/reports/properties-by-status"
        fileBaseName="propiedades-por-estado"
        columns={propertiesColumns}
      />

      <ReportCard
        title="Cierres por periodo"
        description="Negocios ganados y perdidos en los últimos 6 meses."
        endpoint="/reports/closings-by-period"
        fileBaseName="cierres-por-periodo"
        columns={closingsColumns}
      />

      <ReportCard
        title="Desempeño por agente"
        description="Carga de trabajo y resultados de cada agente."
        endpoint="/reports/agent-performance"
        fileBaseName="desempeno-por-agente"
        columns={agentColumns}
      />
    </div>
  );
}
