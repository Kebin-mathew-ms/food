import React from 'react';
import { useAdminDashboardQuery, useAdminAnalyticsQuery } from '../../hooks/useAdmin.js';
import { Users, Truck, Heart, Shield, CheckCircle, PieChart as PieIcon, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const { data: statsData, isLoading: statsLoading } = useAdminDashboardQuery();
  const { data: analyticsData, isLoading: analyticsLoading } = useAdminAnalyticsQuery();

  if (statsLoading || analyticsLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-sm font-semibold text-muted-foreground animate-pulse">Loading administrative analytics...</div>
      </div>
    );
  }

  const stats = statsData?.data || {};
  const monthlyTrends = analyticsData?.data?.monthlyTrends || [];
  const categoriesDistribution = analyticsData?.data?.categoriesDistribution || [];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

  return (
    <div className="w-full flex flex-col gap-8 text-foreground">
      {/* Top Header welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Platform Administration Center</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Monitor system overview, NGO approvals, live telemetry, and config adjustments.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Total Registered Users</span>
            <span className="text-3xl font-black text-foreground block">{stats.totalUsers || 0}</span>
            <span className="text-xs text-muted-foreground block">
              Donors: <span className="font-semibold text-foreground">{stats.totalDonors || 0}</span> | Volunteers: <span className="font-semibold text-foreground">{stats.totalVolunteers || 0}</span>
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* NGOs stats */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Verified NGO Partners</span>
            <span className="text-3xl font-black text-foreground block">{stats.verifiedNgos || 0}</span>
            <span className="text-xs text-muted-foreground block">
              Pending Approvals: <span className="font-semibold text-amber-500">{stats.pendingNgos || 0}</span>
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Completed Deliveries */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Completed Deliveries</span>
            <span className="text-3xl font-black text-foreground block">{stats.completedDeliveries || 0}</span>
            <span className="text-xs text-muted-foreground block">
              Active Transits: <span className="font-semibold text-foreground">{stats.activeDeliveries || 0}</span>
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        {/* Food Saved kilograms */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Total Food Saved</span>
            <span className="text-3xl font-black text-foreground block">{stats.foodSaved || 0} KG</span>
            <span className="text-xs text-muted-foreground block">
              Meals: <span className="font-semibold text-foreground">~{stats.estimatedMealsServed || 0}</span> | Helped: <span className="font-semibold text-foreground">{stats.peopleHelped || 0}</span>
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
            <Heart className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: trends bar chart */}
        <div className="lg:col-span-2 flex flex-col bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-foreground border-b border-border pb-3 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Platform Activity Trends
          </h3>

          {monthlyTrends.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground text-sm">No activity trends logged.</div>
          ) : (
            <div className="w-full h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="donations" fill="#3B82F6" name="Donations Posted" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="deliveries" fill="#10B981" name="Deliveries Complete" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right Side: pie category distribution */}
        <div className="flex flex-col bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-foreground border-b border-border pb-3 mb-6 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-primary" /> Category Distributions
          </h3>

          {categoriesDistribution.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground text-sm">No category distributions recorded.</div>
          ) : (
            <div className="w-full h-[240px] flex flex-col justify-between">
              <div className="w-full h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoriesDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoriesDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legends list */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center text-xs mt-4">
                {categoriesDistribution.map((entry, idx) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-muted-foreground">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span>{entry.name}: <span className="font-semibold text-foreground">{entry.value}</span></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
