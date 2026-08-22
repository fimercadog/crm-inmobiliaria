"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ClientForm } from "@/features/clients/client-form";
import { createClient } from "@/features/clients/api";
import { ApiError } from "@/types/api";
import type { ClientFormOutput } from "@/features/clients/client-form-schema";

export default function NewClientPage() {
  const router = useRouter();

  async function handleSubmit(values: ClientFormOutput) {
    try {
      await createClient(values);
      toast.success("Cliente creado correctamente");
      router.push("/clients");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "No fue posible crear el cliente");
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Nuevo cliente"
        description="Registra a una persona interesada en comprar o arrendar."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Clientes", href: "/clients" },
          { title: "Nuevo" },
        ]}
      />
      <Card>
        <CardContent className="pt-6">
          <ClientForm onSubmit={handleSubmit} submitLabel="Crear cliente" />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
