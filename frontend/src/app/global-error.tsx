"use client";

import { useEffect } from "react";
import { isChunkError } from "@/components/shared/chunk-guard";

const RELOAD_KEY = "chunk-reload-ts";
const RELOAD_COOLDOWN_MS = 15_000;

/**
 * Last-resort boundary: replaces the whole document when an error escapes the
 * root layout. Styling is inline because the global stylesheet may itself be
 * the asset that failed to load.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const chunk = isChunkError(error);

  useEffect(() => {
    if (!chunk) return;
    try {
      const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
      if (Date.now() - last < RELOAD_COOLDOWN_MS) return;
      sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    } catch {
      // fall through to reload
    }
    window.location.reload();
  }, [chunk]);

  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", background: "#0f172a", color: "#f8fafc" }}>
        <main style={{ minHeight: "100svh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>
            {chunk ? "Actualizando la aplicación…" : "Algo salió mal"}
          </h1>
          <p style={{ maxWidth: 420, color: "#cbd5e1", lineHeight: 1.6, margin: 0 }}>
            {chunk
              ? "Se publicó una versión nueva. Recargando para traer los archivos más recientes."
              : "Ocurrió un error inesperado. Intenta de nuevo."}
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: "10px 18px", borderRadius: 9999, border: "none", background: "#f8fafc", color: "#0f172a", fontWeight: 600, cursor: "pointer" }}
            >
              Recargar
            </button>
            {!chunk ? (
              <button
                onClick={() => reset()}
                style={{ padding: "10px 18px", borderRadius: 9999, border: "1px solid #475569", background: "transparent", color: "#f8fafc", fontWeight: 600, cursor: "pointer" }}
              >
                Reintentar
              </button>
            ) : null}
          </div>
        </main>
      </body>
    </html>
  );
}
