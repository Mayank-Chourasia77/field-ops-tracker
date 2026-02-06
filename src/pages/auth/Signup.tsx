import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { FieldButton } from '@/components/ui/FieldButton';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(email, password, fullName);
    setIsLoading(false);

    if (error) {
      toast.error(error.message || 'Signup failed');
    } else {
      toast.success('Account created! Please check your email to verify.');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground pt-12 pb-16">
        <div className="app-container text-center">
          <div className="w-20 h-20 bg-primary-foreground/20 rounded-3xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl font-black">F</span>
          </div>
          <h1 className="text-2xl font-bold">Join FieldOps Tracker</h1>
          <p className="text-primary-foreground/80 mt-1">Field Operations Team</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 -mt-8">
        <div className="app-container">
          <div className="app-container-narrow">
            <div className="bg-card rounded-3xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-semibold text-muted-foreground mb-2">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field"
                    placeholder="John Doe"
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-muted-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-muted-foreground mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pr-14"
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-2"
                    >
                      {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Minimum 6 characters</p>
                </div>

                <FieldButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  icon={<UserPlus className="w-6 h-6" />}
                  className="w-full mt-6"
                >
                  Create Account
                </FieldButton>
              </form>

              <p className="text-center mt-6 text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-semibold hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6">
        <div className="app-container">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 FieldOps Tracker
          </p>
        </div>
      </div>
    </div>
  );
}
