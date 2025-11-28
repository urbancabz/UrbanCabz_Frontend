// src/Components/CabBooking/RouteMap.jsx
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function RouteMap({ fromCoords, toCoords, routeCoordinates }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Initialize map only once
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([20.5937, 78.9629], 5);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    }

    // Clear previous markers and routes
    if (mapInstanceRef.current) {
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });

      if (fromCoords && toCoords) {
        // Create custom icons
        const startIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background: #10b981;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              font-weight: bold;
              color: white;
              font-size: 16px;
            ">A</div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const endIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background: #ef4444;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              font-weight: bold;
              color: white;
              font-size: 16px;
            ">B</div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        // Add markers
        const startMarker = L.marker([fromCoords.lat, fromCoords.lng], { icon: startIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`<b>Pickup</b><br>${fromCoords.formattedAddress || 'Start'}`);

        const endMarker = L.marker([toCoords.lat, toCoords.lng], { icon: endIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`<b>Drop</b><br>${toCoords.formattedAddress || 'End'}`);

        // Draw route line if coordinates are available
        if (routeCoordinates && routeCoordinates.length > 0) {
          const polyline = L.polyline(routeCoordinates, {
            color: '#3b82f6',
            weight: 4,
            opacity: 0.7,
            smoothFactor: 1,
          }).addTo(mapInstanceRef.current);

          // Fit bounds to show entire route
          mapInstanceRef.current.fitBounds(polyline.getBounds(), {
            padding: [50, 50],
          });
        } else {
          // If no route coordinates, just fit bounds to markers
          const bounds = L.latLngBounds([
            [fromCoords.lat, fromCoords.lng],
            [toCoords.lat, toCoords.lng],
          ]);
          mapInstanceRef.current.fitBounds(bounds, {
            padding: [50, 50],
          });

          // Draw straight line as fallback
          L.polyline(
            [
              [fromCoords.lat, fromCoords.lng],
              [toCoords.lat, toCoords.lng],
            ],
            {
              color: '#94a3b8',
              weight: 2,
              opacity: 0.5,
              dashArray: '10, 10',
            }
          ).addTo(mapInstanceRef.current);
        }
      }
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [fromCoords, toCoords, routeCoordinates]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-lg"
      style={{ minHeight: '200px' }}
    />
  );
}