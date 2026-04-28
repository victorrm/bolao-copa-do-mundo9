import { test, expect } from "@playwright/test";

test.describe("login", () => {
  test("rejects invalid email format silently (generic message)", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder(/email/i).fill("not-allowed@other.com");
    await page.getByRole("button", { name: /receber link/i }).click();
    await expect(page.getByText(/Se este email puder acessar/i)).toBeVisible({ timeout: 5000 });
  });

  test("accepts allowed domain and shows generic confirmation", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder(/email/i).fill("alice@e2e.test");
    await page.getByRole("button", { name: /receber link/i }).click();
    await expect(page.getByText(/Se este email puder acessar/i)).toBeVisible({ timeout: 5000 });
  });
});
