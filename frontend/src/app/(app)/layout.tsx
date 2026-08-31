import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { RequireAuth } from "@/features/auth/require-auth";

// Every page here needs a live session and renders per-user data client-side,
// so none of them should ever be statically prerendered. Static pages get a
// 1-year CDN cache; after a deploy wipes old chunk files, edges that haven't
// revalidated keep serving stale HTML referencing deleted chunks (same class
// of bug fixed on /login — see that page for the full writeup). Setting this
// here cascades to every route under (app) instead of patching them one by one.
export const dynamic = "force-dynamic";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <RequireAuth>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <div className="flex flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </RequireAuth>
  );
}
