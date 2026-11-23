import { expect, type Page, test } from "@playwright/test";

async function fillForm(
  page: Page,
  values: { username?: string; email?: string; password?: string; confirm?: string },
) {
  if (values.username !== undefined) await page.getByLabel("ชื่อผู้ใช้").fill(values.username);
  if (values.email !== undefined) await page.getByLabel("อีเมล", { exact: true }).fill(values.email);
  if (values.password !== undefined)
    await page.getByLabel("รหัสผ่าน", { exact: true }).fill(values.password);
  if (values.confirm !== undefined)
    await page.getByLabel("ยืนยันรหัสผ่าน", { exact: true }).fill(values.confirm);
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
    await expect(page).toHaveTitle("สมัครสมาชิก · ไปเรื่อย");
    await expect(page.getByRole("heading", { name: "สมัครสมาชิก" })).toBeVisible();
    for (const label of ["ชื่อผู้ใช้", "อีเมล", "รหัสผ่าน", "ยืนยันรหัสผ่าน"]) {
      await expect(page.getByLabel(label, { exact: true })).toBeVisible();
    }
  });

  test("shows an error for every field on empty submit", async ({ page }) => {
    await page.getByRole("button", { name: "สมัครสมาชิก", exact: true }).click();

    await expect(page.getByText("ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร")).toBeVisible();
    await expect(page.getByText("ใส่อีเมล", { exact: true })).toBeVisible();
    await expect(page.getByText("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")).toBeVisible();
    await expect(page.getByText("ใส่รหัสผ่านอีกครั้ง", { exact: true })).toBeVisible();
  });

  test("rejects a username that is too long", async ({ page }) => {
    await fillForm(page, { ...valid, username: "a".repeat(31) });
    await page.getByRole("button", { name: "สมัครสมาชิก", exact: true }).click();

    await expect(page.getByText("ชื่อผู้ใช้ต้องไม่เกิน 30 ตัวอักษร")).toBeVisible();
  });

  test("rejects mismatched passwords", async ({ page }) => {
    await fillForm(page, { ...valid, confirm: "different123" });
    await page.getByRole("button", { name: "สมัครสมาชิก", exact: true }).click();

    await expect(page.getByText("รหัสผ่านทั้งสองช่องไม่ตรงกัน")).toBeVisible();
  });

  test("sends the account and redirects to /login on success", async ({ page }) => {
    let body: unknown;
    await page.route("**/api/auth/register", async (route) => {
      body = route.request().postDataJSON();
      await route.fulfill({ status: 201, json: {} });
    });

    await fillForm(page, { ...valid, username: "  traveler  " });
    await page.getByRole("button", { name: "สมัครสมาชิก", exact: true }).click();

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
    await page.getByRole("button", { name: "สมัครสมาชิก", exact: true }).click();

    await expect(page.getByText("อีเมลหรือชื่อผู้ใช้นี้มีคนใช้แล้ว")).toBeVisible();
    await expect(page).toHaveURL(/\/register$/);
  });

  test("shows field errors returned by the server instead of the generic message", async ({
    page,
  }) => {
    await page.route("**/api/auth/register", (route) =>
      route.fulfill({ status: 409, json: { errors: { username: "That username is taken." } } }),
    );

    await fillForm(page, valid);
    await page.getByRole("button", { name: "สมัครสมาชิก", exact: true }).click();

    await expect(page.getByText("That username is taken.")).toBeVisible();
    await expect(page.getByLabel("ชื่อผู้ใช้")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByText("อีเมลหรือชื่อผู้ใช้นี้มีคนใช้แล้ว")).toBeHidden();
  });

  test("shows an error when the server cannot be reached", async ({ page }) => {
    await page.route("**/api/auth/register", (route) => route.abort("failed"));

    await fillForm(page, valid);
    await page.getByRole("button", { name: "สมัครสมาชิก", exact: true }).click();

    await expect(
      page.getByText("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง"),
    ).toBeVisible();
  });

  test("links to the login page", async ({ page }) => {
    await page.getByRole("link", { name: "เข้าสู่ระบบ" }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "เข้าสู่ระบบ" })).toBeVisible();
  });
});
