import { Suspense } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { RequireAdmin } from "@/features/auth/require-admin";
import { AgentsTable } from "@/features/agents/agents-table";

export default function AgentsPage() {
  return (
    <RequireAdmin>
      <PageContainer>
        <PageHeader
          title="Agentes"
          description="Consulta la carga de trabajo de cada agente: propiedades, oportunidades y tareas."
          breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }, { title: "Agentes" }]}
        />
        <Suspense fallback={<LoadingState />}>
          <AgentsTable />
        </Suspense>
      </PageContainer>
    </RequireAdmin>
  );
}
