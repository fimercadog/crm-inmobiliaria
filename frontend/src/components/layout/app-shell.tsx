"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { BetaNoticeDialog } from "@/components/layout/beta-notice-dialog";
import { ContingencyBanner } from "@/components/layout/contingency-banner";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ContingencyProvider } from "@/features/contingency/contingency-context";

// Client wrapper so the beta-notice open state can be shared between the
// header's reopen button and the auto-popup — kept out of layout.tsx because
// that file needs to stay a Server Component for its `export const dynamic`
// route config.
export function AppShell({ children }: { children: React.ReactNode }) {
  // Opens on every app load (i.e. every fresh login lands here) — no
  // once-per-session suppression: while in beta we want it seen every time.
  const [betaOpen, setBetaOpen] = useState(true);

  return (
    <ContingencyProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader onShowBetaNotice={() => setBetaOpen(true)} />
          <ContingencyBanner />
          <div className="flex flex-1 flex-col">{children}</div>
        </SidebarInset>
        <BetaNoticeDialog open={betaOpen} onOpenChange={setBetaOpen} />
      </SidebarProvider>
    </ContingencyProvider>
  );
}
