import { Suspense } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ClientsTable } from "@/features/clients/clients-table";

export default function ClientsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Clientes"
        description="Personas interesadas en comprar o arrendar una propiedad."
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }, { title: "Clientes" }]}
      />
      <Suspense fallback={<LoadingState />}>
        <ClientsTable />
      </Suspense>
    </PageContainer>
  );
}
