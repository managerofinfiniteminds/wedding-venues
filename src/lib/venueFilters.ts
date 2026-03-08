
export const VENUE_TYPES = [
  "Vineyard & Winery",
  "Barn / Ranch",
  "Ballroom",
  "Golf Club",
  "Country Club",
  "Historic Estate",
  "Resort",
  "Hotel & Resort",
  "Garden",
  "Outdoor / Park",
  "Urban / Rooftop",
  "Museum & Gallery",
  "Restaurant",
  "Event Venue",
];

export const STYLES = ["Romantic", "Rustic", "Modern", "Garden", "Bohemian", "Industrial", "Vintage", "Elegant"];
export const PAGE_SIZE = 24;

export const AMENITIES: { key: string; label: string }[] = [
  { key: "hasBridalSuite", label: "Bridal Suite" },
  { key: "hasOutdoorSpace", label: "Outdoor Ceremony" },
  { key: "hasIndoorSpace", label: "Indoor Reception" },
  { key: "barSetup", label: "Full Bar" },
  { key: "onSiteCoordinator", label: "On-site Coordinator" },
  { key: "cateringKitchen", label: "Catering Kitchen" },
  { key: "tablesChairsIncluded", label: "Tables & Chairs" },
  { key: "adaCompliant", label: "ADA Accessible" },
];

export const PRICE_TIERS: { value: string; label: string; icon: string }[] = [
  { value: "budget", label: "Budget", icon: "💰" },
  { value: "moderate", label: "Moderate", icon: "💰💰" },
  { value: "luxury", label: "Luxury", icon: "💰💰💰" },
];

export const BUDGET_PRESETS: { label: string; min: string | undefined; max: string | undefined }[] = [
  { label: "Under $5k", min: undefined, max: "5000" },
  { label: "$5k–$10k", min: "5000", max: "10000" },
  { label: "$10k–$20k", min: "10000", max: "20000" },
  { label: "$20k–$30k", min: "20000", max: "30000" },
  { label: "$30k+", min: "30000", max: undefined },
];

export const GUEST_PRESETS: { label: string; min: string | undefined; max: string | undefined }[] = [
  { label: "Under 50", min: undefined, max: "50" },
  { label: "50–100", min: "50", max: "100" },
  { label: "100–200", min: "100", max: "200" },
  { label: "200–300", min: "200", max: "300" },
  { label: "300+", min: "300", max: undefined },
];

export interface VenueSearchParams {
  q?: string;
  city?: string | string[];
  region?: string | string[];
  type?: string | string[];
  style?: string | string[];
  sort?: string;
  page?: string;
  budgetMin?: string;
  budgetMax?: string;
  guestMin?: string;
  guestMax?: string;
  amenities?: string | string[];
  priceTier?: string;
}

export function toArray(val: string | string[] | undefined): string[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

/** Toggle a multi-value param (e.g. type, style, amenities). */
export function buildFilterUrl(
  basePath: string,
  currentParams: VenueSearchParams,
  toggleKey: string,
  toggleValue: string,
): string {
  const params = new URLSearchParams();
  Object.entries(currentParams).forEach(([k, v]) => {
    if (k === toggleKey) return;
    toArray(v as string | string[]).forEach((val) => params.append(k, val));
  });

  const current = toArray(currentParams[toggleKey as keyof VenueSearchParams] as string | string[]);
  const isActive = current.includes(toggleValue);
  const newList = isActive ? current.filter((v) => v !== toggleValue) : [...current, toggleValue];
  newList.forEach((v) => params.append(toggleKey, v));

  params.delete("page");
  return `${basePath}?${params.toString()}`;
}

/** Set or clear one or more scalar params (e.g. budgetMin, priceTier). Pass undefined to remove. */
export function buildCustomUrl(
  basePath: string,
  currentParams: VenueSearchParams,
  overrides: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  Object.entries(currentParams).forEach(([k, v]) => {
    if (k in overrides) return;
    toArray(v as string | string[]).forEach((val) => params.append(k, val));
  });
  Object.entries(overrides).forEach(([k, v]) => {
    if (v !== undefined && v !== "") params.set(k, v);
  });
  params.delete("page");
  return `${basePath}?${params.toString()}`;
}

export function formatBudgetLabel(min?: string, max?: string): string | null {
  if (!min && !max) return null;
  const fmt = (n: string) => `$${(parseInt(n) / 1000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Under ${fmt(max!)}`;
}

export function formatGuestLabel(min?: string, max?: string): string | null {
  if (!min && !max) return null;
  if (min && max) return `${min}–${max} guests`;
  if (min) return `${min}+ guests`;
  return `Under ${max} guests`;
}

/** Convert a city name to a URL-safe slug. E.g. "Los Angeles" → "los-angeles" */
export function cityToSlug(city: string): string {
  return city
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Always apply these filters on public venue queries
export const PUBLIC_VENUE_FILTER = { isPublished: true, isHidden: false, deletedAt: null } as const;
