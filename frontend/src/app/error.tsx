"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { isChunkError } from "@/components/shared/chunk-guard";

const RELOAD_KEY = "chunk-reload-ts";
const RELOAD_COOLDOWN_MS = 15_000;

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const chunk = isChunkError(error);

  useEffect(() => {
    if (!chunk) return;
    try {
      const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
      if (Date.now() - last < RELOAD_COOLDOWN_MS) return;
      sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    } catch {
      // fall through
    }
    window.location.reload();
  }, [chunk]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold">
        {chunk ? "Actualizando la aplicación…" : "Algo salió mal"}
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {chunk
          ? "Se publicó una versión nueva. Recargando para traer los archivos más recientes."
          : "Ocurrió un error inesperado. Intenta de nuevo."}
      </p>
      <div className="flex gap-2">
        <Button onClick={() => window.location.reload()}>Recargar</Button>
        {!chunk ? (
          <Button variant="outline" onClick={() => reset()}>
            Reintentar
          </Button>
        ) : null}
      </div>
    </div>
  );
}
