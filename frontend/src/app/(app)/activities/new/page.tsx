"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { RequireWrite } from "@/features/auth/require-write";
import { ActivityForm } from "@/features/activities/activity-form";
import { createActivity } from "@/features/activities/api";
import { useContingency } from "@/features/contingency/contingency-context";
import { ApiError } from "@/types/api";
import type { ActivityFormOutput } from "@/features/activities/activity-form-schema";

export default function NewActivityPage() {
  const router = useRouter();
  const { isModuleEnabled, queue } = useContingency();

  async function handleSubmit(values: ActivityFormOutput) {
    try {
      if (isModuleEnabled("activities")) {
        await queue("activities", "create", values);
        toast.success("Seguimiento guardado en contingencia — pendiente de sincronizar");
      } else {
        await createActivity(values);
        toast.success("Seguimiento registrado correctamente");
      }
      router.push("/activities");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "No fue posible registrar el seguimiento");
    }
  }

  return (
    <RequireWrite>
      <PageContainer>
        <PageHeader
          title="Nuevo seguimiento"
          description="Registra una llamada, correo, reunión u otra interacción."
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Seguimientos", href: "/activities" },
            { title: "Nuevo" },
          ]}
        />
        <Card>
          <CardContent className="pt-6">
            <ActivityForm onSubmit={handleSubmit} submitLabel="Registrar seguimiento" />
          </CardContent>
        </Card>
      </PageContainer>
    </RequireWrite>
  );
}
