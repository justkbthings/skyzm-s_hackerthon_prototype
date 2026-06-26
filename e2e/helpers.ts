import { test, expect, Page } from "@playwright/test";

export const TEST_ACCOUNTS = [
  { email: "nomzamo@example.com", name: "Nomzamo", password: "password123" },
  { email: "mother@example.com", name: "Mother", password: "password123" },
  { email: "jane@example.com", name: "Jane", password: "password123" },
  { email: "kamau@example.com", name: "Kamau", password: "password123" },
  { email: "thabo@example.com", name: "Thabo", password: "password123" },
] as const;

export async function loginAs(
  page: Page,
  email: string,
  password = "password123"
) {
  await page.goto("/");
  await expect(page.getByTestId("login-screen")).toBeVisible({ timeout: 30_000 });
  await page.getByTestId("login-email").fill(email);
  await page.getByTestId("login-password").fill(password);
  await page.getByTestId("login-submit").click();
  await expect(page.getByTestId("home-screen")).toBeVisible({ timeout: 20_000 });
}

export async function logout(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem("community_remit_token");
  });
  await page.goto("/");
  await expect(page.getByTestId("login-screen")).toBeVisible({ timeout: 20_000 });
}
