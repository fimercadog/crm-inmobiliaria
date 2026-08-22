"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/shared/loading-state";
import { useAppSelector } from "@/hooks/redux";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const status = useAppSelector((state) => state.auth.status);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <LoadingState rows={3} />
      </div>
    );
  }

  return <>{children}</>;
}
