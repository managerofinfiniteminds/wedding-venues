"use client";

import { useEffect, useRef, useCallback } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import L from "leaflet";
import "leaflet.markercluster";

export type MapVenue = {
  id: string;
  name: string;
  slug: string;
  city: string;
  stateSlug?: string;
  venueType: string;
  googleRating: number | null;
  googleReviews: number | null;
  primaryPhotoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  street: string | null;
  state: string | null;
  zip: string | null;
};

// Fix default Leaflet icon paths in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

function greenPin() {
  return L.divIcon({
    className: "",
    html: `<svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.75 14 22 14 22S28 23.75 28 14C28 6.268 21.732 0 14 0z" fill="#3b6341"/>
      <circle cx="14" cy="14" r="6" fill="white"/>
    </svg>`,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -38],
  });
}

function buildPopupHtml(v: MapVenue): string {
  const address = [v.street, v.city, v.state, v.zip].filter(Boolean).join(", ");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${v.name} ${v.street ?? ""} ${v.city} ${v.state}`
  )}`;
  const reviewsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${v.name} ${v.city} wedding venue`
  )}`;
  const domain = v.website
    ? v.website.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0]
    : null;
  const stateSlug = v.stateSlug ?? "california";

  return `
    <div style="width:260px;font-family:Inter,sans-serif;font-size:13px;line-height:1.4;">
      ${v.primaryPhotoUrl
        ? `<img src="${v.primaryPhotoUrl}" alt="${v.name}" style="width:calc(100% + 24px);height:120px;object-fit:cover;border-radius:6px 6px 0 0;margin:-12px -12px 10px -12px;display:block;"/>`
        : ""}
      <div style="padding:${v.primaryPhotoUrl ? "0" : "2px"} 0 4px;">
        <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px;">${v.venueType}</div>
        <div style="font-weight:700;font-size:15px;color:#111827;margin-bottom:4px;line-height:1.3;">${v.name}</div>
        ${v.googleRating
          ? `<div style="display:flex;align-items:center;gap:4px;margin-bottom:6px;">
               <span style="color:#f59e0b;font-size:14px;">★</span>
               <span style="font-weight:600;color:#374151;">${v.googleRating}</span>
               <span style="color:#9ca3af;">(${v.googleReviews?.toLocaleString()})</span>
               <a href="${reviewsUrl}" target="_blank" style="color:#be185d;font-size:11px;margin-left:4px;text-decoration:none;">Reviews →</a>
             </div>`
          : ""}
        <div style="border-top:1px solid #f3f4f6;padding-top:8px;margin-top:4px;display:flex;flex-direction:column;gap:5px;">
          ${address
            ? `<a href="${mapsUrl}" target="_blank" style="display:flex;align-items:flex-start;gap:6px;color:#374151;text-decoration:none;">
                 <span style="margin-top:1px;">📍</span>
                 <span style="color:#4b5563;">${address}</span>
               </a>`
            : ""}
          ${v.phone
            ? `<a href="tel:${v.phone}" style="display:flex;align-items:center;gap:6px;color:#374151;text-decoration:none;">
                 <span>📞</span><span>${v.phone}</span>
               </a>`
            : ""}
          ${v.website && domain
            ? `<a href="${v.website}" target="_blank" style="display:flex;align-items:center;gap:6px;color:#be185d;text-decoration:none;">
                 <span>🌐</span><span>${domain}</span>
               </a>`
            : ""}
        </div>
        <a href="/venues/${stateSlug}/${v.slug}" style="display:block;margin-top:10px;background:#3b6341;color:white;text-align:center;padding:7px;border-radius:6px;text-decoration:none;font-weight:600;font-size:12px;">
          View Full Details
        </a>
      </div>
    </div>
  `;
}

interface VenueMapProps {
  initialVenues?: MapVenue[];
  stateSlug?: string;         // if set, only fetch venues for this state
}

