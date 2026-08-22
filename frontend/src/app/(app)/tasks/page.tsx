import { Suspense } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { TasksTable } from "@/features/tasks/tasks-table";

export default function TasksPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Tareas"
        description="Tareas pendientes del equipo comercial."
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }, { title: "Tareas" }]}
      />
      <Suspense fallback={<LoadingState />}>
        <TasksTable />
      </Suspense>
    </PageContainer>
  );
}
