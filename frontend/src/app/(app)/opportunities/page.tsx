import { Suspense } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { OpportunitiesTable } from "@/features/opportunities/opportunities-table";

export default function OpportunitiesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Oportunidades"
        description="Pipeline comercial: cliente, propiedad, etapa y probabilidad de cierre."
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }, { title: "Oportunidades" }]}
      />
      <Suspense fallback={<LoadingState />}>
        <OpportunitiesTable />
      </Suspense>
    </PageContainer>
  );
}
