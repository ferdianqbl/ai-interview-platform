import { test, expect } from "@playwright/test";

test.describe("AI Interview Platform E2E Flows", () => {
  test.beforeEach(async ({ page }) => {
    // Perform login before each test
    await page.goto("/login");
    await page.fill("#email", "admin@example.com");
    await page.fill("#password", "password123");
    await page.click("button[type='submit']");
    await page.waitForURL("**/assessments");
  });

  test("1. Assessments dashboard loads and lists assessments", async ({ page }) => {
    await expect(page.locator("h1")).toContainText(/Assessments/i);
    await expect(page.locator("body")).toContainText(/Senior Backend Engineer/i);
  });

  test("2. Navigating to assessment invite & candidate sessions", async ({ page }) => {
    await page.goto("/assessments/1/invite");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("body")).toContainText(/Candidates/i);
  });

  test("3. Navigating to candidate portfolio displays skill cards and evidence", async ({ page }) => {
    await page.goto("/assessments/1/sessions/1/portfolio");
    await expect(page.locator("h1")).toContainText(/Candidate Skill Portfolio/i);
    await expect(page.locator("body")).toContainText(/Target Competencies/i);
    await expect(page.locator("body")).toContainText(/Distributed Systems/i);
  });

  test("4. Navigating to Vacancies dashboard lists target roles", async ({ page }) => {
    await page.goto("/vacancies");
    await expect(page.locator("h1")).toContainText(/Vacancies/i);
    await expect(page.locator("body")).toContainText(/Senior Backend Engineer/i);
  });

  test("5. Fit/Gap report page displays comparison matrix or generating view", async ({ page }) => {
    await page.goto("/assessments/1/sessions/1/fitgap/1");
    await expect(page.locator("h1")).toContainText(/Role Fit & Gap Analysis/i);
  });
});
