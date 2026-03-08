/**
 * layoutUtils.ts
 *
 * Pure utility functions for root layout logic.
 * Extracted so they can be independently unit-tested.
 */

/**
 * Returns true if the Nav/Footer should be shown based on the request host.
 * Hosts that start with "internal." are staff-only dashboards — no Nav/Footer.
 *
 * @param host - The effective host header value (x-forwarded-host or host)
 */
export function shouldShowNav(host: string): boolean {
  if (!host) return true;
  return !host.startsWith("internal.");
}
