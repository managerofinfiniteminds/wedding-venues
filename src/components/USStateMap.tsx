"use client";

import { useState, useEffect, useRef } from "react";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import { useRouter } from "next/navigation";

const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

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

interface StateInfo {
  slug: string;
  name: string;
  abbr: string;
  count: number;
}

interface GeoFeature {
  type: string;
  id: string;
  properties: Record<string, unknown>;
  geometry: { type: string; coordinates: unknown[] };
}

interface Props {
  onStateSelect: (slug: string) => void;
  linkMode?: boolean;
}

// Albers USA projection (simplified — matches us-atlas viewBox 0 0 960 600)
const WIDTH = 960;
const HEIGHT = 600;

export function USStateMap({ onStateSelect, linkMode = false }: Props) {
  const [paths, setPaths] = useState<{ d: string; slug: string }[]>([]);
  const [stateData, setStateData] = useState<Map<string, StateInfo>>(new Map());
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const router = useRouter();

  // Load topojson + convert to SVG paths
  useEffect(() => {
    async function load() {
      const res = await fetch(GEO_URL);
      const topo = await res.json() as Topology;
      const { geoPath, geoAlbersUsa } = await import("d3-geo");
      const projection = geoAlbersUsa().scale(1300).translate([WIDTH / 2, HEIGHT / 2]);
      const path = geoPath().projection(projection);
      const geojson = feature(topo, topo.objects.states as GeometryCollection);
      const generated = (geojson.features as GeoFeature[]).map((f) => ({
        d: path(f as Parameters<typeof path>[0]) ?? "",
        slug: FIPS_TO_SLUG[String(f.id).padStart(2, "0")] ?? "",
      })).filter((p) => p.d && p.slug);
      setPaths(generated);
    }
    load();
  }, []);

  // Load venue counts per state
  useEffect(() => {
    fetch("/api/states/map")
      .then((r) => r.json())
      .then((data: StateInfo[]) => {
        setStateData(new Map(data.map((s) => [s.slug, s])));
      });
  }, []);

  const handleClick = (slug: string) => {
    if (linkMode) router.push(`/venues/${slug}`);
    else onStateSelect(slug);
  };

  const hoveredInfo = hovered ? stateData.get(hovered) : null;

  return (
    <div className="relative w-full select-none">
      {/* Tooltip */}
      {hoveredInfo && tooltip && (
        <div
          className="absolute z-20 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-2.5 text-center pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -110%)" }}
        >
          <p className="font-semibold text-gray-800 text-sm">{hoveredInfo.name}</p>
          <p className="text-[#3b6341] text-xs font-medium">{hoveredInfo.count.toLocaleString()} venues</p>
          <p className="text-gray-400 text-xs">{linkMode ? "Click to browse" : "Click to explore"}</p>
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto"
        style={{ maxHeight: 480 }}
      >
        {paths.map(({ d, slug }) => {
          const info = stateData.get(slug);
          const isHovered = hovered === slug;
          const hasData = (info?.count ?? 0) > 0;
          return (
            <path
              key={slug}
              d={d}
              fill={isHovered ? "#3b6341" : hasData ? "#7aab82" : "#c8ddc9"}
              stroke="#fff"
              strokeWidth={0.75}
              style={{ cursor: "pointer", transition: "fill 0.12s ease" }}
              onClick={() => handleClick(slug)}
              onMouseMove={(e) => {
                const svg = svgRef.current;
                if (!svg) return;
                const rect = svg.getBoundingClientRect();
                const scaleX = rect.width / WIDTH;
                const scaleY = rect.height / HEIGHT;
                // Get centroid of bounding box from the event
                setHovered(slug);
                setTooltip({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                });
              }}
              onMouseLeave={() => { setHovered(null); setTooltip(null); }}
            />
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3 text-xs text-gray-500">
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
