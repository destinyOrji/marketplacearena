import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const ambulanceIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNSIgZmlsbD0iI2VmNDQ0NCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+agTwvdGV4dD48L3N2Zz4=',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const patientIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNSIgZmlsbD0iIzI1NjNlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+RpDwvdGV4dD48L3N2Zz4=',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface MapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  markers?: Array<{
    position: [number, number];
    type: 'ambulance' | 'patient' | 'default';
    popup?: string;
  }>;
  circles?: Array<{
    center: [number, number];
    radius: number;
    color?: string;
  }>;
  route?: Array<[number, number]>;
  enableDrawing?: boolean;
  onDrawCreated?: (layer: any) => void;
  className?: string;
}

// Component to handle drawing controls
const DrawControl: React.FC<{ onDrawCreated?: (layer: any) => void }> = ({ onDrawCreated }) => {
  const map = useMap();
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);

  useEffect(() => {
    if (!map || !onDrawCreated) return;

    // Create a feature group for drawn items
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;

    // Initialize draw control
    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems,
        remove: true,
      },
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: {
            color: '#ef4444',
            weight: 2,
          },
        },
        circle: {
          shapeOptions: {
            color: '#ef4444',
            weight: 2,
          },
        },
        rectangle: {
          shapeOptions: {
            color: '#ef4444',
            weight: 2,
          },
        },
        polyline: false,
        marker: false,
        circlemarker: false,
      },
    });

    map.addControl(drawControl);

    // Handle draw created event
    const handleDrawCreated = (e: any) => {
      const layer = e.layer;
      drawnItems.addLayer(layer);
      
      // Extract coordinates based on shape type
      let coordinates: any = null;
      if (layer instanceof L.Circle) {
        coordinates = {
          type: 'circle',
          center: [layer.getLatLng().lat, layer.getLatLng().lng],
          radius: layer.getRadius(),
        };
      } else if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
        coordinates = {
          type: 'polygon',
          points: layer.getLatLngs()[0].map((latlng: L.LatLng) => [latlng.lat, latlng.lng]),
        };
      }

      if (coordinates && onDrawCreated) {
        onDrawCreated(coordinates);
      }
    };

    map.on(L.Draw.Event.CREATED, handleDrawCreated);

    return () => {
      map.off(L.Draw.Event.CREATED, handleDrawCreated);
      map.removeControl(drawControl);
      if (drawnItemsRef.current) {
        map.removeLayer(drawnItemsRef.current);
      }
    };
  }, [map, onDrawCreated]);

  return null;
};

// Component to auto-fit bounds
const AutoFitBounds: React.FC<{ markers?: Array<{ position: [number, number] }> }> = ({ markers }) => {
  const map = useMap();

  useEffect(() => {
    if (markers && markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => m.position));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, markers]);

  return null;
};

const Map: React.FC<MapProps> = ({
  center = [9.0820, 8.6753], // Nigeria center
  zoom = 6,
  height = '400px',
  markers = [],
  circles = [],
  route = [],
  enableDrawing = false,
  onDrawCreated,
  className = '',
}) => {
  const [mapReady, setMapReady] = useState(false);

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'ambulance':
        return ambulanceIcon;
      case 'patient':
        return patientIcon;
      default:
        return undefined;
    }
  };

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
        whenReady={() => setMapReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Markers */}
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={marker.position}
            icon={getMarkerIcon(marker.type)}
          >
            {marker.popup && <Popup>{marker.popup}</Popup>}
          </Marker>
        ))}

        {/* Circles */}
        {circles.map((circle, index) => (
          <Circle
            key={index}
            center={circle.center}
            radius={circle.radius}
            pathOptions={{
              color: circle.color || '#ef4444',
              fillColor: circle.color || '#ef4444',
              fillOpacity: 0.1,
              weight: 2,
            }}
          />
        ))}

        {/* Route */}
        {route.length > 1 && (
          <Polyline
            positions={route}
            pathOptions={{
              color: '#2563eb',
              weight: 4,
              opacity: 0.7,
            }}
          />
        )}

        {/* Auto-fit bounds */}
        {markers.length > 0 && <AutoFitBounds markers={markers} />}

        {/* Drawing controls */}
        {enableDrawing && <DrawControl onDrawCreated={onDrawCreated} />}
      </MapContainer>
    </div>
  );
};

export default Map;
