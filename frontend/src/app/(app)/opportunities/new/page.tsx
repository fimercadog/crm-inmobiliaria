"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { RequireWrite } from "@/features/auth/require-write";
import { OpportunityForm } from "@/features/opportunities/opportunity-form";
import { createOpportunity } from "@/features/opportunities/api";
import { ApiError } from "@/types/api";
import type { OpportunityFormOutput } from "@/features/opportunities/opportunity-form-schema";

export default function NewOpportunityPage() {
  const router = useRouter();

  async function handleSubmit(values: OpportunityFormOutput) {
    try {
      await createOpportunity(values);
      toast.success("Oportunidad creada correctamente");
      router.push("/opportunities");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "No fue posible crear la oportunidad");
    }
  }

  return (
    <RequireWrite>
      <PageContainer>
        <PageHeader
          title="Nueva oportunidad"
          description="Registra una nueva oportunidad comercial."
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Oportunidades", href: "/opportunities" },
            { title: "Nueva" },
          ]}
        />
        <Card>
          <CardContent className="pt-6">
            <OpportunityForm onSubmit={handleSubmit} submitLabel="Crear oportunidad" />
          </CardContent>
        </Card>
      </PageContainer>
    </RequireWrite>
  );
}
