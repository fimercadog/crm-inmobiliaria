import { Suspense } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ActivitiesTable } from "@/features/activities/activities-table";

export default function ActivitiesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Seguimientos"
        description="Registro de llamadas, WhatsApp, correos, reuniones y notas."
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }, { title: "Seguimientos" }]}
      />
      <Suspense fallback={<LoadingState />}>
        <ActivitiesTable />
      </Suspense>
    </PageContainer>
  );
}
