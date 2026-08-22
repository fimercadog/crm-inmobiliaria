"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { LeadForm, leadToFormValues } from "@/features/leads/lead-form";
import { fetchLead, updateLead } from "@/features/leads/api";
import { ApiError } from "@/types/api";
import type { Lead } from "@/types/lead";
import type { LeadFormOutput } from "@/features/leads/lead-form-schema";

export function EditLeadView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const leadId = Number(params.id);

  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let ignore = false;

    fetchLead(leadId)
      .then((data) => {
        if (!ignore) setLead(data);
      })
      .catch((err: unknown) => {
        if (!ignore) setError(err instanceof ApiError ? err.message : "No fue posible cargar el lead");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [leadId, retryToken]);

  function handleRetry() {
    setIsLoading(true);
    setError(null);
    setRetryToken((token) => token + 1);
  }

  async function handleSubmit(values: LeadFormOutput) {
    try {
      await updateLead(leadId, values);
      toast.success("Lead actualizado correctamente");
      router.push("/leads");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No fue posible actualizar el lead");
    }
  }

  if (isLoading) {
    return <LoadingState rows={6} />;
  }

  if (error || !lead) {
    return <ErrorState description={error ?? undefined} onRetry={handleRetry} />;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <LeadForm defaultValues={leadToFormValues(lead)} onSubmit={handleSubmit} submitLabel="Guardar cambios" />
      </CardContent>
    </Card>
  );
}
