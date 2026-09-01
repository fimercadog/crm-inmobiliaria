"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { BetaNoticeDialog, BETA_NOTICE_KEY } from "@/components/layout/beta-notice-dialog";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Client wrapper so the beta-notice open state can be shared between the
// header's reopen button and the auto-popup-on-login — kept out of
// layout.tsx because that file needs to stay a Server Component for its
// `export const dynamic` route config.
export function AppShell({ children }: { children: React.ReactNode }) {
  const [betaOpen, setBetaOpen] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem(BETA_NOTICE_KEY)) setBetaOpen(true);
  }, []);

  function handleBetaOpenChange(open: boolean) {
    if (!open) sessionStorage.setItem(BETA_NOTICE_KEY, "1");
    setBetaOpen(open);
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader onShowBetaNotice={() => setBetaOpen(true)} />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
      <BetaNoticeDialog open={betaOpen} onOpenChange={handleBetaOpenChange} />
    </SidebarProvider>
  );
}
