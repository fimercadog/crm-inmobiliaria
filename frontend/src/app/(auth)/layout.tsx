import { Building2 } from "lucide-react";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-svh flex-1 flex-col items-center justify-center gap-6 p-6">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Building2 className="size-4" />
        </div>
        <span className="font-semibold">CRM Inmobiliaria</span>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
