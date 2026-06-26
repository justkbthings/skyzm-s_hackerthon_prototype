import { defineConfig, devices } from "@playwright/test";

const MOBILE_URL = process.env.MOBILE_URL ?? "http://localhost:19006";
const API_URL = process.env.API_URL ?? "http://localhost:3001";

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: MOBILE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "mobile-chrome",
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: [
    {
      command: "npm run dev",
      cwd: "./backend",
      url: `${API_URL}/health`,
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: "npx expo start --web --port 19006",
      cwd: "./mobile",
      url: MOBILE_URL,
      reuseExistingServer: true,
      timeout: 180_000,
      env: {
        EXPO_PUBLIC_API_URL: API_URL,
      },
    },
  ],
});
