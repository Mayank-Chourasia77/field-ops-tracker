import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ActivityLocation {
  id: string;
  lat: number;
  lng: number;
  type: 'meeting' | 'sale' | 'distribution' | 'clock';
  label: string;
  timestamp: string;
}

interface ActivityMapProps {
  locations: ActivityLocation[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

const markerColors = {
  meeting: '#f59e0b',
  sale: '#10b981',
  distribution: '#8b5cf6',
  clock: '#3b82f6',
};

export function ActivityMap({ 
  locations, 
  center = [20.5937, 78.9629], 
  zoom = 5,
  height = '400px' 
}: ActivityMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(center, zoom);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    if (locations.length === 0) return;

    const bounds = L.latLngBounds([]);

    locations.forEach((loc) => {
      const color = markerColors[loc.type];
      
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 24px;
            height: 24px;
            background: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          "></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(map);
      
      marker.bindPopup(`
        <div style="font-family: system-ui; min-width: 150px;">
          <strong style="font-size: 14px;">${loc.label}</strong>
          <br/>
          <span style="color: #666; font-size: 12px;">${loc.type.charAt(0).toUpperCase() + loc.type.slice(1)}</span>
          <br/>
          <span style="color: #888; font-size: 11px;">${new Date(loc.timestamp).toLocaleString()}</span>
        </div>
      `);

      bounds.extend([loc.lat, loc.lng]);
    });

    if (locations.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [locations]);

  return (
    <div 
      ref={mapRef} 
      style={{ height, width: '100%', borderRadius: '0.75rem' }}
      className="z-0"
    />
  );
}
