import { CircleMarker, MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import { MAP_CENTER, MAP_ZOOM } from '@/data/constants';
import 'leaflet/dist/leaflet.css';

function ClickToChoose({ onChoose }: { onChoose: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (event) => onChoose(Number(event.latlng.lat.toFixed(6)), Number(event.latlng.lng.toFixed(6))) });
  return null;
}

export function LocationPicker({ value, onChange, className = '' }: { value: [number, number] | null; onChange: (lat: number, lng: number) => void; className?: string }) {
  return <div className={`h-64 overflow-hidden rounded-2xl border border-border ${className}`}><MapContainer center={value ?? MAP_CENTER} zoom={value ? 15 : MAP_ZOOM} scrollWheelZoom className="h-full w-full"><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><ClickToChoose onChoose={onChange} />{value && <CircleMarker center={value} radius={9} pathOptions={{ color: '#fff', weight: 2, fillColor: '#1689f8', fillOpacity: 1 }} />}</MapContainer></div>;
}
