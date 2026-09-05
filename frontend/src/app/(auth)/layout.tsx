import { Shield, Home, BarChart3 } from "lucide-react";
import { PublicLogo } from "@/components/public/public-logo";
import { AuthProvider } from "@/features/auth/auth-provider";

const BENEFITS = [
  { icon: Home, label: "Propiedades y clientes en un solo lugar" },
  { icon: Shield, label: "Roles y permisos por usuario" },
  { icon: BarChart3, label: "Reportes claros" },
];

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    // RedirectIfAuthenticated (used per-page: login, forgot-password,
    // reset-password) needs session state to bounce an already-logged-in
    // visitor to the dashboard, so this group also mounts its own
    // AuthProvider instead of relying on one at the root.
    <AuthProvider>
      <div className="flex min-h-svh flex-col lg:flex-row">
        <div className="public-theme relative hidden flex-1 flex-col justify-center gap-10 overflow-hidden bg-linear-to-br from-(--realty-accent)/25 via-(--realty-soft) to-(--realty-blue)/20 px-16 lg:flex">
          <div>
            <h1 className="max-w-md text-4xl font-semibold tracking-tight text-(--realty-primary)">
              Gestiona tu inmobiliaria desde un solo lugar
            </h1>
            <p className="mt-4 max-w-sm text-(--realty-muted)">
              Propiedades, clientes, leads y visitas en una sola plataforma.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {BENEFITS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 rounded-full bg-white/80 px-5 py-3 text-sm font-medium text-(--realty-primary) shadow-sm">
                <Icon className="size-4 text-(--realty-accent)" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="dark flex flex-1 flex-col items-center justify-center gap-6 bg-(--realty-primary) p-6 text-foreground">
          <PublicLogo inverted textClassName="text-white" />
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </AuthProvider>
  );
}
