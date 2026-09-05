import { test, expect, type Page } from "@playwright/test";

/**
 * Full contingency lifecycle, against a real backend (not mocked) — this is
 * the critical flow from the brief: normal mode -> activate -> operate on the
 * enabled module while everything else goes read-only -> the operation stays
 * local until synced -> deactivation is blocked with pending work -> sync
 * replays through the real API -> deactivation succeeds once caught up.
 *
 * Requires: `php artisan serve` (backend/, port 8000) and this frontend
 * built and served (`npm run build && npm run start`, port 3000) — see
 * playwright.config.ts.
 */

const API = "http://127.0.0.1:8000/api/v1";

async function login(page: Page, email: string) {
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', "password");
  await page.getByRole("button", { name: /iniciar sesión/i }).click();
  await page.waitForURL("**/dashboard", { timeout: 15_000 });

  const betaDismiss = page.getByRole("button", { name: "Entendido" });
  if (await betaDismiss.isVisible().catch(() => false)) await betaDismiss.click();
}

// The auth token now lives only in an httpOnly cookie (never localStorage),
// so these page-context fetches rely on the browser attaching it — same as
// the app's own axios instance does — instead of reading/forwarding it as a
// Bearer header. `credentials: "include"` is required since the backend
// (127.0.0.1:8000) is a different origin than the frontend under test.
async function closeAnyActiveSession(page: Page) {
  await page.evaluate(async (apiUrl) => {
    const status = await fetch(`${apiUrl}/contingency/status`, {
      credentials: "include",
    }).then((r) => r.json());
    if (status.data.active) {
      await fetch(`${apiUrl}/contingency/deactivate`, {
        method: "POST",
        credentials: "include",
      });
    }
  }, API);
}

test.describe("Contingency mode — full lifecycle", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, "admin@crm.test");
    await closeAnyActiveSession(page);
  });

  test("normal mode: no banner, writes allowed everywhere", async ({ page }) => {
    await expect(page.getByText("MODO CONTINGENCIA ACTIVO")).toHaveCount(0);

    await page.goto("/properties", { waitUntil: "networkidle" });
    await expect(page.locator('a[href="/properties/new"]')).toHaveCount(2);
  });

  test("activate -> offline create -> pending -> sync -> deactivate", async ({ page }) => {
    // 1. Activate with only "Seguimientos" enabled
    await page.goto("/settings/contingency", { waitUntil: "networkidle" });
    await page.locator('div[role="button"]', { hasText: "Seguimientos" }).click();
    await page.getByRole("button", { name: "Activar modo contingencia" }).click();
    await page.getByRole("button", { name: "Activar contingencia" }).click();
    await expect(page.getByText("MODO CONTINGENCIA ACTIVO")).toBeVisible();

    // 2. Properties (not enabled) is forced read-only
    await page.goto("/properties", { waitUntil: "networkidle" });
    await expect(page.locator('a[href="/properties/new"]')).toHaveCount(0);
    await expect(page.getByText("Solo lectura durante modo contingencia")).toBeVisible();

    // 3. Creating a seguimiento queues locally instead of hitting the API
    const countBefore = await countActivities(page);
    await page.goto("/activities/new", { waitUntil: "networkidle" });
    await page.locator("#type").click();
    await page.getByRole("option", { name: "Llamada" }).click();
    await page.fill("#occurred_at", "2026-09-01T10:00");
    await page.fill("#notes", "Playwright E2E — seguimiento en contingencia");
    await page.getByRole("button", { name: "Registrar seguimiento" }).click();
    await page.waitForURL("**/activities", { timeout: 10_000 });
    expect(await countActivities(page)).toBe(countBefore);

    // 4. It shows up as Pendiente in the management screen
    await page.goto("/settings/contingency", { waitUntil: "networkidle" });
    await expect(page.getByText("Pendiente", { exact: true })).toBeVisible();

    // 5. Deactivation is blocked while it's unresolved
    await page.getByRole("button", { name: "Desactivar modo contingencia" }).click();
    await expect(page.getByText("No se puede desactivar todavía")).toBeVisible();
    await page.getByRole("button", { name: "Cancelar" }).click();

    // 6. Sync replays it through the real API — idempotently
    await page.getByRole("button", { name: "Sincronizar" }).click();
    await expect(page.getByText("Sincronizada", { exact: true })).toBeVisible();
    expect(await countActivities(page)).toBe(countBefore + 1);
    await expect(page.getByRole("button", { name: "Sincronizar" })).toHaveCount(0);

    // 7. With 0 pending, deactivation succeeds
    await page.getByRole("button", { name: "Desactivar modo contingencia" }).click();
    await page.getByRole("button", { name: "Desactivar contingencia" }).click();
    await expect(page.getByText("MODO CONTINGENCIA ACTIVO")).toHaveCount(0);

    // 8. Normal write access is restored everywhere
    await page.goto("/properties", { waitUntil: "networkidle" });
    await expect(page.locator('a[href="/properties/new"]')).toHaveCount(2);
  });

  test("only admin can activate contingency", async ({ page }) => {
    await page.context().clearCookies();
    await login(page, "agente@crm.test");

    await page.goto("/settings/contingency", { waitUntil: "networkidle" });
    // RequireAdmin bounces non-admins back to the dashboard.
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("discarding a transaction requires a reason and keeps the evidence", async ({ page }) => {
    await page.goto("/settings/contingency", { waitUntil: "networkidle" });
    await page.locator('div[role="button"]', { hasText: "Seguimientos" }).click();
    await page.getByRole("button", { name: "Activar modo contingencia" }).click();
    await page.getByRole("button", { name: "Activar contingencia" }).click();
    await expect(page.getByText("MODO CONTINGENCIA ACTIVO")).toBeVisible();

    await page.goto("/activities/new", { waitUntil: "networkidle" });
    await page.locator("#type").click();
    await page.getByRole("option", { name: "Nota" }).click();
    await page.fill("#occurred_at", "2026-09-01T11:00");
    await page.fill("#notes", "Playwright E2E — para descartar");
    await page.getByRole("button", { name: "Registrar seguimiento" }).click();
    await page.waitForURL("**/activities", { timeout: 10_000 });

    await page.goto("/settings/contingency", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Descartar" }).click();
    // Confirm button stays disabled without a reason.
    await expect(page.getByRole("button", { name: "Descartar", exact: true }).last()).toBeDisabled();
    await page.getByPlaceholder("Explica por qué se descarta esta transacción").fill("Duplicada por error");
    await page.getByRole("button", { name: "Descartar", exact: true }).last().click();

    await expect(page.getByText("Descartada", { exact: true })).toBeVisible();
    await expect(page.getByText("Motivo: Duplicada por error")).toBeVisible();

    // Deactivation now succeeds too — DISCARDED is a resolved final state.
    await page.getByRole("button", { name: "Desactivar modo contingencia" }).click();
    await page.getByRole("button", { name: "Desactivar contingencia" }).click();
    await expect(page.getByText("MODO CONTINGENCIA ACTIVO")).toHaveCount(0);
  });
});

async function countActivities(page: Page): Promise<number> {
  return page.evaluate(async (apiUrl) => {
    const res = await fetch(`${apiUrl}/activities?per_page=1`, {
      credentials: "include",
    });
    const body = await res.json();
    return body.data.meta.total as number;
  }, API);
}
