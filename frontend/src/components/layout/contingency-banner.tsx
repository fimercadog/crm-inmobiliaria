"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { useContingency } from "@/features/contingency/contingency-context";

const dateFormatter = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });

/** Persistent, impossible-to-miss indicator — per the brief, a user must
 * never be able to mistake contingency mode for normal operation. */
export function ContingencyBanner() {
  const { active, session, pendingCount, transactions } = useContingency();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (!active || !session) return null;

  // ROJO only for conflicts/failures — a plain queue of pending items is the
  // expected, healthy state of contingency mode, not itself a problem.
  const hasCriticalIssues = transactions.some((tx) => tx.status === "CONFLICT" || tx.status === "FAILED");

  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-1 border-b px-4 py-2 text-sm ${
        hasCriticalIssues
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-warning/30 bg-warning/10 text-warning-foreground"
      }`}
    >
      <span className="flex items-center gap-1.5 font-semibold">
        <TriangleAlert className="size-4" />
        MODO CONTINGENCIA ACTIVO
      </span>
      <span>Módulos habilitados: {session.enabled_modules.join(", ")}</span>
      <span>Transacciones pendientes: {pendingCount}</span>
      <span>Conexión: {online ? "en línea" : "sin conexión"}</span>
      <span>
        Activado por {session.activated_by} — {dateFormatter.format(new Date(session.activated_at))}
      </span>
      <Link href="/settings/contingency" className="ml-auto underline underline-offset-2">
        Gestionar
      </Link>
    </div>
  );
}
