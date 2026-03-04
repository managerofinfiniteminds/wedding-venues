"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

type MapVenue = {
  id: string;
  name: string;
  slug: string;
  city: string;
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

export type { MapVenue };

// Fix default Leaflet icon paths in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Custom green pin icon
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
    `${v.name} ${v.city} CA wedding venue`
  )}`;
  const domain = v.website
    ? v.website.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0]
    : null;

  return `
    <div style="width:260px;font-family:Inter,sans-serif;font-size:13px;line-height:1.4;">
      ${v.primaryPhotoUrl
        ? `<img src="${v.primaryPhotoUrl}" alt="${v.name}" style="width:100%;height:120px;object-fit:cover;border-radius:6px 6px 0 0;margin:-12px -12px 10px -12px;width:calc(100% + 24px);display:block;"/>`
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
        <a href="/venues/california/${v.slug}" style="display:block;margin-top:10px;background:#3b6341;color:white;text-align:center;padding:7px;border-radius:6px;text-decoration:none;font-weight:600;font-size:12px;">
          View Full Details
        </a>
      </div>
    </div>
  `;
}

export function VenueMap({ venues }: { venues: MapVenue[] }) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Init map once
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView([36.7783, -119.4179], 6);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Clear old markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    // No venues yet
    if (venues.length === 0) return;

    // Add markers
    venues.forEach((venue) => {
      if (!venue.latitude || !venue.longitude) return;
      L.marker([venue.latitude, venue.longitude], { icon: greenPin() })
        .addTo(map)
        .bindPopup(buildPopupHtml(venue), {
          maxWidth: 284,
          className: "gb-popup",
        });
    });

    // Fit bounds if we have venues
    const points = venues
      .filter((v) => v.latitude && v.longitude)
      .map((v) => [v.latitude!, v.longitude!] as [number, number]);
    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 13 });
    }
  }, [venues]);

  return (
    <>
      <style>{`
        .gb-popup .leaflet-popup-content-wrapper {
          border-radius: 10px;
          padding: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .gb-popup .leaflet-popup-content {
          margin: 0;
        }
        .gb-popup .leaflet-popup-tip-container {
          margin-top: -1px;
        }
      `}</style>
      <div ref={containerRef} style={{ height: "calc(100vh - 120px)", width: "100%" }} />
    </>
  );
}
