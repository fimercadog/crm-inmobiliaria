import { Suspense } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { RequireAdmin } from "@/features/auth/require-admin";
import { UsersTable } from "@/features/users/users-table";

export default function UsersPage() {
  return (
    <RequireAdmin>
      <PageContainer>
        <PageHeader
          title="Usuarios"
          description="Administra las cuentas del equipo y sus roles de acceso."
          breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }, { title: "Usuarios" }]}
        />
        <Suspense fallback={<LoadingState />}>
          <UsersTable />
        </Suspense>
      </PageContainer>
    </RequireAdmin>
  );
}
