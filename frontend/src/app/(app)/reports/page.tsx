import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { ReportsView } from "@/features/reports/reports-view";

export default function ReportsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Reportes"
        description="Indicadores clave del negocio, listos para exportar."
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }, { title: "Reportes" }]}
      />
      <ReportsView />
    </PageContainer>
  );
}
