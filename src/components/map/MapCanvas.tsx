import { useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import { getMapPointAvailability, MAP_POINT_AVAILABILITY, MATERIAL_MAP } from '@/data/materials';
import type { RecyclePoint } from '@/types/domain';
import 'leaflet/dist/leaflet.css';

interface MapCanvasProps {
  points: RecyclePoint[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  center: [number, number];
  zoom: number;
}

function MapViewport({ selectedPoint }: { selectedPoint: RecyclePoint | null }) {
  const map = useMap();
  const shouldReduceMotion = useReducedMotion();
  useEffect(() => {
    if (selectedPoint) map.flyTo([selectedPoint.lat, selectedPoint.lng], Math.max(map.getZoom(), 14), { duration: shouldReduceMotion ? 0 : 0.5 });
  }, [map, selectedPoint, shouldReduceMotion]);
  return null;
}

export function MapCanvas({ points, selectedId, onSelect, center, zoom }: MapCanvasProps) {
  const selectedPoint = points.find((point) => point.id === selectedId) ?? null;
  return (
    <div className="map-canvas" aria-label="Mapa interactivo de puntos de reciclaje">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom className="h-full w-full">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapViewport selectedPoint={selectedPoint} />
        {points.map((point) => {
          const availability = MAP_POINT_AVAILABILITY[getMapPointAvailability(point.status)];
          const acceptedMaterials = point.materials.map((key) => MATERIAL_MAP[key].label);
          return <CircleMarker key={point.id} center={[point.lat, point.lng]} radius={selectedId === point.id ? 11 : 8} pathOptions={{ color: '#fff', weight: 2, fillColor: availability.markerColor, fillOpacity: 0.95 }} eventHandlers={{ click: () => onSelect(point.id) }}>
            <Popup>
              <strong>{point.name}</strong><br />
              {point.address}<br />
              <span>{availability.label}</span>
              <div className="mt-2 border-t border-border pt-2">
                <strong>Qué podés reciclar acá</strong>
                {acceptedMaterials.length > 0
                  ? <p className="mt-1">{acceptedMaterials.join(' · ')}</p>
                  : <p className="mt-1">Materiales por confirmar.</p>}
              </div>
            </Popup>
          </CircleMarker>;
        })}
      </MapContainer>
      {!points.length && <div className="pointer-events-none absolute inset-0 z-[500] grid place-items-center"><span className="rounded-full bg-surface px-4 py-2 text-sm shadow-soft">No hay puntos para mostrar</span></div>}
    </div>
  );
}
