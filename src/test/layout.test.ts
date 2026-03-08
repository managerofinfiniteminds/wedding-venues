/**
 * layout.test.ts
 *
 * Tests for root layout logic:
 * - Host-based internal detection (shouldShowNav)
 * - Standalone route group file existence
 *
 * The old isStandalone/x-pathname approach has been removed.
 * Standalone pages now live in src/app/(standalone)/ and use their own
 * layout that includes <html><body> — fully replacing the root layout for
 * those routes.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { shouldShowNav } from "@/lib/layoutUtils";

const PROJECT_ROOT = path.resolve(__dirname, "../../");

describe("Host-based internal detection", () => {
  it("detects internal.greenbowtie.com as internal", () => {
    expect(shouldShowNav("internal.greenbowtie.com")).toBe(false);
  });

  it("detects internal.localhost as internal in dev", () => {
    expect(shouldShowNav("internal.localhost")).toBe(false);
  });

  it("does NOT flag greenbowtie.com as internal", () => {
    expect(shouldShowNav("greenbowtie.com")).toBe(true);
  });

  it("does NOT flag www.greenbowtie.com as internal", () => {
    expect(shouldShowNav("www.greenbowtie.com")).toBe(true);
  });

  it("handles empty host gracefully — defaults to showing nav", () => {
    expect(shouldShowNav("")).toBe(true);
  });

  it("handles undefined-like empty string gracefully", () => {
    expect(shouldShowNav("")).toBe(true);
  });
});

describe("Standalone route group", () => {
  it("privacy page exists in (standalone) group", () => {
    const filePath = path.join(PROJECT_ROOT, "src/app/(standalone)/privacy/page.tsx");
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("terms page exists in (standalone) group", () => {
    const filePath = path.join(PROJECT_ROOT, "src/app/(standalone)/terms/page.tsx");
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("contact page exists in (standalone) group", () => {
    const filePath = path.join(PROJECT_ROOT, "src/app/(standalone)/contact/page.tsx");
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("(standalone) layout exists", () => {
    const filePath = path.join(PROJECT_ROOT, "src/app/(standalone)/layout.tsx");
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("(standalone) layout contains <html — it replaces root layout", () => {
    const filePath = path.join(PROJECT_ROOT, "src/app/(standalone)/layout.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("<html");
    expect(content).toContain("<body");
  });

  it("privacy does NOT exist in the old location", () => {
    const oldPath = path.join(PROJECT_ROOT, "src/app/privacy/page.tsx");
    expect(fs.existsSync(oldPath)).toBe(false);
  });

  it("terms does NOT exist in the old location", () => {
    const oldPath = path.join(PROJECT_ROOT, "src/app/terms/page.tsx");
    expect(fs.existsSync(oldPath)).toBe(false);
  });

  it("contact does NOT exist in the old location", () => {
    const oldPath = path.join(PROJECT_ROOT, "src/app/contact/page.tsx");
    expect(fs.existsSync(oldPath)).toBe(false);
  });
});
