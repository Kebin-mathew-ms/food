import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Mock marker icons configuration to override leaflet default paths resolver
const volunteerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const donorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const ngoIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// View boundaries auto-adjustment component
function AutoBoundFit({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 0) {
      const valid = coords.filter((c) => c && c[0] && c[1]);
      if (valid.length > 0) {
        const bounds = L.latLngBounds(valid);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [coords, map]);
  return null;
}

export default function DonationDeliveryMap({ volCoords, donorCoords, ngoCoords, distance, eta }) {
  const points = [];
  if (volCoords && volCoords.lat && volCoords.lng) points.push([volCoords.lat, volCoords.lng]);
  if (donorCoords && donorCoords.lat && donorCoords.lng) points.push([donorCoords.lat, donorCoords.lng]);
  if (ngoCoords && ngoCoords.lat && ngoCoords.lng) points.push([ngoCoords.lat, ngoCoords.lng]);

  const mapCenter = points.length > 0 ? points[0] : [47.6062, -122.3321];

  return (
    <div className="w-full flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Navigation analytics header banner */}
      <div className="flex justify-between items-center bg-muted/30 p-4 border-b border-border text-sm font-semibold">
        <div className="text-muted-foreground">Route Polyline Navigation</div>
        <div className="flex gap-4 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          <span>Distance: {distance ? `${distance.toFixed(1)} km` : 'Calculating...'}</span>
          <span>ETA: {eta || 'Calculating...'}</span>
        </div>
      </div>

      <div className="w-full h-[300px] z-10">
        <MapContainer center={mapCenter} zoom={13} style={{ width: '100%', height: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {volCoords && volCoords.lat && volCoords.lng && (
            <Marker position={[volCoords.lat, volCoords.lng]} icon={volunteerIcon}>
              <Popup>
                <div className="text-xs font-semibold">You (Volunteer)</div>
              </Popup>
            </Marker>
          )}

          {donorCoords && donorCoords.lat && donorCoords.lng && (
            <Marker position={[donorCoords.lat, donorCoords.lng]} icon={donorIcon}>
              <Popup>
                <div className="text-xs font-semibold">Donor Pickup Point</div>
              </Popup>
            </Marker>
          )}

          {ngoCoords && ngoCoords.lat && ngoCoords.lng && (
            <Marker position={[ngoCoords.lat, ngoCoords.lng]} icon={ngoIcon}>
              <Popup>
                <div className="text-xs font-semibold">NGO Destination Point</div>
              </Popup>
            </Marker>
          )}

          {points.length > 1 && (
            <Polyline positions={points} color="#4F46E5" weight={4} dashArray="5, 10" />
          )}

          <AutoBoundFit coords={points} />
        </MapContainer>
      </div>
    </div>
  );
}
