import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Compass, ShoppingBag, Clock } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons in production React environments
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom markers for NGO Home vs Food Donation Locations
const ngoIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const donationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Recenter map helper component
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

export const DonationMap = ({ ngoLatitude, ngoLongitude, donations = [], onSelectDonation }) => {
  const ngoCoords = [ngoLatitude || 40.7128, ngoLongitude || -74.006];

  return (
    <div className="w-full h-[450px] rounded-xl overflow-hidden shadow-sm border border-border relative z-10">
      <MapContainer
        center={ngoCoords}
        zoom={12}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={ngoCoords} />

        {/* NGO Marker */}
        <Marker position={ngoCoords} icon={ngoIcon}>
          <Popup>
            <div className="text-xs p-1 font-semibold text-foreground">
              <span className="text-red-500 font-bold block">🏠 Your Organization</span>
              <span>Coordinates: {ngoCoords[0].toFixed(5)}, {ngoCoords[1].toFixed(5)}</span>
            </div>
          </Popup>
        </Marker>

        {/* Nearby Donations Markers */}
        {donations.map((item) => {
          const lat = item.pickup_latitude || 40.7128;
          const lng = item.pickup_longitude || -74.0060;

          return (
            <Marker key={item.id} position={[lat, lng]} icon={donationIcon}>
              <Popup>
                <div className="p-2 space-y-2 max-w-[200px] text-foreground">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-primary">{item.food_category}</span>
                    <span className="font-bold text-sm leading-tight mt-0.5">{item.food_name}</span>
                  </div>

                  <div className="text-xs space-y-1 text-muted-foreground border-t border-border pt-1">
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5" /> Qty: {item.quantity} {item.quantity_unit}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Expiry: {new Date(item.expiry_time).toLocaleTimeString()}
                    </span>
                    {item.distance !== undefined && (
                      <span className="text-green-500 font-bold block mt-1">
                        📍 {Number(item.distance).toFixed(1)} km away
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectDonation(item)}
                    className="w-full mt-2 inline-flex items-center justify-center py-1.5 rounded bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/95 transition-all shadow"
                  >
                    View Details & Claim
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default DonationMap;
