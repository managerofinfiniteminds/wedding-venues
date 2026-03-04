
"use client";

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

type VenueMapProps = {
  venues: any[];
};

// Fix for default Leaflet icon path in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export function VenueMap({ venues }: VenueMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([36.7783, -119.4179], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
    }

    if (mapRef.current) {
        // Clear existing markers
        mapRef.current.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                mapRef.current?.removeLayer(layer);
            }
        });

      venues.forEach(venue => {
        if (venue.latitude && venue.longitude) {
          const marker = L.marker([venue.latitude, venue.longitude]).addTo(mapRef.current!);
          marker.bindPopup(`<b>${venue.name}</b><br>${venue.city}`);
        }
      });
    }
  }, [venues]);

  return <div ref={mapContainerRef} style={{ height: 'calc(100vh - 120px)', width: '100%' }} />;
}
