import { Suspense } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { EditActivityView } from "@/features/activities/edit-activity-view";

export default function EditActivityPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Editar seguimiento"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Seguimientos", href: "/activities" },
          { title: "Editar" },
        ]}
      />
      <Suspense fallback={<LoadingState rows={6} />}>
        <EditActivityView />
      </Suspense>
    </PageContainer>
  );
}
