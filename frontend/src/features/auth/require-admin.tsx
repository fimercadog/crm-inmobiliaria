"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/shared/loading-state";
import { usePermissions } from "@/hooks/use-permissions";
import { useAppSelector } from "@/hooks/redux";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const status = useAppSelector((state) => state.auth.status);
  const { isAdmin } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [status, isAdmin, router]);

  if (status !== "authenticated" || !isAdmin) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <LoadingState rows={3} />
      </div>
    );
  }

  return <>{children}</>;
}
