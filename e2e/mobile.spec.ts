import { test, expect } from "@playwright/test";
import {
  TEST_ACCOUNTS,
  loginAs,
  logout,
} from "./helpers";

let communityName = "";
let communitySlug = "";

test.describe.configure({ mode: "serial" });

test.describe("Community Remit mobile preview", () => {
  test("each of 5 demo accounts can sign in and reach home", async ({ page }) => {
    for (const account of TEST_ACCOUNTS) {
      await loginAs(page, account.email, account.password);
      await expect(page.getByTestId("home-greeting")).toContainText(account.name);
      await expect(page.getByTestId("home-balance")).toBeVisible();
      await logout(page);
    }
  });

  test("nomzamo creates a community with mother and kamau (3 members)", async ({
    page,
  }) => {
    communityName = `Hackathon Family Circle ${Date.now()}`;
    communitySlug = communityName.replace(/\s+/g, "-").toLowerCase();

    await loginAs(page, "nomzamo@example.com");

    await page.getByTestId("home-action-community").click();
    await expect(page.getByTestId("community-screen")).toBeVisible();

    await page.getByTestId("community-name-input").fill(communityName);
    await page.getByTestId("community-member-option-mother").click();
    await page.getByTestId("community-member-option-kamau").click();
    await page.getByTestId("community-create-button").click();

    await expect(page.getByTestId("community-create-success")).toBeVisible();
    await expect(page.getByTestId(`community-item-${communitySlug}`).first()).toBeVisible();

    await page.getByTestId(`community-item-${communitySlug}`).first().click();

    await expect(page.getByTestId("community-detail-name")).toHaveText(communityName);
    await expect(page.getByTestId("community-member-list")).toContainText("Nomzamo");
    await expect(page.getByTestId("community-member-list")).toContainText("Mother");
    await expect(page.getByTestId("community-member-list")).toContainText("Kamau");
  });

  test("other community members can see the shared community", async ({ page }) => {
    for (const email of ["mother@example.com", "kamau@example.com"] as const) {
      await loginAs(page, email);
      await page.getByTestId("home-action-community").click();
      await expect(page.getByTestId(`community-item-${communitySlug}`).first()).toBeVisible();
      await logout(page);
    }
  });

  test("community request can be created inside the group", async ({ page }) => {
    await loginAs(page, "nomzamo@example.com");
    await page.getByTestId("home-action-community").click();
    await page.getByTestId(`community-item-${communitySlug}`).first().click();

    await page.getByTestId("community-request-title").fill("Work dress for interview");
    await page.getByTestId("community-request-amount").fill("100");
    await page.getByTestId("community-request-submit").click();

    await expect(page.getByText("Work dress for interview")).toBeVisible();
  });
});
