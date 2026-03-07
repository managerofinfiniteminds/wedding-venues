import Link from "next/link";
import {
  VenueSearchParams,
  VENUE_TYPES,
  STYLES,
  AMENITIES,
  PRICE_TIERS,
  BUDGET_PRESETS,
  GUEST_PRESETS,
  toArray,
  buildFilterUrl,
  buildCustomUrl,
} from "@/lib/venueFilters";
import type { StateConfig } from "@/lib/states";
import { BudgetGuestInputs } from "./BudgetGuestInputs";

interface FilterPanelProps {
  basePath: string;
  params: VenueSearchParams;
  stateConfig: StateConfig;
  regionCountMap: Record<string, number>;
  typeCountMap: Record<string, number>;
  hasFilters: boolean;
}

export function FilterPanel({
  basePath,
  params,
  stateConfig,
  regionCountMap,
  typeCountMap,
  hasFilters,
}: FilterPanelProps) {
  const regions = toArray(params.region);
  const types = toArray(params.type);
  const styles = toArray(params.style);
  const amenities = toArray(params.amenities);
  const priceTier = params.priceTier;
  const budgetMin = params.budgetMin;
  const budgetMax = params.budgetMax;
  const guestMin = params.guestMin;
  const guestMax = params.guestMax;

  function isBudgetPresetActive(min: string | undefined, max: string | undefined) {
    return (budgetMin ?? undefined) === min && (budgetMax ?? undefined) === max;
  }

  function isGuestPresetActive(min: string | undefined, max: string | undefined) {
    return (guestMin ?? undefined) === min && (guestMax ?? undefined) === max;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-gray-800">Filter {stateConfig.name} Venues</h3>
        {hasFilters && (
          <Link href={basePath} className="text-xs text-pink-600 hover:underline">
            Clear all
          </Link>
        )}
      </div>

      <div>
        {/* Region */}
        {Object.keys(stateConfig.regions).length > 0 && (
          <FilterSection title="Region">
            {Object.keys(stateConfig.regions).map((r) => (
              <FilterCheckbox
                key={r}
                label={r}
                count={regionCountMap[r]}
                checked={regions.includes(r)}
                href={buildFilterUrl(basePath, params, "region", r)}
              />
            ))}
          </FilterSection>
        )}

        {/* Venue Type */}
        <FilterSection title="Venue Type">
          {VENUE_TYPES.map((t) => (
            <FilterCheckbox
              key={t}
              label={t}
              count={typeCountMap[t] ?? 0}
              checked={types.includes(t)}
              href={buildFilterUrl(basePath, params, "type", t)}
            />
          ))}
        </FilterSection>

        {/* Price Tier */}
        <FilterSection title="Price Tier">
          <div className="flex flex-wrap gap-2 pt-1">
            {PRICE_TIERS.map(({ value, label, icon }) => {
              const isActive = priceTier === value;
              const href = buildCustomUrl(basePath, params, {
                priceTier: isActive ? undefined : value,
              });
              return (
                <Link
                  key={value}
                  href={href}
                  className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-[#3b6341] text-white border-[#3b6341]"
                      : "bg-white text-gray-600 border-gray-300 hover:border-[#3b6341] hover:text-[#3b6341]"
                  }`}
                >
                  <span>{icon}</span> {label}
                </Link>
              );
            })}
          </div>
        </FilterSection>

        {/* Budget Range */}
        <FilterSection title="Budget Range">
          <div className="flex flex-wrap gap-1.5 pt-1 mb-3">
            {BUDGET_PRESETS.map(({ label, min, max }) => {
              const isActive = isBudgetPresetActive(min, max);
              const href = buildCustomUrl(basePath, params, {
                budgetMin: isActive ? undefined : min,
                budgetMax: isActive ? undefined : max,
              });
              return (
                <Link
                  key={label}
                  href={href}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-[#3b6341] text-white border-[#3b6341]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#3b6341] hover:text-[#3b6341]"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
          <BudgetGuestInputs type="budget" currentMin={budgetMin} currentMax={budgetMax} />
        </FilterSection>

        {/* Guest Count */}
        <FilterSection title="Guest Count">
          <div className="flex flex-wrap gap-1.5 pt-1 mb-3">
            {GUEST_PRESETS.map(({ label, min, max }) => {
              const isActive = isGuestPresetActive(min, max);
              const href = buildCustomUrl(basePath, params, {
                guestMin: isActive ? undefined : min,
                guestMax: isActive ? undefined : max,
              });
              return (
                <Link
                  key={label}
                  href={href}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-[#3b6341] text-white border-[#3b6341]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#3b6341] hover:text-[#3b6341]"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
          <BudgetGuestInputs type="guest" currentMin={guestMin} currentMax={guestMax} />
        </FilterSection>

        {/* Amenities */}
        <FilterSection title="Amenities">
          {AMENITIES.map(({ key, label }) => (
            <FilterCheckbox
              key={key}
              label={label}
              checked={amenities.includes(key)}
              href={buildFilterUrl(basePath, params, "amenities", key)}
            />
          ))}
        </FilterSection>

        {/* Style */}
        <FilterSection title="Style">
          {STYLES.map((s) => (
            <FilterCheckbox
              key={s}
              label={s}
              checked={styles.includes(s)}
              href={buildFilterUrl(basePath, params, "style", s)}
            />
          ))}
        </FilterSection>
      </div>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details open className="border-b border-gray-200 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold text-gray-800 mb-2 list-none marker:content-[''] hover:text-[#3b6341]">
        <span>{title}</span>
        <svg
          className="w-4 h-4 text-gray-400 transition-transform details-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="space-y-1 pt-2">{children}</div>
    </details>
  );
}

function FilterCheckbox({
  label,
  count,
  checked,
  href,
}: {
  label: string;
  count?: number;
  checked: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between py-1 px-1 rounded hover:bg-green-50 text-sm text-gray-700 transition-colors group"
    >
      <span className="flex items-center gap-2.5">
        <span
          className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
            checked ? "bg-[#3b6341] border-[#3b6341]" : "border-gray-300 group-hover:border-[#3b6341]"
          }`}
        >
          {checked && (
            <svg
              className="w-2.5 h-2.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
        <span className={checked ? "text-gray-800 font-medium" : ""}>{label}</span>
      </span>
      {count !== undefined && (
        <span className="text-gray-400 text-xs px-1.5 py-0.5 bg-gray-100 rounded-full">{count}</span>
      )}
    </Link>
  );
}
