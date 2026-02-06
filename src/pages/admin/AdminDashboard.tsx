import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  ShoppingCart,
  TrendingUp,
  MapPin,
  Clock,
  LogOut
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { format, subDays, startOfDay } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStats {
  totalOfficers: number;
  activeTodayCount: number;
  todayMeetings: number;
  todaySales: number;
  b2bSales: number;
  b2cSales: number;
  weeklyMeetings: number[];
}

export default function AdminDashboard() {
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuthContext();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalOfficers: 0,
    activeTodayCount: 0,
    todayMeetings: 0,
    todaySales: 0,
    b2bSales: 0,
    b2cSales: 0,
    weeklyMeetings: [0, 0, 0, 0, 0, 0, 0],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else if (!isAdmin) {
        navigate('/field');
      }
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchDashboardData();
    }
  }, [user, isAdmin]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    const today = startOfDay(new Date()).toISOString();

    try {
      // Fetch all stats in parallel
      const [
        officersRes,
        activeRes,
        meetingsRes,
        salesRes,
        b2bRes,
        b2cRes,
      ] = await Promise.all([
        supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'field_officer'),
        supabase.from('clock_logs').select('user_id', { count: 'exact' }).gte('clock_in_at', today).is('clock_out_at', null),
        supabase.from('meetings').select('id', { count: 'exact', head: true }).gte('meeting_at', today),
        supabase.from('sales').select('id', { count: 'exact', head: true }).gte('sold_at', today),
        supabase.from('sales').select('total_amount').eq('sale_type', 'b2b').gte('sold_at', today),
        supabase.from('sales').select('total_amount').eq('sale_type', 'b2c').gte('sold_at', today),
      ]);

      // Calculate B2B/B2C totals
      const b2bTotal = (b2bRes.data || []).reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0);
      const b2cTotal = (b2cRes.data || []).reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0);

      // Fetch weekly meetings
      const weeklyData: number[] = [];
      for (let i = 6; i >= 0; i--) {
        const dayStart = startOfDay(subDays(new Date(), i)).toISOString();
        const dayEnd = startOfDay(subDays(new Date(), i - 1)).toISOString();
        const { count } = await supabase
          .from('meetings')
          .select('id', { count: 'exact', head: true })
          .gte('meeting_at', dayStart)
          .lt('meeting_at', dayEnd);
        weeklyData.push(count || 0);
      }

      setStats({
        totalOfficers: officersRes.count || 0,
        activeTodayCount: activeRes.count || 0,
        todayMeetings: meetingsRes.count || 0,
        todaySales: salesRes.count || 0,
        b2bSales: b2bTotal,
        b2cSales: b2cTotal,
        weeklyMeetings: weeklyData,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Chart data
  const weeklyLabels = Array.from({ length: 7 }, (_, i) => 
    format(subDays(new Date(), 6 - i), 'EEE')
  );

  const meetingsChartData = {
    labels: weeklyLabels,
    datasets: [
      {
        label: 'Meetings',
        data: stats.weeklyMeetings,
        backgroundColor: 'hsl(152, 45%, 28%)',
        borderRadius: 8,
      },
    ],
  };

  const salesSplitData = {
    labels: ['B2B', 'B2C'],
    datasets: [
      {
        data: [stats.b2bSales, stats.b2cSales],
        backgroundColor: ['hsl(38, 92%, 50%)', 'hsl(152, 45%, 28%)'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4">
        <div className="app-container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
              <span className="text-xl font-black">F</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">FieldOps Tracker Admin</h1>
              <p className="text-xs text-primary-foreground/70">Operations Dashboard</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-xl hover:bg-primary-foreground/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="app-container py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Field Officers"
            value={stats.totalOfficers}
            color="primary"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="Active Now"
            value={stats.activeTodayCount}
            color="success"
          />
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            label="Today's Meetings"
            value={stats.todayMeetings}
            color="secondary"
          />
          <StatCard
            icon={<ShoppingCart className="w-6 h-6" />}
            label="Today's Sales"
            value={stats.todaySales}
            color="primary"
          />
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Weekly Meetings Chart */}
          <div className="bg-card rounded-2xl p-6 shadow-md border-2 border-border">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Weekly Meetings
            </h3>
            <div className="h-64">
              <Bar 
                data={meetingsChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } },
                  },
                }}
              />
            </div>
          </div>

          {/* Sales Split Chart */}
          <div className="bg-card rounded-2xl p-6 shadow-md border-2 border-border">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-secondary" />
              Sales Split (Today)
            </h3>
            <div className="h-64 flex items-center justify-center">
              {stats.b2bSales === 0 && stats.b2cSales === 0 ? (
                <p className="text-muted-foreground">No sales today</p>
              ) : (
                <Doughnut 
                  data={salesSplitData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom' },
                    },
                  }}
                />
              )}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary">₹{stats.b2bSales.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">B2B</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">₹{stats.b2cSales.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">B2C</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Map Placeholder */}
        <div className="bg-card rounded-2xl p-6 shadow-md border-2 border-border">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Field Activity Map
          </h3>
          <div className="h-64 bg-muted rounded-xl flex items-center justify-center">
            <p className="text-muted-foreground">
              Map visualization coming soon
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number; 
  color: 'primary' | 'secondary' | 'success';
}) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/20 text-secondary',
    success: 'bg-success/10 text-success',
  };

  return (
    <div className="bg-card rounded-2xl p-4 shadow-md border-2 border-border">
      <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
