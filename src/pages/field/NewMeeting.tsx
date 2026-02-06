import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FieldLayout } from '@/components/layout/FieldLayout';
import { FieldButton } from '@/components/ui/FieldButton';
import { useAuthContext } from '@/contexts/AuthContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  User as UserIcon, 
  MapPin, 
  Save, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import type { MeetingType } from '@/types/database';

type Step = 'type' | 'details' | 'confirm';

export default function NewMeeting() {
  const { user, isLoading: authLoading } = useAuthContext();
  const navigate = useNavigate();
  const { getCurrentPosition, isLoading: geoLoading } = useGeolocation();
  
  const [step, setStep] = useState<Step>('type');
  const [meetingType, setMeetingType] = useState<MeetingType>('one_on_one');
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeCount, setAttendeeCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Capture GPS on mount
    getCurrentPosition()
      .then(setCoords)
      .catch(() => {/* Location optional */});
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const { error } = await supabase.from('meetings').insert({
        user_id: user.id,
        meeting_type: meetingType,
        meeting_at: new Date().toISOString(),
        attendee_name: attendeeName || null,
        attendee_count: meetingType === 'group' ? attendeeCount : 1,
        lat: coords?.lat || null,
        lng: coords?.lng || null,
        notes: notes || null,
      });

      if (error) throw error;

      toast.success('Meeting logged successfully!');
      navigate('/field/meetings');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save meeting');
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'type':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Meeting Type</h2>
            <p className="text-center text-muted-foreground">What kind of meeting is this?</p>
            
            <div className="space-y-4">
              <button
                onClick={() => { setMeetingType('one_on_one'); setStep('details'); }}
                className={`w-full card-field flex items-center gap-4 transition-all ${
                  meetingType === 'one_on_one' ? 'border-primary border-4' : ''
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold">One-on-One</p>
                  <p className="text-muted-foreground">Single person meeting</p>
                </div>
              </button>

              <button
                onClick={() => { setMeetingType('group'); setStep('details'); }}
                className={`w-full card-field flex items-center gap-4 transition-all ${
                  meetingType === 'group' ? 'border-primary border-4' : ''
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center">
                  <Users className="w-8 h-8 text-secondary" />
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold">Group Meeting</p>
                  <p className="text-muted-foreground">Multiple attendees</p>
                </div>
              </button>
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="space-y-6">
            <button 
              onClick={() => setStep('type')}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <ArrowLeft className="w-5 h-5" /> Back
            </button>

            <h2 className="text-2xl font-bold">Meeting Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-2">
                  {meetingType === 'group' ? 'Group/Organization Name' : 'Contact Name'}
                </label>
                <input
                  type="text"
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  className="input-field"
                  placeholder="Enter name..."
                />
              </div>

              {meetingType === 'group' && (
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-2">
                    Number of Attendees
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setAttendeeCount(Math.max(1, attendeeCount - 1))}
                      className="w-14 h-14 rounded-xl bg-muted text-2xl font-bold"
                    >
                      -
                    </button>
                    <span className="text-3xl font-bold w-16 text-center">{attendeeCount}</span>
                    <button
                      onClick={() => setAttendeeCount(attendeeCount + 1)}
                      className="w-14 h-14 rounded-xl bg-primary text-primary-foreground text-2xl font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field min-h-24 resize-none"
                  placeholder="Any additional details..."
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {coords ? (
                  <span className="text-success">GPS location captured</span>
                ) : geoLoading ? (
                  <span>Capturing location...</span>
                ) : (
                  <span>Location unavailable</span>
                )}
              </div>
            </div>

            <FieldButton
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => setStep('confirm')}
            >
              Review & Save
            </FieldButton>
          </div>
        );

      case 'confirm':
        return (
          <div className="space-y-6">
            <button 
              onClick={() => setStep('details')}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <ArrowLeft className="w-5 h-5" /> Back
            </button>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Confirm Meeting</h2>
            </div>

            <div className="card-field space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-semibold">{meetingType === 'group' ? 'Group' : 'One-on-One'}</span>
              </div>
              {attendeeName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact</span>
                  <span className="font-semibold">{attendeeName}</span>
                </div>
              )}
              {meetingType === 'group' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Attendees</span>
                  <span className="font-semibold">{attendeeCount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="font-semibold">{coords ? 'Captured' : 'Not available'}</span>
              </div>
            </div>

            <FieldButton
              variant="success"
              size="xl"
              className="w-full"
              icon={<Save className="w-6 h-6" />}
              onClick={handleSave}
              isLoading={isSaving}
            >
              Save Meeting
            </FieldButton>
          </div>
        );
    }
  };

  if (authLoading) {
    return (
      <FieldLayout title="New Meeting" showNav={false}>
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </FieldLayout>
    );
  }

  return (
    <FieldLayout title="New Meeting" showNav={false}>
      <div className="py-4">
        {renderStep()}
      </div>
    </FieldLayout>
  );
}
