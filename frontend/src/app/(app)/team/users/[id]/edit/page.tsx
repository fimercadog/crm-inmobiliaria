import { Suspense } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { RequireAdmin } from "@/features/auth/require-admin";
import { EditUserView } from "@/features/users/edit-user-view";

export default function EditUserPage() {
  return (
    <RequireAdmin>
      <PageContainer>
        <PageHeader
          title="Editar usuario"
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Usuarios", href: "/team/users" },
            { title: "Editar" },
          ]}
        />
        <Suspense fallback={<LoadingState rows={6} />}>
          <EditUserView />
        </Suspense>
      </PageContainer>
    </RequireAdmin>
  );
}
