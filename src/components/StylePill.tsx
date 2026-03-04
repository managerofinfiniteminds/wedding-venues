import Link from "next/link";
import { VenueSearchParams, buildFilterUrl } from "@/lib/venueFilters";

export function StylePill({
  style,
  active,
  currentParams,
  basePath,
}: {
  style: string;
  active: boolean;
  currentParams: VenueSearchParams;
  basePath: string;
}) {
  const href = buildFilterUrl(basePath, currentParams, "style", style);

  return (
    <Link
      href={href}
      className={`text-xs px-3 py-1 rounded-full border transition-colors whitespace-nowrap ${
        active
          ? "bg-pink-700 text-white border-pink-700"
          : "border-gray-300 text-gray-600 hover:border-pink-400"
      }`}
    >
      {style}
    </Link>
  );
}
