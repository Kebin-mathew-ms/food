import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation } from 'lucide-react';

// Fix for default Leaflet marker icon assets loading under Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

/**
 * Hook component to update map view center dynamically.
 */
function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

/**
 * Event hook listener to capture map clicks when editing.
 */
function MapClickHandler({ onClick, readOnly }) {
  useMapEvents({
    click(e) {
      if (!readOnly && onClick) {
        onClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

/**
 * Leaflet interactive map helper for choosing coordinates.
 */
export const LocationPickerMap = ({
  latitude = 40.7128,
  longitude = -74.006,
  onChange,
  readOnly = false,
}) => {
  const center = useMemo(() => [latitude || 40.7128, longitude || -74.006], [latitude, longitude]);
  const [markerPosition, setMarkerPosition] = useState(center);

  useEffect(() => {
    setMarkerPosition(center);
  }, [center]);

  const handleMarkerDragEnd = (e) => {
    const latLng = e.target.getLatLng();
    setMarkerPosition([latLng.lat, latLng.lng]);
    if (onChange) {
      onChange(latLng.lat, latLng.lng);
    }
  };

  const locateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMarkerPosition([lat, lng]);
          if (onChange) {
            onChange(lat, lng);
          }
        },
        () => {
          // Fallback silently on browser block
        }
      );
    }
  };

  return (
    <div className="relative w-full h-[280px] rounded-lg overflow-hidden border border-border bg-muted/20">
      
      <MapContainer
        center={markerPosition}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ChangeMapView center={markerPosition} />
        
        <MapClickHandler onClick={(lat, lng) => {
          setMarkerPosition([lat, lng]);
          if (onChange) onChange(lat, lng);
        }} readOnly={readOnly} />

        <Marker
          position={markerPosition}
          draggable={!readOnly}
          eventHandlers={{
            dragend: handleMarkerDragEnd,
          }}
        />
      </MapContainer>

      {!readOnly && (
        <button
          type="button"
          onClick={locateUser}
          className="absolute bottom-4 right-4 z-20 p-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/10 border border-primary/20 flex items-center justify-center"
          title="Auto-detect location"
        >
          <Navigation className="w-4 h-4 fill-primary-foreground" />
        </button>
      )}

    </div>
  );
};

export default LocationPickerMap;
