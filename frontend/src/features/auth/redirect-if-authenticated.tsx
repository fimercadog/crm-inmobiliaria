"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/redux";

export function RedirectIfAuthenticated({ children }: { children: React.ReactNode }) {
  const status = useAppSelector((state) => state.auth.status);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  // Render the form for every state except "authenticated". Previously this
  // also hid it during "idle", so the form only existed once client JS had
  // hydrated — a chunk failure on /login then left a blank screen. An already
  // authenticated visitor sees the form for one frame before the effect above
  // redirects, which is a far better failure mode than nothing.
  if (status === "authenticated") {
    return null;
  }

  return <>{children}</>;
}
