import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useDonorStatsQuery, useDonationsQuery } from '../../hooks/useDonations.js';
import { Link, Navigate } from 'react-router-dom';
import {
  Heart,
  Truck,
  ShieldCheck,
  Ban,
  Clock,
  Sparkles,
  Utensils,
  PlusCircle,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

/**
 * Dashboard root view.
 * Decides whether to show the Donor Dashboard or standard placeholder layouts.
 */
export const Dashboard = () => {
  const { user } = useAuth();
  
  // Redirect NGO users to NGO dashboard
  if (user?.role === 'NGO') {
    return <Navigate to="/ngo/dashboard" replace />;
  }

  // Redirect VOLUNTEER users to Volunteer dashboard
  if (user?.role === 'VOLUNTEER') {
    return <Navigate to="/volunteer/dashboard" replace />;
  }

  // Redirect ADMIN users to Admin dashboard
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Show Donor dashboard if user is DONOR, else default layout
  if (user?.role === 'DONOR') {
    return <DonorDashboardView user={user} />;
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back to the Food Waste Redistribution System control panel.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 text-center max-w-xl mx-auto mt-12">
        <h3 className="text-lg font-bold text-foreground">Initial Foundation Completed</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          The database queries, CRUD screens, dashboard statistics, donation flows, and user profiles are scheduled to be implemented in the next phase of development.
        </p>
      </div>
    </div>
  );
};

/**
 * Premium Donor Dashboard view.
 */
const DonorDashboardView = ({ user }) => {
  const { data: statsRes, isLoading: statsLoading } = useDonorStatsQuery();
  const { data: recentRes, isLoading: recentLoading } = useDonationsQuery({
    limit: 5,
    selfOnly: 'true',
  });

  const stats = statsRes?.data || {
    ACTIVE: 0,
    PENDING: 0,
    APPROVED: 0,
    COMPLETED: 0,
    EXPIRED: 0,
    CANCELLED: 0,
    meals: 0,
    people: 0,
  };

  const recentDonations = recentRes?.data?.records || [];

  // Recharts custom colors matching design aesthetics
  const COLORS = ['hsl(var(--primary))', '#38bdf8', '#818cf8', '#f43f5e', '#a1a1aa', '#fb923c'];

  // Mock chart inputs calculated relative to current stats
  const monthlyData = [
    { month: 'Feb', donations: 4 },
    { month: 'Mar', donations: 6 },
    { month: 'Apr', donations: 8 },
    { month: 'May', donations: Math.max(5, stats.COMPLETED - 2) },
    { month: 'Jun', donations: Math.max(10, stats.COMPLETED + stats.ACTIVE) },
    { month: 'Jul', donations: stats.meals || 15 },
  ];

  const categoryData = [
    { name: 'Cooked Food', value: Math.max(4, stats.ACTIVE + 2) },
    { name: 'Raw Food', value: 2 },
    { name: 'Packed Food', value: 3 },
    { name: 'Bakery', value: 1 },
    { name: 'Other', value: 1 },
  ];

  const statusData = [
    { name: 'Active', value: stats.ACTIVE },
    { name: 'Pending', value: stats.PENDING },
    { name: 'Completed', value: stats.COMPLETED },
    { name: 'Cancelled', value: stats.CANCELLED },
  ];

  const typeData = [
    { name: 'Veg', count: Math.max(3, stats.ACTIVE) },
    { name: 'Non-Veg', count: 2 },
    { name: 'Vegan', count: 1 },
  ];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-primary" /> Donor Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {user.full_name}. Coordinate surplus listings and track distribution pipelines.
          </p>
        </div>
        <div>
          <Link
            to="/donations/create"
            className="inline-flex items-center gap-2 justify-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/10 border border-primary/20"
          >
            <PlusCircle className="w-4 h-4" /> Create Donation
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Active Donations */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active</span>
            <span className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Utensils className="w-4 h-4" /></span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-foreground">{stats.ACTIVE}</p>
          <p className="mt-1 text-2xs text-muted-foreground">Available for NGO requests</p>
        </div>

        {/* Pending Requests */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending</span>
            <span className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><Clock className="w-4 h-4" /></span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-foreground">{stats.PENDING}</p>
          <p className="mt-1 text-2xs text-muted-foreground">Claim requests awaiting approval</p>
        </div>

        {/* Approved Donations */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Approved</span>
            <span className="p-2 bg-sky-500/10 rounded-lg text-sky-500"><ShieldCheck className="w-4 h-4" /></span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-foreground">{stats.APPROVED}</p>
          <p className="mt-1 text-2xs text-muted-foreground">Claimed listings in transit</p>
        </div>

        {/* Completed Donations */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed</span>
            <span className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500"><Heart className="w-4 h-4" /></span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-foreground">{stats.COMPLETED}</p>
          <p className="mt-1 text-2xs text-muted-foreground">Redistributed successfully</p>
        </div>

        {/* Expired Donations */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expired</span>
            <span className="p-2 bg-rose-500/10 rounded-lg text-rose-500"><Clock className="w-4 h-4" /></span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-foreground">{stats.EXPIRED}</p>
          <p className="mt-1 text-2xs text-muted-foreground">Time expired listings</p>
        </div>

        {/* Cancelled Donations */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cancelled</span>
            <span className="p-2 bg-gray-500/10 rounded-lg text-gray-500"><Ban className="w-4 h-4" /></span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-foreground">{stats.CANCELLED}</p>
          <p className="mt-1 text-2xs text-muted-foreground">Withdrawn listings</p>
        </div>

        {/* Meals Donated */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Quantity</span>
            <span className="p-2 bg-primary/10 rounded-lg text-primary"><Heart className="w-4 h-4 fill-primary" /></span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-foreground">{stats.meals} items</p>
          <p className="mt-1 text-2xs text-muted-foreground">Total volume shared</p>
        </div>

        {/* Estimated People Served */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">People Fed (Est.)</span>
            <span className="p-2 bg-violet-500/10 rounded-lg text-violet-500"><PlusCircle className="w-4 h-4" /></span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-foreground">{stats.people}</p>
          <p className="mt-1 text-2xs text-muted-foreground">Meals servings created</p>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Monthly Donations Line Chart */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <h3 className="text-base font-bold text-foreground mb-4">Monthly Share Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="donations" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorDonations)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pie Chart */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <h3 className="text-base font-bold text-foreground mb-4">Donation Status Split</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Bar Chart */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <h3 className="text-base font-bold text-foreground mb-4">Food Categories Share</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Food Type Bar Chart */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <h3 className="text-base font-bold text-foreground mb-4">Dietary Properties (Food Type)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent Donations Timeline */}
      <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-foreground">Recent Listings Timeline</h3>
          <Link to="/donations/history" className="text-xs font-semibold text-primary hover:underline">
            View All History
          </Link>
        </div>

        {recentLoading ? (
          <p className="text-sm text-muted-foreground py-4">Loading timeline...</p>
        ) : recentDonations.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No recent donation listings.</p>
        ) : (
          <div className="relative border-l border-border pl-4 space-y-6">
            {recentDonations.map((d) => (
              <div key={d.id} className="relative">
                <span className="absolute -left-[21px] top-1.5 flex h-2 w-2 rounded-full bg-primary" />
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{d.food_name}</h4>
                    <span className="text-3xs uppercase tracking-wider text-muted-foreground font-semibold">
                      {d.food_category} • {d.quantity} {d.quantity_unit}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(d.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
