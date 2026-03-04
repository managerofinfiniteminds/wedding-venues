"use client";
import { useRouter, useSearchParams } from "next/navigation";

export function SortSelect({ current }: { current: string }) {
  const router = useRouter();
  const sp = useSearchParams();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(sp.toString());
    params.set("sort", e.target.value);
    router.push(`/venues?${params.toString()}`);
  }

  return (
    <select 
      onChange={onChange} 
      defaultValue={current}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-400 bg-white"
    >
      <option value="rating">Top Rated</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="capacity">Capacity</option>
    </select>
  );
}