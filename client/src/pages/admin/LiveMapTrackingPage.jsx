import React from 'react';
import { useAdminLiveMapQuery } from '../../hooks/useAdmin.js';
import LiveMap from '../../components/admin/LiveMap.jsx';
import { MapPin, RefreshCw } from 'lucide-react';

export default function LiveMapTrackingPage() {
  const { data, isLoading, refetch, isRefetching } = useAdminLiveMapQuery();

  const points = data?.data || [];

  return (
    <div className="w-full flex flex-col gap-6 text-foreground">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary animate-pulse" /> Live Redistribution Tracking Map
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Display live telemetry status coordinates of ongoing deliveries in progress.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold border border-border rounded-xl hover:bg-muted transition-all text-foreground bg-background"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} /> Refresh Map
        </button>
      </div>

      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="text-sm font-semibold text-muted-foreground animate-pulse">Loading map elements...</div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-xs text-muted-foreground font-semibold gap-2">
            <span>Color Codes: 🔴 Donor Pickup | 🟢 NGO Destination | 🔵 Active Volunteer Location</span>
            <span>Active Deliveries: {points.length}</span>
          </div>

          <LiveMap trackingPoints={points} />
        </div>
      )}
    </div>
  );
}
