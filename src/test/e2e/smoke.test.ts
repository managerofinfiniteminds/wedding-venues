/**
 * Smoke tests — run against the local dev server.
 * These catch broken pages, missing routes, and DB connection failures
 * that unit tests can't catch.
 *
 * Run: npx playwright test
 * Run with UI: npx playwright test --ui
 */

import { test, expect } from "@playwright/test";

test.describe("Green Bowtie smoke tests — standalone pages", () => {
  test("homepage loads", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(/Green Bowtie/);
  });

  test("/privacy loads (standalone layout — no nav)", async ({ page }) => {
    const res = await page.goto("/privacy");
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText(/privacy/i);
    await expect(page.locator("nav")).not.toBeVisible();
  });

  test("/terms loads (standalone layout — no nav)", async ({ page }) => {
    const res = await page.goto("/terms");
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText(/terms/i);
    await expect(page.locator("nav")).not.toBeVisible();
  });

  test("/contact loads (standalone layout — no nav)", async ({ page }) => {
    const res = await page.goto("/contact");
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText(/contact|get in touch/i);
    await expect(page.locator("nav")).not.toBeVisible();
  });
});

test.describe("Green Bowtie smoke tests", () => {

  test("US hub page loads with state cards", async ({ page }) => {
    await page.goto("/venues");
    await expect(page).toHaveTitle(/Green Bowtie/);
    await expect(page.getByText("Find Your Perfect Wedding Venue")).toBeVisible();
    // California card heading
    await expect(page.getByRole("heading", { name: "California" })).toBeVisible();
    // Coming soon states present
    await expect(page.getByRole("heading", { name: "Texas" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Puerto Rico" })).toBeVisible();
    // Venue count shown on CA card
    await expect(page.getByText(/\d+ venues/).first()).toBeVisible();
  });

  test("California results page loads venues", async ({ page }) => {
    await page.goto("/venues/california");
    await expect(page).toHaveTitle(/California/);
    await expect(page.getByText(/venues in California/)).toBeVisible();
    // At least one venue card renders
    await expect(page.locator(".rounded-2xl").first()).toBeVisible();
    // List/Map toggle present
    await expect(page.getByText("List")).toBeVisible();
  });

  test("California results page filters work", async ({ page }) => {
    await page.goto("/venues/california?region=Napa+Valley");
    await expect(page.getByText(/venues in California/)).toBeVisible();
  });

  test("Coming soon state page renders correctly", async ({ page }) => {
    await page.goto("/venues/texas");
    await expect(page.getByRole("heading", { name: "Texas" })).toBeVisible();
    await expect(page.getByText("Coming Soon").first()).toBeVisible();
    await expect(page.getByText("Browse California Venues")).toBeVisible();
  });

  test("Legacy venue URL redirects to california", async ({ page }) => {
    const response = await page.goto("/venues/some-venue-slug");
    expect(response?.url()).toContain("/venues/california/some-venue-slug");
  });

  test("Map page loads", async ({ page }) => {
    await page.goto("/map");
    await expect(page).toHaveTitle(/Map/);
    await expect(page.locator("div[style*='height']").first()).toBeVisible();
  });

  test("sitemap.xml is accessible and contains venue URLs", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    expect(response?.status()).toBe(200);
    const content = await page.content();
    expect(content).toContain("greenbowtie.com");
    expect(content).toContain("/venues/california");
  });

  test("robots.txt is accessible", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.status()).toBe(200);
    const content = await page.content();
    expect(content).toContain("sitemap");
  });

  test("Nav has Browse States link", async ({ page }) => {
    await page.goto("/venues/california");
    await expect(page.getByRole("link", { name: "Browse States" })).toBeVisible();
    // Map link in nav (title attribute)
    await expect(page.getByTitle("Map View")).toBeVisible();
    // Floating View Map button
    await expect(page.getByRole("link", { name: "View Map" })).toBeVisible();
  });

  test("404 for truly unknown routes", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist-anywhere");
    expect(response?.status()).toBe(404);
  });

});
