import { expect, test } from "@playwright/test";

test.describe("observatory v0.1 idle frame", () => {
  test("loads / and renders the pentagram canvas within 3s", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const canvas = page.getByTestId("pentagram-canvas");
    await expect(canvas).toBeVisible({ timeout: 3000 });
    const inner = canvas.locator("canvas");
    await expect(inner).toBeVisible({ timeout: 3000 });
  });

  test("kit landing preserved at /kit", async ({ page }) => {
    await page.goto("/kit", { waitUntil: "networkidle" });
    await expect(page.getByAltText("purupuru").first()).toBeVisible();
    await expect(page.getByText("kit baseline · solana frontier")).toBeVisible();
  });
});
