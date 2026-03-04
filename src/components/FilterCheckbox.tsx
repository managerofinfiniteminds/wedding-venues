import Link from "next/link";
import { SearchParams, toArray, buildFilterUrl } from "../app/venues/page";

export function FilterCheckbox({
  name,
  value,
  label,
  count,
  checked,
  currentParams,
}: {
  name: string;
  value: string;
  label: string;
  count?: number;
  checked: boolean;
  currentParams: SearchParams;
}) {
    const href = buildFilterUrl(currentParams, name, value);

  return (
    <Link
      href={href}
      className={`flex items-center justify-between py-1 text-sm rounded px-1 hover:bg-gray-50 transition-colors ${checked ? "text-pink-700 font-medium" : "text-gray-700"}`}
    >
      <span className="flex items-center gap-2">
        <span className={`w-4 h-4 border rounded flex-shrink-0 flex items-center justify-center ${checked ? "bg-pink-700 border-pink-700" : "border-gray-300"}`}>
          {checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
        </span>
        {label}
      </span>
      {count !== undefined && <span className="text-gray-400 text-xs">{count}</span>}
    </Link>
  );
}