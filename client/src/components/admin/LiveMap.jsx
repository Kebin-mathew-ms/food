import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';

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

export default function LiveMap({ trackingPoints = [] }) {
  const [livePoints, setLivePoints] = useState(trackingPoints);

  useEffect(() => {
    setLivePoints(trackingPoints);
  }, [trackingPoints]);

  useEffect(() => {
    // Connect Socket.io client instance
    const socket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('accessToken') || '',
      },
    });

    // Join room for active tracking updates
    livePoints.forEach((pt) => {
      socket.emit('delivery:join', pt.deliveryId);
    });

    // Listen to real-time coordinates telemetries updates
    socket.on('volunteer:location_updated', (data) => {
      setLivePoints((prev) =>
        prev.map((pt) => {
          if (pt.deliveryId === data.deliveryId) {
            return {
              ...pt,
              volunteer: {
                ...pt.volunteer,
                lat: data.latitude,
                lng: data.longitude,
              },
            };
          }
          return pt;
        })
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [trackingPoints, livePoints]);

  const boundsPoints = [];
  livePoints.forEach((pt) => {
    if (pt.volunteer?.lat && pt.volunteer?.lng) boundsPoints.push([pt.volunteer.lat, pt.volunteer.lng]);
    if (pt.pickup?.lat && pt.pickup?.lng) boundsPoints.push([pt.pickup.lat, pt.pickup.lng]);
    if (pt.destination?.lat && pt.destination?.lng) boundsPoints.push([pt.destination.lat, pt.destination.lng]);
  });

  const center = boundsPoints.length > 0 ? boundsPoints[0] : [47.6062, -122.3321];

  return (
    <div className="w-full h-[400px] border border-border rounded-2xl overflow-hidden shadow-sm z-10">
      <MapContainer center={center} zoom={13} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {livePoints.map((pt) => (
          <React.Fragment key={pt.deliveryId}>
            {/* Volunteer Marker Pin */}
            {pt.volunteer?.lat && pt.volunteer?.lng && (
              <Marker position={[pt.volunteer.lat, pt.volunteer.lng]} icon={volunteerIcon}>
                <Popup>
                  <div className="text-xs">
                    <strong>Volunteer: {pt.volunteer.name || 'N/A'}</strong>
                    <div>Status: {pt.status}</div>
                    <div>Phone: {pt.volunteer.phone || 'N/A'}</div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Donor Marker Pin */}
            {pt.pickup?.lat && pt.pickup?.lng && (
              <Marker position={[pt.pickup.lat, pt.pickup.lng]} icon={donorIcon}>
                <Popup>
                  <div className="text-xs">
                    <strong>Donor Pickup: {pt.pickup.name}</strong>
                    <div>Address: {pt.pickup.address}</div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* NGO Marker Pin */}
            {pt.destination?.lat && pt.destination?.lng && (
              <Marker position={[pt.destination.lat, pt.destination.lng]} icon={ngoIcon}>
                <Popup>
                  <div className="text-xs">
                    <strong>NGO Destination: {pt.destination.ngoName}</strong>
                    <div>Address: {pt.destination.address}</div>
                  </div>
                </Popup>
              </Marker>
            )}
          </React.Fragment>
        ))}

        <AutoBoundFit coords={boundsPoints} />
      </MapContainer>
    </div>
  );
}
