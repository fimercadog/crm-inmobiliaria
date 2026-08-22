"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { TaskForm } from "@/features/tasks/task-form";
import { createTask } from "@/features/tasks/api";
import { ApiError } from "@/types/api";
import type { TaskFormSchema } from "@/features/tasks/task-form-schema";

export default function NewTaskPage() {
  const router = useRouter();

  async function handleSubmit(values: TaskFormSchema) {
    try {
      await createTask(values);
      toast.success("Tarea creada correctamente");
      router.push("/tasks");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "No fue posible crear la tarea");
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Nueva tarea"
        description="Crea una tarea pendiente para el equipo."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Tareas", href: "/tasks" },
          { title: "Nueva" },
        ]}
      />
      <Card>
        <CardContent className="pt-6">
          <TaskForm onSubmit={handleSubmit} submitLabel="Crear tarea" />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
