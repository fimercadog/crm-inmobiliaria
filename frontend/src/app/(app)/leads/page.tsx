import { Suspense } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { LeadsTable } from "@/features/leads/leads-table";

export default function LeadsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Leads"
        description="Prospectos por calificar, provenientes de cualquier canal de captación."
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }, { title: "Leads" }]}
      />
      <Suspense fallback={<LoadingState />}>
        <LeadsTable />
      </Suspense>
    </PageContainer>
  );
}
