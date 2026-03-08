/**
 * navVisibility.test.ts
 *
 * Unit tests for the shouldShowNav utility.
 * This function replaced the old isStandalone/x-pathname approach.
 *
 * Nav visibility is now determined solely by the host header:
 * - internal.* hosts → hide Nav/Footer (staff dashboard)
 * - All other hosts → show Nav/Footer
 * - Standalone pages (privacy/terms/contact) use their own route group
 *   layout and never reach the root layout's Nav/Footer rendering.
 */

import { describe, it, expect } from "vitest";
import { shouldShowNav } from "@/lib/layoutUtils";

describe("shouldShowNav", () => {
  it("shows nav on greenbowtie.com", () => {
    expect(shouldShowNav("greenbowtie.com")).toBe(true);
  });

  it("shows nav on empty host (fallback — default open)", () => {
    expect(shouldShowNav("")).toBe(true);
  });

  it("hides nav on internal.greenbowtie.com", () => {
    expect(shouldShowNav("internal.greenbowtie.com")).toBe(false);
  });

  it("hides nav on internal.localhost", () => {
    expect(shouldShowNav("internal.localhost")).toBe(false);
  });

  it("shows nav on www.greenbowtie.com", () => {
    expect(shouldShowNav("www.greenbowtie.com")).toBe(true);
  });

  it("shows nav on localhost (local dev)", () => {
    expect(shouldShowNav("localhost:3000")).toBe(true);
  });

  it("shows nav on staging.greenbowtie.com", () => {
    expect(shouldShowNav("staging.greenbowtie.com")).toBe(true);
  });

  it("hides nav on any internal.* subdomain", () => {
    expect(shouldShowNav("internal.staging.greenbowtie.com")).toBe(false);
  });

  it("returns boolean true/false (not truthy/falsy)", () => {
    expect(shouldShowNav("greenbowtie.com")).toStrictEqual(true);
    expect(shouldShowNav("internal.greenbowtie.com")).toStrictEqual(false);
  });
});
