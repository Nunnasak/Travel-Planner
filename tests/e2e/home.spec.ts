import { expect, test } from "@playwright/test";

test.describe("home page", () => {
  test("loads without errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    const response = await page.goto("/");

    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("main")).toBeAttached();
    expect(consoleErrors).toEqual([]);
  });
});
