import { FieldLayout } from '@/components/layout/FieldLayout';
import { FieldButton } from '@/components/ui/FieldButton';
import { useAuthContext } from '@/contexts/AuthContext';
import { LogOut, User, Mail, Phone } from 'lucide-react';

export default function ProfilePage() {
  const { profile, role, signOut } = useAuthContext();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <FieldLayout title="Profile">
      <div className="py-4 space-y-6">
        {/* Profile Card */}
        <div className="card-field text-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl font-bold text-primary">
              {profile?.full_name?.charAt(0) || 'U'}
            </span>
          </div>
          <h2 className="text-2xl font-bold">{profile?.full_name || 'User'}</h2>
          <span className="inline-block mt-2 px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold capitalize">
            {role?.replace('_', ' ') || 'Field Officer'}
          </span>
        </div>

        {/* Contact Info */}
        <div className="card-field space-y-4">
          <h3 className="font-bold text-lg">Contact Information</h3>
          
          {profile?.email && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Mail className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
            </div>
          )}

          {profile?.phone && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Phone className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{profile.phone}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sign Out */}
        <FieldButton
          variant="destructive"
          size="lg"
          className="w-full"
          icon={<LogOut className="w-6 h-6" />}
          onClick={handleSignOut}
        >
          Sign Out
        </FieldButton>
      </div>
    </FieldLayout>
  );
}
