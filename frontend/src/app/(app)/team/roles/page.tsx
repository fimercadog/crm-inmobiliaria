import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { RequireAdmin } from "@/features/auth/require-admin";
import { RolesMatrix } from "@/features/roles/roles-matrix";

export default function RolesPage() {
  return (
    <RequireAdmin>
      <PageContainer>
        <PageHeader
          title="Roles"
          description="Qué puede hacer cada rol dentro del CRM."
          breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }, { title: "Roles" }]}
        />
        <RolesMatrix />
      </PageContainer>
    </RequireAdmin>
  );
}
