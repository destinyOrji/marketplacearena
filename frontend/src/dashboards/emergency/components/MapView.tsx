// MapView Component - Display interactive map with markers

import React, { useEffect, useRef } from 'react';
import { MapMarker } from '../types';

interface MapViewProps {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (markerId: string) => void;
  className?: string;
}

const MapView: React.FC<MapViewProps> = ({
  markers,
  center = [0, 0],
  zoom = 13,
  onMarkerClick,
  className = '',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Map initialization would go here
    // This is a placeholder for Google Maps or Mapbox integration
    console.log('Map initialized with markers:', markers);
  }, [markers, center, zoom]);

  return (
    <div ref={mapRef} className={`relative bg-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Placeholder map UI */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-gray-500 text-sm">Map View</p>
          <p className="text-gray-400 text-xs mt-1">{markers.length} marker(s)</p>
        </div>
      </div>

      {/* Navigation Options */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${center[0]},${center[1]}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 bg-white rounded-lg shadow-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Google Maps
        </a>
        <a
          href={`https://waze.com/ul?ll=${center[0]},${center[1]}&navigate=yes`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 bg-white rounded-lg shadow-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Waze
        </a>
      </div>
    </div>
  );
};

export default MapView;
