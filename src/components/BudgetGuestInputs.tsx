"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

interface Props {
  type: "budget" | "guest";
  currentMin?: string;
  currentMax?: string;
}

export function BudgetGuestInputs({ type, currentMin, currentMax }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [min, setMin] = useState(currentMin ?? "");
  const [max, setMax] = useState(currentMax ?? "");

  const minKey = type === "budget" ? "budgetMin" : "guestMin";
  const maxKey = type === "budget" ? "budgetMax" : "guestMax";
  const placeholder =
    type === "budget"
      ? { min: "Min $", max: "Max $" }
      : { min: "Min", max: "Max" };

  function apply() {
    const params = new URLSearchParams(sp.toString());
    if (min) params.set(minKey, min);
    else params.delete(minKey);
    if (max) params.set(maxKey, max);
    else params.delete(maxKey);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        value={min}
        onChange={(e) => setMin(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && apply()}
        placeholder={placeholder.min}
        min={0}
        className="w-full min-w-0 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#3b6341]"
      />
      <span className="text-gray-400 text-xs flex-shrink-0">–</span>
      <input
        type="number"
        value={max}
        onChange={(e) => setMax(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && apply()}
        placeholder={placeholder.max}
        min={0}
        className="w-full min-w-0 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#3b6341]"
      />
      <button
        onClick={apply}
        className="flex-shrink-0 text-xs bg-[#3b6341] text-white px-2.5 py-1.5 rounded-lg hover:bg-[#2e4f34] transition-colors"
      >
        Go
      </button>
    </div>
  );
}
