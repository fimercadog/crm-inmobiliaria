import { Suspense } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { EditPropertyView } from "@/features/properties/edit-property-view";

export default function EditPropertyPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Editar propiedad"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Propiedades", href: "/properties" },
          { title: "Editar" },
        ]}
      />
      <Suspense fallback={<LoadingState rows={8} />}>
        <EditPropertyView />
      </Suspense>
    </PageContainer>
  );
}
