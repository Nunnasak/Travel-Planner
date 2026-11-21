import { expect, test } from "@playwright/test";

test.describe("home page", () => {
  test("redirects to the discover page", async ({ request, baseURL }) => {
    const response = await request.get("/", { maxRedirects: 0 });

    expect(response.status()).toBe(307);
    const location = new URL(response.headers()["location"], baseURL);
    expect(location.pathname).toBe("/discover");
  });
});

test.describe("app shell", () => {
  test("loads the login page without errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    const response = await page.goto("/login");

    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "th");
    await expect(page.locator("main")).toBeAttached();
    expect(consoleErrors).toEqual([]);
  });
});
