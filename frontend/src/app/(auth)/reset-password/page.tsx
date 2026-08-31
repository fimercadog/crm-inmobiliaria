import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/shared/loading-state";
import { ResetPasswordForm } from "@/features/auth/reset-password-form";
import { RedirectIfAuthenticated } from "@/features/auth/redirect-if-authenticated";

// See login/page.tsx: force-dynamic avoids the CDN's long-lived static cache
// serving stale chunk references after a deploy.
export const dynamic = "force-dynamic";

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
