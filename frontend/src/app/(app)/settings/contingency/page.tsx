import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { RequireAdmin } from "@/features/auth/require-admin";
import { ContingencySettingsView } from "@/features/contingency/contingency-settings-view";

export default function ContingencyPage() {
  return (
    <RequireAdmin>
      <PageContainer>
        <PageHeader
          title="Modo contingencia"
          description="Continuar trabajando de forma controlada durante una caída de conexión."
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Configuración", href: "/settings" },
            { title: "Contingencia" },
          ]}
        />
        <ContingencySettingsView />
      </PageContainer>
    </RequireAdmin>
  );
}
