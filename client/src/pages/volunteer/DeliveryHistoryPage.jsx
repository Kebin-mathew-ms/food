import React, { useState } from 'react';
import { useVolunteerHistoryQuery } from '../../hooks/useVolunteer.js';
import DeliveryHistory from '../../components/volunteer/DeliveryHistory.jsx';
import { Calendar, Truck, AlertTriangle } from 'lucide-react';

export default function DeliveryHistoryPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data: history, isLoading } = useVolunteerHistoryQuery(statusFilter);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-sm font-semibold text-muted-foreground animate-pulse">Loading delivery history log...</div>
      </div>
    );
  }

  const list = history?.data || [];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 text-foreground">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card border border-border rounded-2xl p-6 shadow-sm gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">📂 Historical Deliveries Index</h1>
          <p className="text-sm text-muted-foreground mt-0.5 font-medium">Review list of completed tasks, average ratings, and CSV downloads.</p>
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-2 bg-muted/40 px-4 py-2 rounded-xl border border-border">
          <span className="text-xs text-muted-foreground font-semibold">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border border-border text-foreground rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="" className="bg-card">All Statuses</option>
            <option value="DELIVERED" className="bg-card">Delivered</option>
            <option value="FAILED" className="bg-card">Failed</option>
            <option value="CANCELLED" className="bg-card">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Render Table history */}
      <DeliveryHistory history={list} />
    </div>
  );
}
