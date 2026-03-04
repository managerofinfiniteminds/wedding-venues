import Link from "next/link";
import { SearchParams, buildFilterUrl } from "../app/venues/page";

export function StylePill({
  style,
  active,
  currentParams,
}: {
  style: string;
  active: boolean;
  currentParams: SearchParams;
}) {
    const href = buildFilterUrl(currentParams, "style", style);

  return (
    <Link
      href={href}
      className={`text-xs px-3 py-1 rounded-full border transition-colors ${
        active
          ? "bg-pink-700 text-white border-pink-700"
          : "border-gray-300 text-gray-600 hover:border-pink-400"
      }`}
    >
      {style}
    </Link>
  );
}