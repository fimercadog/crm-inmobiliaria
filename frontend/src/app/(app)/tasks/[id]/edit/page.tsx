import { Suspense } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { EditTaskView } from "@/features/tasks/edit-task-view";

export default function EditTaskPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Editar tarea"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Tareas", href: "/tasks" },
          { title: "Editar" },
        ]}
      />
      <Suspense fallback={<LoadingState rows={6} />}>
        <EditTaskView />
      </Suspense>
    </PageContainer>
  );
}
