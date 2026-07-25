import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useNgoDashboardQuery,
  useNgoStatisticsQuery,
  useRequestHistoryQuery,
} from '../../hooks/useNgo.js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Award,
  CheckCircle,
  Truck,
  AlertCircle,
  MapPin,
  Clock,
  Compass,
} from 'lucide-react';
import RequestHistory from '../../components/ngo/RequestHistory.jsx';

export const NGODashboard = () => {
  const navigate = useNavigate();

  // Queries
  const { data: dashboardData, isLoading: dashLoading } = useNgoDashboardQuery();
  const { data: statsData } = useNgoStatisticsQuery();
  const { data: requestsData, isLoading: reqLoading } = useRequestHistoryQuery({ limit: 5 });

  const stats = dashboardData?.data || {
    APPROVED: 0,
    PENDING: 0,
    REJECTED: 0,
    COMPLETED: 0,
    meals: 0,
    people: 0,
  };

  const chartData = statsData?.data?.monthlyFoodReceived?.map((item) => ({
    month: item.month,
    claims: item.received,
  })) || [
    { month: 'Jan', claims: 0 },
    { month: 'Feb', claims: 0 },
    { month: 'Mar', claims: 0 },
    { month: 'Apr', claims: 0 },
    { month: 'May', claims: 0 },
    { month: 'Jun', claims: 0 },
  ];

  const statCards = [
    {
      title: 'Meals Rescued',
      value: stats.meals,
      icon: Award,
      color: 'text-green-500 bg-green-500/10 border-green-500/25',
    },
    {
      title: 'People Impacted',
      value: stats.people,
      icon: TrendingUp,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/25',
    },
    {
      title: 'Pending Requests',
      value: stats.PENDING,
      icon: Clock,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/25',
    },
    {
      title: 'Completed Rescues',
      value: stats.COMPLETED,
      icon: CheckCircle,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/25',
    },
  ];

  if (dashLoading || reqLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-sm font-semibold text-muted-foreground animate-pulse">Loading dashboard statistics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">NGO Claims Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track your active collections and impact analytics metrics.</p>
        </div>
        <button
          onClick={() => navigate('/ngo/discover')}
          className="inline-flex items-center justify-center px-5 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md"
        >
          <Compass className="w-4 h-4 mr-1.5" /> Discover Nearby Food
        </button>
      </div>

      {/* Grid statistics metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className={`p-5 rounded-xl border bg-card flex items-center justify-between shadow-sm ${card.color.split(' ')[2]}`}>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground block">{card.title}</span>
              <span className="text-2xl font-extrabold text-foreground block">{card.value}</span>
            </div>
            <div className={`p-3 rounded-lg border ${card.color.split(' ').slice(0, 2).join(' ')}`}>
              <card.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart & Active lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recharts Monthly analysis */}
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-foreground">Redistribution Rescues Analytics</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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
                <Bar dataKey="claims" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Requests summary */}
        <div>
          <RequestHistory
            requests={requestsData?.data?.records || []}
            onViewDetails={(id) => navigate(`/ngo/requests/${id}`)}
          />
        </div>

      </div>

    </div>
  );
};

export default NGODashboard;
