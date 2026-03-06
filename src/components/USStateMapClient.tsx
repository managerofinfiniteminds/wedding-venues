"use client";

import dynamic from "next/dynamic";

const USStateMap = dynamic(
  () => import("@/components/USStateMap").then((m) => m.USStateMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
        Loading map…
      </div>
    ),
  }
);

export function USStateMapClient({ onStateSelect, linkMode }: { onStateSelect: (slug: string) => void; linkMode?: boolean }) {
  return <USStateMap onStateSelect={onStateSelect} linkMode={linkMode} />;
}
