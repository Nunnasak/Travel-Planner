import { expect, test } from "@playwright/test";

// The auth API routes don't exist yet, so tests that submit valid data stub
// POST /api/auth/login with page.route().

test.describe("login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("renders the form", async ({ page }) => {
    await expect(page).toHaveTitle("Login · ไปเรื่อย");
    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
    await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Login" })).toBeEnabled();
  });

  test("shows required-field errors on empty submit", async ({ page }) => {
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByText("Enter your email.")).toBeVisible();
    await expect(page.getByText("Enter your password.")).toBeVisible();
    await expect(page.getByLabel("Email", { exact: true })).toHaveAttribute("aria-invalid", "true");
  });

  test("rejects an invalid email and clears the error on edit", async ({ page }) => {
    const email = page.getByLabel("Email", { exact: true });
    await email.fill("not-an-email");
    await page.getByLabel("Password", { exact: true }).fill("secret123");
    await page.getByRole("button", { name: "Login" }).click();

    const error = page.getByText("Enter a valid email, like name@example.com.");
    await expect(error).toBeVisible();

    await email.fill("name@example.com");
    await expect(error).toBeHidden();
  });

  test("toggles password visibility", async ({ page }) => {
    const password = page.getByLabel("Password", { exact: true });
    await expect(password).toHaveAttribute("type", "password");

    await page.getByRole("button", { name: "Show password" }).click();
    await expect(password).toHaveAttribute("type", "text");

    await page.getByRole("button", { name: "Hide password" }).click();
    await expect(password).toHaveAttribute("type", "password");
  });

  test("sends trimmed credentials and redirects to /trips on success", async ({ page }) => {
    let body: unknown;
    await page.route("**/api/auth/login", async (route) => {
      body = route.request().postDataJSON();
      await route.fulfill({ status: 200, json: {} });
    });

    await page.getByLabel("Email", { exact: true }).fill("  name@example.com  ");
    await page.getByLabel("Password", { exact: true }).fill("secret123");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page).toHaveURL(/\/trips$/);
    expect(body).toEqual({ email: "name@example.com", password: "secret123" });
  });

  test("shows an error when the credentials are wrong", async ({ page }) => {
    await page.route("**/api/auth/login", (route) => route.fulfill({ status: 401, json: {} }));

    await page.getByLabel("Email", { exact: true }).fill("name@example.com");
    await page.getByLabel("Password", { exact: true }).fill("wrong-password");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByText("Email or password is incorrect.")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("shows field errors returned by the server", async ({ page }) => {
    await page.route("**/api/auth/login", (route) =>
      route.fulfill({ status: 422, json: { errors: { email: "No account uses this email." } } }),
    );

    await page.getByLabel("Email", { exact: true }).fill("name@example.com");
    await page.getByLabel("Password", { exact: true }).fill("secret123");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByText("No account uses this email.")).toBeVisible();
  });

  test("links to the sign-up page", async ({ page }) => {
    await page.getByRole("link", { name: "Sign up" }).click();

    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole("heading", { name: "Sign up" })).toBeVisible();
  });
});
