"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { RequireAdmin } from "@/features/auth/require-admin";
import { CreateUserForm } from "@/features/users/user-form";
import { createUser } from "@/features/users/api";
import { ApiError } from "@/types/api";
import type { CreateUserFormOutput } from "@/features/users/user-form-schema";

export default function NewUserPage() {
  const router = useRouter();

  async function handleSubmit(values: CreateUserFormOutput) {
    try {
      await createUser(values);
      toast.success("Usuario creado correctamente");
      router.push("/team/users");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "No fue posible crear el usuario");
    }
  }

  return (
    <RequireAdmin>
      <PageContainer>
        <PageHeader
          title="Nuevo usuario"
          description="Crea una cuenta para un nuevo miembro del equipo."
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Usuarios", href: "/team/users" },
            { title: "Nuevo" },
          ]}
        />
        <Card>
          <CardContent className="pt-6">
            <CreateUserForm onSubmit={handleSubmit} />
          </CardContent>
        </Card>
      </PageContainer>
    </RequireAdmin>
  );
}
