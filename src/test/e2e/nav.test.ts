/**
 * nav.test.ts — E2E tests for Nav/Footer visibility
 *
 * Verifies the fix for the "Nav disappears on client-side navigation" bug.
 *
 * Root cause (fixed):
 *   The root layout used to read x-pathname from request headers to decide
 *   whether to show Nav. Middleware set x-pathname on hard requests, but on
 *   client-side (soft) navigation the header was stale — so if the user
 *   landed on /privacy first, Nav stayed hidden after navigating to /venues.
 *
 * Fix:
 *   - /privacy, /terms, /contact moved to src/app/(standalone)/ route group
 *   - (standalone)/layout.tsx provides its own <html><body> (no Nav/Footer)
 *   - Root layout no longer reads x-pathname; Nav visibility = host-only
 *
 * Run: npx playwright test src/test/e2e/nav.test.ts
 * (Requires a running dev server: npx next dev)
 */

import { test, expect } from "@playwright/test";

test.describe("Nav persistence across navigation", () => {
  test("nav visible on homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("nav")).toBeVisible();
  });

  test("nav visible on /venues", async ({ page }) => {
    await page.goto("/venues");
    await expect(page.locator("nav")).toBeVisible();
  });

  test("nav visible after soft-navigating from home to venues", async ({ page }) => {
    await page.goto("/");
    // Click the Browse Venues / Browse States link
    const link = page.locator('a[href="/venues"]').first();
    await link.click();
    await expect(page.locator("nav")).toBeVisible();
  });

  test("nav visible on state page /venues/california", async ({ page }) => {
    await page.goto("/venues/california");
    await expect(page.locator("nav")).toBeVisible();
  });

  test("footer visible on homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer")).toBeVisible();
  });

  test("footer visible on /venues after soft nav", async ({ page }) => {
    await page.goto("/");
    const link = page.locator('a[href="/venues"]').first();
    await link.click();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("nav NOT visible on /privacy (standalone layout)", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.locator("nav")).not.toBeVisible();
  });

  test("nav NOT visible on /terms", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.locator("nav")).not.toBeVisible();
  });

  test("nav NOT visible on /contact", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("nav")).not.toBeVisible();
  });

  test("nav reappears after navigating away from standalone page", async ({ page }) => {
    // THE KEY BUG TEST: land on /privacy, then hard-nav to /venues
    await page.goto("/privacy");
    await expect(page.locator("nav")).not.toBeVisible();
    await page.goto("/venues");
    await expect(page.locator("nav")).toBeVisible();
  });

  test("nav reappears after soft-navigating away from standalone page", async ({ page }) => {
    // Land on /privacy — no nav
    await page.goto("/privacy");
    await expect(page.locator("nav")).not.toBeVisible();
    // Use back-link on privacy page to go home (soft nav)
    const homeLink = page.locator('a[href="/"]').first();
    await homeLink.click();
    await expect(page.locator("nav")).toBeVisible();
  });
});

test.describe("Nav search functionality", () => {
  test("search box visible on desktop nav", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/venues");
    await expect(
      page
        .locator(
          "nav input[type='search'], nav input[placeholder*='city' i], nav input[placeholder*='search' i], nav input[placeholder*='venue' i]"
        )
        .first()
    ).toBeVisible();
  });

  test("mobile hamburger visible on small viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/venues");
    await expect(page.locator("button[aria-label='Toggle menu']")).toBeVisible();
  });

  test("mobile menu opens and closes", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/venues");
    await page.click("button[aria-label='Toggle menu']");
    await expect(page.locator("text=Browse All States")).toBeVisible();
    await page.click("button[aria-label='Toggle menu']");
    await expect(page.locator("text=Browse All States")).not.toBeVisible();
  });
});

test.describe("Claim flow E2E", () => {
  test("claim page returns 404 for nonexistent venue slug", async ({ page }) => {
    const res = await page.goto("/claim/nonexistent-venue-slug-xyz123");
    expect(res?.status()).toBe(404);
  });

  test("claim form renders for a valid venue slug", async ({ page }) => {
    // Navigate to California results to find a real slug
    await page.goto("/venues/california");
    const venueLink = page.locator("a[href*='/venues/california/']").first();
    const href = await venueLink.getAttribute("href");
    if (!href) {
      test.skip(true, "No venue links found on /venues/california");
      return;
    }
    const slug = href.split("/").pop();
    await page.goto(`/claim/${slug}`);
    await expect(page.locator("h1")).toContainText(/claim/i);
  });
});

test.describe("Inquiry form E2E", () => {
  test("inquiry form visible on venue detail page", async ({ page }) => {
    await page.goto("/venues/california");
    const venueLink = page.locator("a[href*='/venues/california/']").first();
    await venueLink.click();
    await expect(
      page.locator("form, [data-testid='inquiry-form']").first()
    ).toBeVisible({ timeout: 10000 });
  });
});
