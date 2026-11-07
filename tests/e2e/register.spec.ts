import { expect, type Page, test } from "@playwright/test";

async function fillForm(
  page: Page,
  values: { username?: string; email?: string; password?: string; confirm?: string },
) {
  if (values.username !== undefined) await page.getByLabel("Username").fill(values.username);
  if (values.email !== undefined) await page.getByLabel("Email", { exact: true }).fill(values.email);
  if (values.password !== undefined)
    await page.getByLabel("Password", { exact: true }).fill(values.password);
  if (values.confirm !== undefined)
    await page.getByLabel("Confirm password", { exact: true }).fill(values.confirm);
}

const valid = {
  username: "traveler",
  email: "traveler@example.com",
  password: "secret123",
  confirm: "secret123",
};

test.describe("register page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });

  test("renders the form", async ({ page }) => {
    await expect(page).toHaveTitle("Sign up · ไปเรื่อย");
    await expect(page.getByRole("heading", { name: "Sign up" })).toBeVisible();
    for (const label of ["Username", "Email", "Password", "Confirm password"]) {
      await expect(page.getByLabel(label, { exact: true })).toBeVisible();
    }
  });

  test("shows an error for every field on empty submit", async ({ page }) => {
    await page.getByRole("button", { name: "Sign up" }).click();

    await expect(page.getByText("Username must be at least 3 characters.")).toBeVisible();
    await expect(page.getByText("Enter your email.")).toBeVisible();
    await expect(page.getByText("Password must be at least 8 characters.")).toBeVisible();
    await expect(page.getByText("Re-enter your password.")).toBeVisible();
  });

  test("rejects a username that is too long", async ({ page }) => {
    await fillForm(page, { ...valid, username: "a".repeat(31) });
    await page.getByRole("button", { name: "Sign up" }).click();

    await expect(page.getByText("Username must be 30 characters or fewer.")).toBeVisible();
  });

  test("rejects mismatched passwords", async ({ page }) => {
    await fillForm(page, { ...valid, confirm: "different123" });
    await page.getByRole("button", { name: "Sign up" }).click();

    await expect(page.getByText("Passwords do not match.")).toBeVisible();
  });

  test("sends the account and redirects to /login on success", async ({ page }) => {
    let body: unknown;
    await page.route("**/api/auth/register", async (route) => {
      body = route.request().postDataJSON();
      await route.fulfill({ status: 201, json: {} });
    });

    await fillForm(page, { ...valid, username: "  traveler  " });
    await page.getByRole("button", { name: "Sign up" }).click();

    await expect(page).toHaveURL(/\/login$/);
    expect(body).toEqual({
      username: "traveler",
      email: "traveler@example.com",
      password: "secret123",
    });
  });

  test("shows an error when the account already exists", async ({ page }) => {
    await page.route("**/api/auth/register", (route) => route.fulfill({ status: 409, json: {} }));

    await fillForm(page, valid);
    await page.getByRole("button", { name: "Sign up" }).click();

    await expect(page.getByText("That email or username is already taken.")).toBeVisible();
    await expect(page).toHaveURL(/\/register$/);
  });

  test("shows field errors returned by the server instead of the generic message", async ({
    page,
  }) => {
    await page.route("**/api/auth/register", (route) =>
      route.fulfill({ status: 409, json: { errors: { username: "That username is taken." } } }),
    );

    await fillForm(page, valid);
    await page.getByRole("button", { name: "Sign up" }).click();

    await expect(page.getByText("That username is taken.")).toBeVisible();
    await expect(page.getByLabel("Username")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByText("That email or username is already taken.")).toBeHidden();
  });

  test("shows an error when the server cannot be reached", async ({ page }) => {
    await page.route("**/api/auth/register", (route) => route.abort("failed"));

    await fillForm(page, valid);
    await page.getByRole("button", { name: "Sign up" }).click();

    await expect(
      page.getByText("Cannot reach the server. Check your connection and try again."),
    ).toBeVisible();
  });

  test("links to the login page", async ({ page }) => {
    await page.getByRole("link", { name: "Log in" }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
  });
});
