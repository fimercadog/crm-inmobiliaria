import { Suspense } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { EditOpportunityView } from "@/features/opportunities/edit-opportunity-view";

export default function EditOpportunityPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Editar oportunidad"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Oportunidades", href: "/opportunities" },
          { title: "Editar" },
        ]}
      />
      <Suspense fallback={<LoadingState rows={6} />}>
        <EditOpportunityView />
      </Suspense>
    </PageContainer>
  );
}
