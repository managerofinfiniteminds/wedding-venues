
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

export interface VenueSearchParams {
  q?: string;
  city?: string | string[];
  region?: string | string[];
  type?: string | string[];
  style?: string | string[];
  sort?: string;
  page?: string;
}

export function toArray(val: string | string[] | undefined): string[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

export function buildFilterUrl(basePath: string, currentParams: VenueSearchParams, toggleKey: string, toggleValue: string): string {
  const params = new URLSearchParams();
  Object.entries(currentParams).forEach(([k, v]) => {
    if (k === toggleKey) return;
    toArray(v as string | string[]).forEach(val => params.append(k, val));
  });

  const current = toArray(currentParams[toggleKey as keyof VenueSearchParams]);
  const isActive = current.includes(toggleValue);
  const newList = isActive ? current.filter(v => v !== toggleValue) : [...current, toggleValue];
  newList.forEach(v => params.append(toggleKey, v));

  // Reset page on filter change
  params.delete('page');

  return `${basePath}?${params.toString()}`;
}
