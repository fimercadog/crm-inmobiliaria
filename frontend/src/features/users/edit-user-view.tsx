"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EditUserForm, userToFormValues } from "@/features/users/user-form";
import { fetchUser, updateUser } from "@/features/users/api";
import { ApiError } from "@/types/api";
import type { CrmUser } from "@/types/user";
import type { EditUserFormOutput } from "@/features/users/user-form-schema";

export function EditUserView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = Number(params.id);

  const [user, setUser] = useState<CrmUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let ignore = false;

    fetchUser(userId)
      .then((data) => {
        if (!ignore) setUser(data);
      })
      .catch((err: unknown) => {
        if (!ignore) setError(err instanceof ApiError ? err.message : "No fue posible cargar el usuario");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [userId, retryToken]);

  function handleRetry() {
    setIsLoading(true);
    setError(null);
    setRetryToken((token) => token + 1);
  }

  async function handleSubmit(values: EditUserFormOutput) {
    try {
      await updateUser(userId, values);
      toast.success("Usuario actualizado correctamente");
      router.push("/team/users");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No fue posible actualizar el usuario");
    }
  }

  if (isLoading) {
    return <LoadingState rows={6} />;
  }

  if (error || !user) {
    return <ErrorState description={error ?? undefined} onRetry={handleRetry} />;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <EditUserForm defaultValues={userToFormValues(user)} onSubmit={handleSubmit} />
      </CardContent>
    </Card>
  );
}
