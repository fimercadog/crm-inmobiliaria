import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/login-form";
import { RedirectIfAuthenticated } from "@/features/auth/redirect-if-authenticated";

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
