import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";
import { RedirectIfAuthenticated } from "@/features/auth/redirect-if-authenticated";

// See login/page.tsx: force-dynamic avoids the CDN's long-lived static cache
// serving stale chunk references after a deploy.
export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <RedirectIfAuthenticated>
      <Card>
        <CardHeader>
          <CardTitle>Recuperar contraseña</CardTitle>
          <CardDescription>Ingresa tu correo y te enviaremos un enlace para restablecerla</CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </RedirectIfAuthenticated>
  );
}
