import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/login-form";
import { RedirectIfAuthenticated } from "@/features/auth/redirect-if-authenticated";

// Static pages get a 1-year s-maxage from the Hostinger CDN. After a deploy
// wipes the old chunk files (cleanDistDir), edges that haven't revalidated
// yet keep serving old HTML referencing chunks that 404 — breaking login.
// force-dynamic skips that long-lived static cache for this critical route.
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <RedirectIfAuthenticated>
      <Card>
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
          <CardDescription>Usa un usuario demo para entrar al panel y probar roles.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </RedirectIfAuthenticated>
  );
}
