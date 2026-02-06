import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FieldLayout } from '@/components/layout/FieldLayout';
import { FieldButton } from '@/components/ui/FieldButton';
import { useAuthContext } from '@/contexts/AuthContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { supabase } from '@/integrations/supabase/client';
import { 
  Clock, 
  LogIn as ClockIn, 
  LogOut as ClockOut, 
  MapPin, 
  Camera,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfDay } from 'date-fns';
import type { ClockLog, OdometerLog, WorkSession } from '@/types/database';

export default function FieldDashboard() {
  const { user, profile, isLoading: authLoading } = useAuthContext();
  const navigate = useNavigate();
  const { getCurrentPosition, isLoading: geoLoading } = useGeolocation();
  const [activeClockLog, setActiveClockLog] = useState<ClockLog | null>(null);
  const [isClocking, setIsClocking] = useState(false);
  const [todayStats, setTodayStats] = useState({ meetings: 0, distributions: 0, sales: 0 });
  const [todayWorkSession, setTodayWorkSession] = useState<WorkSession | null>(null);
  const [workSessionHistory, setWorkSessionHistory] = useState<WorkSession[]>([]);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [todayOdometer, setTodayOdometer] = useState<OdometerLog | null>(null);
  const [isOdometerLoading, setIsOdometerLoading] = useState(true);
  const activeWorkSessionId = useRef<string | null>(null);

  const isAbortError = (error: unknown) => {
    const name = typeof error === 'object' && error ? (error as { name?: string }).name : undefined;
    const message = typeof error === 'object' && error ? (error as { message?: string }).message : undefined;
    return name === 'AbortError' || (!!message && /abort/i.test(message));
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchActiveClockLog();
      fetchTodayStats();
      fetchWorkSessions();
      fetchOdometerStatus();
    }
  }, [user]);

  useEffect(() => {
    const handleOdometerRecorded = (event: Event) => {
      const detail = (event as CustomEvent<OdometerLog>).detail;
      if (detail) {
        setTodayOdometer(detail);
        setIsOdometerLoading(false);
      } else {
        void fetchOdometerStatus();
      }
    };

    window.addEventListener('odometer:recorded', handleOdometerRecorded);
    return () => window.removeEventListener('odometer:recorded', handleOdometerRecorded);
  }, []);

  const fetchActiveClockLog = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('clock_logs')
        .select('*')
        .eq('user_id', user.id)
        .is('clock_out_at', null)
        .order('clock_in_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setActiveClockLog(data as ClockLog | null);
    } catch (error) {
      if (isAbortError(error)) return;
      console.error('Failed to fetch active clock log:', error);
    }
  };

  const fetchTodayStats = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];

    try {
      const [meetingsRes, distRes, salesRes] = await Promise.all([
        supabase.from('meetings').select('id', { count: 'exact', head: true })
          .eq('user_id', user.id).gte('meeting_at', today),
        supabase.from('distributions').select('id', { count: 'exact', head: true })
          .eq('user_id', user.id).gte('distributed_at', today),
        supabase.from('sales').select('id', { count: 'exact', head: true })
          .eq('user_id', user.id).gte('sold_at', today),
      ]);

      if (meetingsRes.error || distRes.error || salesRes.error) {
        throw meetingsRes.error || distRes.error || salesRes.error;
      }

      setTodayStats({
        meetings: meetingsRes.count || 0,
        distributions: distRes.count || 0,
        sales: salesRes.count || 0,
      });
    } catch (error) {
      if (isAbortError(error)) return;
      console.error('Failed to fetch today stats:', error);
    }
  };

  const fetchWorkSessions = async () => {
    if (!user) return;
    setIsSessionLoading(true);
    const todayStart = startOfDay(new Date()).toISOString();

    try {
      const [todayRes, historyRes] = await Promise.all([
        supabase
          .from('work_sessions')
          .select('*')
          .eq('user_id', user.id)
          .gte('login_at', todayStart)
          .order('login_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('work_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('login_at', { ascending: false })
          .limit(30),
      ]);

      if (todayRes.error) throw todayRes.error;
      if (historyRes.error) throw historyRes.error;

      const todaySession = (todayRes.data as WorkSession | null) ?? null;
      setTodayWorkSession(todaySession);
      activeWorkSessionId.current = todaySession && !todaySession.logout_at ? todaySession.id : null;
      setWorkSessionHistory((historyRes.data as WorkSession[]) ?? []);
    } catch (error) {
      console.error('Failed to fetch work sessions:', error);
    } finally {
      setIsSessionLoading(false);
    }
  };

  const upsertWorkSessionHistory = (session: WorkSession) => {
    setWorkSessionHistory((prev) => {
      const next = prev.filter((entry) => entry.id !== session.id);
      return [session, ...next];
    });
  };

  const fetchOdometerStatus = async () => {
    if (!user) return;
    setIsOdometerLoading(true);
    const todayStart = startOfDay(new Date()).toISOString();

    try {
      const { data, error } = await supabase
        .from('odometer_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('recorded_at', todayStart)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setTodayOdometer((data as OdometerLog | null) ?? null);
    } catch (error) {
      console.error('Failed to fetch odometer status:', error);
    } finally {
      setIsOdometerLoading(false);
    }
  };

  const createWorkSession = async () => {
    if (!user) return null;
    const loginAt = new Date().toISOString();

    try {
      const { data, error } = await supabase
        .from('work_sessions')
        .insert({
          user_id: user.id,
          login_at: loginAt,
        })
        .select('*')
        .single();

      if (error) throw error;
      const session = data as WorkSession;
      setTodayWorkSession(session);
      activeWorkSessionId.current = session.id;
      upsertWorkSessionHistory(session);
      return session;
    } catch (error) {
      console.error('Failed to create work session:', error);
      return null;
    }
  };

  const completeWorkSession = async () => {
    if (!user) return null;
    const logoutAt = new Date().toISOString();

    try {
      let sessionId = activeWorkSessionId.current ?? todayWorkSession?.id ?? null;

      if (!sessionId || todayWorkSession?.logout_at) {
        const { data, error } = await supabase
          .from('work_sessions')
          .select('*')
          .eq('user_id', user.id)
          .is('logout_at', null)
          .order('login_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        sessionId = data?.id ?? null;
      }

      if (!sessionId) return null;

      const { data: updated, error: updateError } = await supabase
        .from('work_sessions')
        .update({ logout_at: logoutAt })
        .eq('id', sessionId)
        .select('*')
        .single();

      if (updateError) throw updateError;
      const session = updated as WorkSession;
      setTodayWorkSession(session);
      activeWorkSessionId.current = null;
      upsertWorkSessionHistory(session);
      return session;
    } catch (error) {
      console.error('Failed to complete work session:', error);
      return null;
    }
  };

  const handleClockIn = async () => {
    if (!user) return;
    setIsClocking(true);

    try {
      const { lat, lng } = await getCurrentPosition();
      
      const { error } = await supabase.from('clock_logs').insert({
        user_id: user.id,
        clock_in_at: new Date().toISOString(),
        clock_in_lat: lat,
        clock_in_lng: lng,
      });

      if (error) throw error;

      toast.success('Clocked in successfully!');
      await fetchActiveClockLog();
      await createWorkSession();
    } catch (error: any) {
      toast.error(error.message || 'Failed to clock in');
    } finally {
      setIsClocking(false);
    }
  };

  const handleClockOut = async () => {
    if (!user || !activeClockLog) return;
    setIsClocking(true);

    try {
      const { lat, lng } = await getCurrentPosition();
      
      const { error } = await supabase
        .from('clock_logs')
        .update({
          clock_out_at: new Date().toISOString(),
          clock_out_lat: lat,
          clock_out_lng: lng,
        })
        .eq('id', activeClockLog.id);

      if (error) throw error;

      toast.success('Clocked out successfully!');
      setActiveClockLog(null);
      await completeWorkSession();
    } catch (error: any) {
      toast.error(error.message || 'Failed to clock out');
    } finally {
      setIsClocking(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <FieldLayout title="Field Dashboard">
      <div className="py-4 space-y-6">
        {/* Welcome Section */}
        <div className="card-field">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">
                {profile?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold">Hello, {profile?.full_name?.split(' ')[0] || 'Officer'}!</h2>
              <p className="text-muted-foreground">{format(new Date(), 'EEEE, MMMM d')}</p>
            </div>
          </div>
        </div>

        {/* Clock Status */}
        <div className="card-field">
          <div className="flex items-center gap-3 mb-4">
            <div className={`status-dot ${activeClockLog ? 'status-active' : 'status-inactive'}`} />
            <span className="font-semibold text-lg">
              {activeClockLog ? 'Currently Active' : 'Not Clocked In'}
            </span>
          </div>

          {activeClockLog && (
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Clock className="w-5 h-5" />
              <span>Since {format(new Date(activeClockLog.clock_in_at), 'h:mm a')}</span>
              {activeClockLog.clock_in_lat && (
                <>
                  <MapPin className="w-5 h-5 ml-2" />
                  <span>GPS Captured</span>
                </>
              )}
            </div>
          )}

          <FieldButton
            variant={activeClockLog ? 'destructive' : 'success'}
            size="xl"
            className="w-full"
            icon={activeClockLog ? <ClockOut className="w-8 h-8" /> : <ClockIn className="w-8 h-8" />}
            onClick={activeClockLog ? handleClockOut : handleClockIn}
            isLoading={isClocking || geoLoading}
          >
            {activeClockLog ? 'CLOCK OUT' : 'CLOCK IN'}
          </FieldButton>

          <p className="text-center text-sm text-muted-foreground mt-3">
            <MapPin className="w-4 h-4 inline mr-1" />
            GPS location will be captured automatically
          </p>
        </div>

        {/* Today's Stats */}
        <div className="card-field space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Today's Activity</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Meetings" value={todayStats.meetings} />
            <StatCard label="Samples" value={todayStats.distributions} />
            <StatCard label="Sales" value={todayStats.sales} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-field space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FieldButton
              variant="outline"
              size="lg"
              icon={<Camera className="w-6 h-6" />}
              onClick={() => navigate('/field/odometer')}
              disabled={!activeClockLog}
            >
              Odometer
            </FieldButton>
            <FieldButton
              variant="primary"
              size="lg"
              onClick={() => navigate('/field/meetings/new')}
              disabled={!activeClockLog}
            >
              New Meeting
            </FieldButton>
          </div>
          {!activeClockLog && (
            <p className="text-center text-sm text-warning flex items-center justify-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Clock in to unlock features
            </p>
          )}

          <div className="border-t border-border pt-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Today's Verification</p>
              <p className="text-xs text-muted-foreground">Odometer reading</p>
            </div>
            <span className={`text-sm font-semibold ${
              isOdometerLoading ? 'text-muted-foreground' : todayOdometer ? 'text-success' : 'text-warning'
            }`}>
              {isOdometerLoading ? 'Checking...' : todayOdometer ? 'Completed' : 'Pending'}
            </span>
          </div>
        </div>

        {/* Today's Work Session */}
        <div className="card-field space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Today's Work Session</h3>
            <span className={`text-sm font-semibold ${
              todayWorkSession
                ? todayWorkSession.logout_at
                  ? 'text-muted-foreground'
                  : 'text-success'
                : 'text-warning'
            }`}>
              {todayWorkSession
                ? todayWorkSession.logout_at
                  ? 'Completed'
                  : 'Active'
                : 'Pending'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Login Time</span>
              <span className="font-semibold">
                {todayWorkSession?.login_at ? format(new Date(todayWorkSession.login_at), 'h:mm a') : 'Not recorded'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Logout Time</span>
              <span className="font-semibold">
                {todayWorkSession?.logout_at ? format(new Date(todayWorkSession.logout_at), 'h:mm a') : '—'}
              </span>
            </div>
          </div>
        </div>

        <FieldButton
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => setShowHistory((prev) => !prev)}
        >
          {showHistory ? 'Hide Login History' : 'View Login History'}
        </FieldButton>

        {showHistory && (
          <div className="card-field space-y-4">
            <h4 className="font-semibold">Login History</h4>
            {isSessionLoading ? (
              <p className="text-sm text-muted-foreground">Loading history...</p>
            ) : workSessionHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No history available yet.</p>
            ) : (
              <div className="space-y-3">
                {workSessionHistory.map((session) => (
                  <div key={session.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {format(new Date(session.login_at), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Login: {format(new Date(session.login_at), 'h:mm a')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Logout</p>
                      <p className="font-semibold">
                        {session.logout_at ? format(new Date(session.logout_at), 'h:mm a') : '—'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </FieldLayout>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card rounded-xl p-4 text-center border-2 border-border">
      <div className="text-3xl font-bold text-primary">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
