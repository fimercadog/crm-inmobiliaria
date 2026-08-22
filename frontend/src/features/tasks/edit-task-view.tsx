"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { TaskForm, taskToFormValues } from "@/features/tasks/task-form";
import { fetchTask, updateTask } from "@/features/tasks/api";
import { ApiError } from "@/types/api";
import type { Task } from "@/types/task";
import type { TaskFormSchema } from "@/features/tasks/task-form-schema";

export function EditTaskView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const taskId = Number(params.id);

  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let ignore = false;

    fetchTask(taskId)
      .then((data) => {
        if (!ignore) setTask(data);
      })
      .catch((err: unknown) => {
        if (!ignore) setError(err instanceof ApiError ? err.message : "No fue posible cargar la tarea");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [taskId, retryToken]);

  function handleRetry() {
    setIsLoading(true);
    setError(null);
    setRetryToken((token) => token + 1);
  }

  async function handleSubmit(values: TaskFormSchema) {
    try {
      await updateTask(taskId, values);
      toast.success("Tarea actualizada correctamente");
      router.push("/tasks");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No fue posible actualizar la tarea");
    }
  }

  if (isLoading) {
    return <LoadingState rows={6} />;
  }

  if (error || !task) {
    return <ErrorState description={error ?? undefined} onRetry={handleRetry} />;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <TaskForm defaultValues={taskToFormValues(task)} onSubmit={handleSubmit} submitLabel="Guardar cambios" />
      </CardContent>
    </Card>
  );
}
