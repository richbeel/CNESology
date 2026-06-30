'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import type { AlignmentPoint } from '@/lib/types/alignment';
import { remainingCutM, statusLabel, workTypeLabel } from '@/lib/types/alignment';

type FieldMapProps = {
  route: [number, number][];
  points: AlignmentPoint[];
};

function pointColor(point: AlignmentPoint): string {
  if (point.status === 'done') return '#22c55e';
  const remaining = remainingCutM(point);
  if (remaining > 0.3) return '#f97316';
  if (remaining < -0.1) return '#3b82f6';
  return '#eab308';
}

function FitRoute({ route }: { route: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (route.length < 2) return;
    map.fitBounds(L.latLngBounds(route), { padding: [40, 40] });
  }, [map, route]);
  return null;
}

function UserLocation() {
  const map = useMap();
  const markerRef = useRef<L.CircleMarker | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const latlng = L.latLng(latitude, longitude);
        if (markerRef.current) {
          markerRef.current.setLatLng(latlng);
          return;
        }
        markerRef.current = L.circleMarker(latlng, {
          radius: 8,
          color: '#2563eb',
          fillColor: '#3b82f6',
          fillOpacity: 0.9,
          weight: 2,
        })
          .addTo(map)
          .bindPopup('Vaše poloha');
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10_000 },
    );
    return () => {
      navigator.geolocation.clearWatch(watchId);
      markerRef.current?.remove();
      markerRef.current = null;
    };
  }, [map]);

  return null;
}

export function FieldMap({ route, points }: FieldMapProps) {
  const center = route[0] ?? [49.1952, 16.6068];

  return (
    <MapContainer
      center={center}
      zoom={16}
      className="h-full w-full rounded-xl"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitRoute route={route} />
      <UserLocation />
      <Polyline positions={route} pathOptions={{ color: '#52525b', weight: 5, opacity: 0.85 }} />
      {points.map((point) => (
        <CircleMarker
          key={point.id}
          center={[point.lat, point.lng]}
          radius={10}
          pathOptions={{
            color: '#18181b',
            fillColor: pointColor(point),
            fillOpacity: 0.95,
            weight: 2,
          }}
        >
          <Popup>
            <div className="space-y-1 text-sm">
              <p className="font-semibold">{point.station}</p>
              <p>{workTypeLabel(point.workType)} · {statusLabel(point.status)}</p>
              <p>Aktuálně: {point.currentElevationM} m</p>
              <p>Cíl: {point.targetElevationM} m</p>
              <p>Zbývá: {remainingCutM(point)} m</p>
              {point.note ? <p className="text-zinc-600">{point.note}</p> : null}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
