"use client";

import { useEffect } from "react";

/**
 * Recovers from stale-deploy chunk failures.
 *
 * After a deploy, a CDN edge that still serves the previous HTML points the
 * browser at `_next/static/chunks/*` files that no longer exist. The dynamic
 * import rejects with a ChunkLoadError and the affected UI never hydrates
 * (on /login that left a blank screen). A single hard reload fetches fresh
 * HTML — the auth routes are `force-dynamic`, so the reload is never cached —
 * and the new chunk manifest resolves.
 *
 * Guarded by a timestamp so a genuinely missing chunk can't cause a reload loop.
 */
const RELOAD_KEY = "chunk-reload-ts";
const RELOAD_COOLDOWN_MS = 15_000;

const CHUNK_ERROR = /ChunkLoadError|Loading chunk [\w-]+ failed|Failed to fetch dynamically imported module|error loading dynamically imported module/i;

function isChunkError(value: unknown): boolean {
  if (!value) return false;
  if (typeof value === "string") return CHUNK_ERROR.test(value);
  if (value instanceof Error) return value.name === "ChunkLoadError" || CHUNK_ERROR.test(value.message);
  return false;
}

function reloadOnce() {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
    if (Date.now() - last < RELOAD_COOLDOWN_MS) return;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // sessionStorage unavailable — still worth one reload attempt.
  }
  window.location.reload();
}

export function ChunkGuard() {
  useEffect(() => {
    function onError(event: ErrorEvent) {
      if (isChunkError(event.error) || isChunkError(event.message)) reloadOnce();
    }
    function onRejection(event: PromiseRejectionEvent) {
      if (isChunkError(event.reason)) reloadOnce();
    }
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}

export { isChunkError };
