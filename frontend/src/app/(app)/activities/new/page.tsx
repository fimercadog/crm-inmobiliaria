"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ActivityForm } from "@/features/activities/activity-form";
import { createActivity } from "@/features/activities/api";
import { ApiError } from "@/types/api";
import type { ActivityFormOutput } from "@/features/activities/activity-form-schema";

export default function NewActivityPage() {
  const router = useRouter();

  async function handleSubmit(values: ActivityFormOutput) {
    try {
      await createActivity(values);
      toast.success("Seguimiento registrado correctamente");
      router.push("/activities");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "No fue posible registrar el seguimiento");
    }
  }

  return (
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
  );
}
