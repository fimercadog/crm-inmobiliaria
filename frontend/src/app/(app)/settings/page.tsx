"use client";

import { toast } from "sonner";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProfileForm } from "@/features/settings/profile-form";
import { updateProfile } from "@/features/auth/api";
import { USER_ROLE_CONFIG } from "@/features/users/status-config";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { updateUser } from "@/store/slices/authSlice";
import { ApiError } from "@/types/api";
import type { ProfileFormOutput } from "@/features/settings/profile-form-schema";

export default function SettingsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  async function handleSubmit(values: ProfileFormOutput) {
    try {
      const updated = await updateProfile(values);
      dispatch(updateUser(updated));
      toast.success("Perfil actualizado correctamente");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "No fue posible actualizar el perfil");
    }
  }

  if (!user) return null;

  return (
    <PageContainer>
      <PageHeader
        title="Configuración"
        description="Administra tu información de cuenta."
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }, { title: "Configuración" }]}
      />
      <Card>
        <CardHeader>
          <CardTitle>Mi perfil</CardTitle>
          <CardDescription>
            Rol actual: <StatusBadge status={user.role} config={USER_ROLE_CONFIG} />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm defaultValues={{ name: user.name, email: user.email }} onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
