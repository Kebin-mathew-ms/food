import React, { useEffect } from 'react';
import { useUpdateLocationMutation } from '../../hooks/useVolunteer.js';
import axiosInstance from '../../api/axiosInstance.js';

export default function LocationTracker({ activeDeliveryId }) {
  const updateLocationMutation = useUpdateLocationMutation();

  useEffect(() => {
    if (!activeDeliveryId) return;

    const sendTelemetryUpdate = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              // Post to telemetry logs route directly
              await axiosInstance.post('/location/update', {
                deliveryId: activeDeliveryId,
                latitude,
                longitude,
              });
            } catch (err) {
              // Telemetry fails silently to avoid interrupting navigation
            }
          },
          () => {},
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }
    };

    // Run immediately on mount
    sendTelemetryUpdate();

    // Setup interval for 15 seconds updates
    const timer = setInterval(sendTelemetryUpdate, 15000);

    return () => clearInterval(timer);
  }, [activeDeliveryId]);

  return null; // Telemetry tracker does not render visible elements
}
