"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { ActivityForm, activityToFormValues } from "@/features/activities/activity-form";
import { fetchActivity, updateActivity } from "@/features/activities/api";
import { ApiError } from "@/types/api";
import type { Activity } from "@/types/activity";
import type { ActivityFormOutput } from "@/features/activities/activity-form-schema";

export function EditActivityView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const activityId = Number(params.id);

  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let ignore = false;

    fetchActivity(activityId)
      .then((data) => {
        if (!ignore) setActivity(data);
      })
      .catch((err: unknown) => {
        if (!ignore) setError(err instanceof ApiError ? err.message : "No fue posible cargar el seguimiento");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [activityId, retryToken]);

  function handleRetry() {
    setIsLoading(true);
    setError(null);
    setRetryToken((token) => token + 1);
  }

  async function handleSubmit(values: ActivityFormOutput) {
    try {
      await updateActivity(activityId, values);
      toast.success("Seguimiento actualizado correctamente");
      router.push("/activities");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No fue posible actualizar el seguimiento");
    }
  }

  if (isLoading) {
    return <LoadingState rows={6} />;
  }

  if (error || !activity) {
    return <ErrorState description={error ?? undefined} onRetry={handleRetry} />;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <ActivityForm defaultValues={activityToFormValues(activity)} onSubmit={handleSubmit} submitLabel="Guardar cambios" />
      </CardContent>
    </Card>
  );
}
