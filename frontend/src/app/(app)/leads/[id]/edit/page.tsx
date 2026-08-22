import { Suspense } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { RequireWrite } from "@/features/auth/require-write";
import { EditLeadView } from "@/features/leads/edit-lead-view";

export default function EditLeadPage() {
  return (
    <RequireWrite>
      <PageContainer>
        <PageHeader
          title="Editar lead"
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Leads", href: "/leads" },
            { title: "Editar" },
          ]}
        />
        <Suspense fallback={<LoadingState rows={6} />}>
          <EditLeadView />
        </Suspense>
      </PageContainer>
    </RequireWrite>
  );
}
