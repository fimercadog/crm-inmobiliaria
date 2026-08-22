"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { LeadForm } from "@/features/leads/lead-form";
import { createLead } from "@/features/leads/api";
import { ApiError } from "@/types/api";
import type { LeadFormOutput } from "@/features/leads/lead-form-schema";

export default function NewLeadPage() {
  const router = useRouter();

  async function handleSubmit(values: LeadFormOutput) {
    try {
      await createLead(values);
      toast.success("Lead creado correctamente");
      router.push("/leads");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "No fue posible crear el lead");
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Nuevo lead"
        description="Registra un nuevo prospecto y su canal de captación."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Leads", href: "/leads" },
          { title: "Nuevo" },
        ]}
      />
      <Card>
        <CardContent className="pt-6">
          <LeadForm onSubmit={handleSubmit} submitLabel="Crear lead" />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
