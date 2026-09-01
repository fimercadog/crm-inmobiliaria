import { defineConfig } from "@playwright/test";

// Contingency mode's E2E suite needs both the real backend (SQLite, seeded
// demo users) and a production build of the frontend running — this project
// doesn't yet have a CI pipeline that could auto-boot Laravel, so `webServer`
// only starts the frontend. Run `php artisan serve` in backend/ yourself
// before `npx playwright test`.
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
});