export function VenueMap({ initialVenues = [], stateSlug }: VenueMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastBoundsRef = useRef<string>("");

  const fetchAndRenderVenues = useCallback(async (map: L.Map, cluster: L.MarkerClusterGroup) => {
    const bounds = map.getBounds();
    const boundsKey = [
      bounds.getSouth().toFixed(3),
      bounds.getWest().toFixed(3),
      bounds.getNorth().toFixed(3),
      bounds.getEast().toFixed(3),
    ].join(",");

    // Skip if bounds haven't changed meaningfully
    if (boundsKey === lastBoundsRef.current) return;
    lastBoundsRef.current = boundsKey;

    if (loadingRef.current) loadingRef.current.style.display = "flex";

    try {
      const params = new URLSearchParams();
      params.set("bounds", `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`);
      if (stateSlug) params.set("state", stateSlug);

      const res = await fetch(`/api/venues/map?${params}`);
      const venues: MapVenue[] = await res.json();

      cluster.clearLayers();

      venues.forEach((venue) => {
        if (!venue.latitude || !venue.longitude) return;
        const marker = L.marker([venue.latitude, venue.longitude], { icon: greenPin() });

        marker.bindTooltip(
          `<div style="font-family:Inter,sans-serif;font-size:12px;line-height:1.4;padding:2px 4px;">
            <strong style="font-size:13px;color:#111827;">${venue.name}</strong><br/>
            <span style="color:#6b7280;">${venue.city} · ${venue.venueType}</span>
            ${venue.googleRating
              ? `<br/><span style="color:#f59e0b;">★</span> <strong>${venue.googleRating}</strong>`
              : ""}
          </div>`,
          { direction: "top", offset: [0, -32], opacity: 0.97, className: "gb-tooltip" }
        );

        marker.bindPopup(buildPopupHtml(venue), {
          maxWidth: 284,
          className: "gb-popup",
        });

        marker.on("click", () => {
          marker.closeTooltip();
          marker.openPopup();
        });

        cluster.addLayer(marker);
      });
    } catch (e) {
      console.error("Map fetch failed", e);
    } finally {
      if (loadingRef.current) loadingRef.current.style.display = "none";
    }
  }, [stateSlug]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return; // already initialized

    // Default center: contiguous US
    const defaultCenter: [number, number] = stateSlug ? [37, -95] : [38, -97];
    const defaultZoom = stateSlug ? 6 : 4;

    const map = L.map(containerRef.current, { preferCanvas: true }).setView(defaultCenter, defaultZoom);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    // Marker cluster group with green theme
    const cluster = (L as any).markerClusterGroup({
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (c: any) => {
        const count = c.getChildCount();
        const size = count < 10 ? 34 : count < 100 ? 40 : 48;
        return L.divIcon({
          html: `<div style="
            width:${size}px;height:${size}px;
            background:#3b6341;color:white;
            border-radius:50%;display:flex;
            align-items:center;justify-content:center;
            font-weight:700;font-size:${size < 40 ? 12 : 13}px;
            border:3px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);
          ">${count}</div>`,
          className: "",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
      },
    }) as L.MarkerClusterGroup;

    clusterRef.current = cluster;
    map.addLayer(cluster);

    // If we have initial venues (e.g. from SSR), render them immediately
    if (initialVenues.length > 0) {
      initialVenues.forEach((venue) => {
        if (!venue.latitude || !venue.longitude) return;
        const marker = L.marker([venue.latitude, venue.longitude], { icon: greenPin() });
        marker.bindPopup(buildPopupHtml(venue), { maxWidth: 284, className: "gb-popup" });
        cluster.addLayer(marker);
      });

      const points = initialVenues
        .filter((v) => v.latitude && v.longitude)
        .map((v) => [v.latitude!, v.longitude!] as [number, number]);
      if (points.length > 0) {
        map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 12 });
      }
    }

    // Fetch on viewport change (debounced)
    const onMoveEnd = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchAndRenderVenues(map, cluster);
      }, 300);
    };

    map.on("moveend", onMoveEnd);
    map.on("zoomend", onMoveEnd);

    // Initial load
    fetchAndRenderVenues(map, cluster);

    return () => {
      map.off("moveend", onMoveEnd);
      map.off("zoomend", onMoveEnd);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchAndRenderVenues, initialVenues, stateSlug]);

  return (
    <>
      <style>{`
        .gb-popup .leaflet-popup-content-wrapper {
          border-radius: 10px;
          padding: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .gb-popup .leaflet-popup-content { margin: 0; }
        .gb-popup .leaflet-popup-tip-container { margin-top: -1px; }
        .gb-tooltip {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.12);
          padding: 6px 10px;
          white-space: nowrap;
        }
        .gb-tooltip::before { display: none; }
        .leaflet-tooltip.gb-tooltip { color: inherit; }
      `}</style>

      {/* Loading indicator */}
      <div
        ref={loadingRef}
        style={{
          display: "none",
          position: "absolute",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          background: "white",
          borderRadius: 8,
          padding: "6px 14px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
          alignItems: "center",
          gap: 8,
          fontSize: 13,
          fontWeight: 500,
          color: "#374151",
        }}
      >
        <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: "50%", border: "2px solid #3b6341", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
        Loading venues…
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>

      <div ref={containerRef} style={{ height: "calc(100vh - 120px)", width: "100%", position: "relative" }} />
    </>
  );
}
