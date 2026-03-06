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

// No-op version for homepage (linkMode=true navigates via router, onStateSelect unused)
export function USStateMapHomepage() {
  return <USStateMap onStateSelect={() => {}} linkMode />;
}
