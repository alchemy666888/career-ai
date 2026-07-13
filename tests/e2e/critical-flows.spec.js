import { test, expect } from "@playwright/test";
test("marketing page loads without live services", async ({ page }) => { await page.goto("/"); await expect(page.getByText(/AI Job Search|CareerAI/i).first()).toBeVisible(); });
