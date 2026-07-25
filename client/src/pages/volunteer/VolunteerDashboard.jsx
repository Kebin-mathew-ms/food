import React from 'react';
import {
  useVolunteerDashboardQuery,
  useAssignmentsQuery,
  useActiveDeliveriesQuery,
  useUpdateVolunteerStatusMutation,
} from '../../hooks/useVolunteer.js';
import AssignmentCard from '../../components/volunteer/AssignmentCard.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ClipboardList, Navigation, Award, CheckCircle, Activity, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VolunteerDashboard() {
  const { data: dash, isLoading: dashLoading } = useVolunteerDashboardQuery();
  const { data: assignments, isLoading: assLoading } = useAssignmentsQuery();
  const { data: active, isLoading: actLoading } = useActiveDeliveriesQuery();
  const updateStatus = useUpdateVolunteerStatusMutation();

  if (dashLoading || assLoading || actLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-sm font-semibold text-muted-foreground animate-pulse">Loading volunteer dashboard metrics...</div>
      </div>
    );
  }

  const stats = dash?.data?.stats || {
    assigned: 0,
    pendingPickup: 0,
    inProgress: 0,
    completedToday: 0,
    completedMonth: 0,
    totalCompleted: 0,
    averageRating: 5.0,
  };

  const chartData = dash?.data?.charts?.monthlyDeliveries || [];
  const activeDelivery = active?.data?.[0]; // Get the current active in-progress delivery
  const availableAssignments = assignments?.data || [];
  const currentStatus = dash?.data?.profileStatus || 'OFFLINE';

  return (
    <div className="w-full flex flex-col gap-8 text-foreground">
      {/* Top Welcome Title Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card border border-border p-6 rounded-2xl shadow-sm gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">🚴 Volunteer Control Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Accept food redistribution tasks and track active transit logs.</p>
        </div>

        {/* Availability Quick Toggle */}
        <div className="flex items-center gap-3 bg-muted/40 px-4 py-2 rounded-xl border border-border">
          <span className="text-xs text-muted-foreground">Status:</span>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded border uppercase ${
              currentStatus === 'ONLINE'
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-muted text-muted-foreground border-border'
            }`}
          >
            {currentStatus}
          </span>
          {currentStatus === 'OFFLINE' ? (
            <button
              onClick={() => updateStatus.mutate({ online_status: 'ONLINE' })}
              className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
            >
              Go Online
            </button>
          ) : (
            <button
              onClick={() => updateStatus.mutate({ online_status: 'OFFLINE' })}
              className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              Go Offline
            </button>
          )}
        </div>
      </div>

      {/* Active in-progress banner overlay link */}
      {activeDelivery && (
        <div className="w-full bg-primary border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm animate-pulse">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 animate-spin" /> Active Delivery Task in Progress!
            </h3>
            <p className="text-xs text-primary-foreground/90 mt-1">
              You accepted <strong>{activeDelivery.donation_request?.donation?.food_name}</strong> claim request.
            </p>
          </div>
          <Link
            to={
              activeDelivery.delivery_status === 'ACCEPTED' ||
              activeDelivery.delivery_status === 'ON_THE_WAY_TO_PICKUP' ||
              activeDelivery.delivery_status === 'ARRIVED_AT_PICKUP'
                ? `/volunteer/pickup/${activeDelivery.id}`
                : `/volunteer/delivery/${activeDelivery.id}`
            }
            className="flex items-center gap-2 px-5 py-3 bg-white text-primary font-bold rounded-xl text-sm hover:bg-neutral-50 transition-all shadow-sm"
          >
            <Play className="w-4 h-4 fill-primary" /> Continue Navigation
          </Link>
        </div>
      )}

      {/* Metrics Cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Pending Pickup</span>
            <span className="text-3xl font-black text-foreground block">{stats.pendingPickup}</span>
          </div>
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">In Transit</span>
            <span className="text-3xl font-black text-foreground block">{stats.inProgress}</span>
          </div>
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <Navigation className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Completed Today</span>
            <span className="text-3xl font-black text-foreground block">{stats.completedToday}</span>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Average Rating</span>
            <span className="text-3xl font-black text-foreground block">{stats.averageRating} ★</span>
          </div>
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: charts + available lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: available claims */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h3 className="text-lg font-bold border-b border-border pb-3 mb-6 flex items-center gap-2 text-foreground">
            🚀 Nearby Available Assignments
          </h3>

          {currentStatus !== 'ONLINE' ? (
            <div className="text-center py-16 bg-card border border-border rounded-2xl shadow-sm text-muted-foreground text-sm">
              Please go <strong className="text-foreground">ONLINE</strong> to retrieve and accept available nearby assignments.
            </div>
          ) : availableAssignments.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-2xl shadow-sm text-muted-foreground text-sm">
              No available food donations within your operating radius range currently.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {availableAssignments.map((ass) => (
                <AssignmentCard key={ass.id} assignment={ass} />
              ))}
            </div>
          )}
        </div>

        {/* Right Side: charts */}
        <div className="flex flex-col bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold border-b border-border pb-3 mb-6 text-foreground">Monthly Accomplishments</h3>

          {chartData.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">No accomplishments data registered.</div>
          ) : (
            <div className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="deliveries" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
