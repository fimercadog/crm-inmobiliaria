import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/shared/loading-state";
import { ResetPasswordForm } from "@/features/auth/reset-password-form";
import { RedirectIfAuthenticated } from "@/features/auth/redirect-if-authenticated";

export default function ResetPasswordPage() {
  return (
    <RedirectIfAuthenticated>
      <Card>
        <CardHeader>
          <CardTitle>Restablecer contraseña</CardTitle>
          <CardDescription>Ingresa tu nueva contraseña para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoadingState rows={3} />}>
            <ResetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </RedirectIfAuthenticated>
  );
}
