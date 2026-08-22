import { Suspense } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { EditClientView } from "@/features/clients/edit-client-view";

export default function EditClientPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Editar cliente"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Clientes", href: "/clients" },
          { title: "Editar" },
        ]}
      />
      <Suspense fallback={<LoadingState rows={6} />}>
        <EditClientView />
      </Suspense>
    </PageContainer>
  );
}
