"use client";

import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, Annotation } from "react-simple-maps";
import { useRouter } from "next/navigation";

const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// FIPS code → state slug mapping
const FIPS_TO_SLUG: Record<string, string> = {
  "01": "alabama", "02": "alaska", "04": "arizona", "05": "arkansas",
  "06": "california", "08": "colorado", "09": "connecticut", "10": "delaware",
  "12": "florida", "13": "georgia", "15": "hawaii", "16": "idaho",
  "17": "illinois", "18": "indiana", "19": "iowa", "20": "kansas",
  "21": "kentucky", "22": "louisiana", "23": "maine", "24": "maryland",
  "25": "massachusetts", "26": "michigan", "27": "minnesota", "28": "mississippi",
  "29": "missouri", "30": "montana", "31": "nebraska", "32": "nevada",
  "33": "new-hampshire", "34": "new-jersey", "35": "new-mexico", "36": "new-york",
  "37": "north-carolina", "38": "north-dakota", "39": "ohio", "40": "oklahoma",
  "41": "oregon", "42": "pennsylvania", "44": "rhode-island", "45": "south-carolina",
  "46": "south-dakota", "47": "tennessee", "48": "texas", "49": "utah",
  "50": "vermont", "51": "virginia", "53": "washington", "54": "west-virginia",
  "55": "wisconsin", "56": "wyoming",
};

// State abbr labels for small states
const STATE_ABBR: Record<string, string> = {
  "connecticut": "CT", "delaware": "DE", "maryland": "MD", "massachusetts": "MA",
  "new-hampshire": "NH", "new-jersey": "NJ", "rhode-island": "RI", "vermont": "VT",
  "washington-dc": "DC",
};

interface StateInfo {
  slug: string;
  name: string;
  abbr: string;
  count: number;
}

interface Props {
  onStateSelect: (slug: string) => void;
  linkMode?: boolean; // if true, clicking navigates to /venues/[state] instead of calling onStateSelect
}

export function USStateMap({ onStateSelect, linkMode = false }: Props) {
  const [stateData, setStateData] = useState<Map<string, StateInfo>>(new Map());
  const [hovered, setHovered] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/states/map")
      .then((r) => r.json())
      .then((data: StateInfo[]) => {
        setStateData(new Map(data.map((s) => [s.slug, s])));
      });
  }, []);

  const handleClick = (slug: string) => {
    if (linkMode) {
      router.push(`/venues/${slug}`);
    } else {
      onStateSelect(slug);
    }
  };

  const hoveredState = hovered ? stateData.get(hovered) : null;

  return (
    <div className="relative w-full">
      {/* Tooltip */}
      {hoveredState && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-white border border-gray-200 rounded-xl shadow-lg px-5 py-3 text-center pointer-events-none">
          <p className="font-semibold text-gray-800 text-sm">{hoveredState.name}</p>
          <p className="text-[#3b6341] text-xs font-medium">{hoveredState.count.toLocaleString()} venues</p>
          <p className="text-gray-400 text-xs mt-0.5">{linkMode ? "Click to browse" : "Click to explore on map"}</p>
        </div>
      )}

      <ComposableMap
        projection="geoAlbersUsa"
        style={{ width: "100%", height: "auto" }}
        projectionConfig={{ scale: 1000 }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const fips = geo.id?.toString().padStart(2, "0") ?? "";
              const slug = FIPS_TO_SLUG[fips];
              const info = slug ? stateData.get(slug) : undefined;
              const isHovered = hovered === slug;
              const hasData = (info?.count ?? 0) > 0;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => slug && handleClick(slug)}
                  onMouseEnter={() => slug && setHovered(slug)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    default: {
                      fill: isHovered
                        ? "#3b6341"
                        : hasData
                        ? "#7aab82"
                        : "#c8ddc9",
                      stroke: "#fff",
                      strokeWidth: 0.5,
                      outline: "none",
                      cursor: slug ? "pointer" : "default",
                      transition: "fill 0.15s ease",
                    },
                    hover: {
                      fill: "#3b6341",
                      stroke: "#fff",
                      strokeWidth: 0.5,
                      outline: "none",
                      cursor: "pointer",
                    },
                    pressed: {
                      fill: "#2f5035",
                      outline: "none",
                    },
                  }}
                />
              );
            })
          }
        </Geographies>

        {/* Abbr labels for small NE states */}
        {Array.from(stateData.values())
          .filter((s) => STATE_ABBR[s.slug])
          .map((s) => null /* handled by tooltip on hover */)}
      </ComposableMap>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#7aab82" }} />
          Has venues
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#c8ddc9" }} />
          Coming soon
        </span>
      </div>
    </div>
  );
}
