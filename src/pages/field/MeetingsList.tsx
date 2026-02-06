import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FieldLayout } from '@/components/layout/FieldLayout';
import { FieldButton } from '@/components/ui/FieldButton';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Users, User, Plus, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import type { Meeting } from '@/types/database';

export default function MeetingsList() {
  const { user, isLoading: authLoading } = useAuthContext();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchMeetings();
    }
  }, [user]);

  const fetchMeetings = async () => {
    if (!user) return;
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('user_id', user.id)
      .order('meeting_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setMeetings(data as Meeting[]);
    }
    setIsLoading(false);
  };

  if (authLoading || isLoading) {
    return (
      <FieldLayout title="Meetings">
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </FieldLayout>
    );
  }

  return (
    <FieldLayout title="Meetings">
      <div className="py-4 space-y-4">
        <FieldButton
          variant="primary"
          size="lg"
          className="w-full"
          icon={<Plus className="w-6 h-6" />}
          onClick={() => navigate('/field/meetings/new')}
        >
          Log New Meeting
        </FieldButton>

        {meetings.length === 0 ? (
          <div className="card-field text-center py-10">
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-semibold">No meetings yet</p>
            <p className="text-muted-foreground">Start by logging your first meeting</p>
          </div>
        ) : (
          <div className="space-y-3">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="card-field flex items-center gap-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`/field/meetings/${meeting.id}`)}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  meeting.meeting_type === 'group' ? 'bg-secondary/20 text-secondary' : 'bg-primary/10 text-primary'
                }`}>
                  {meeting.meeting_type === 'group' ? <Users className="w-6 h-6" /> : <User className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {meeting.attendee_name || (meeting.meeting_type === 'group' ? 'Group Meeting' : 'One-on-One')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(meeting.meeting_at), 'MMM d, h:mm a')}
                    {meeting.meeting_type === 'group' && meeting.attendee_count > 1 && (
                      <span className="ml-2">• {meeting.attendee_count} attendees</span>
                    )}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}
      </div>
    </FieldLayout>
  );
}
