-- Create work_sessions table for login/logout tracking
CREATE TABLE public.work_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  login_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  logout_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger
CREATE TRIGGER update_work_sessions_updated_at
  BEFORE UPDATE ON public.work_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for work_sessions
CREATE POLICY "Users can view own work sessions" ON public.work_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all work sessions" ON public.work_sessions
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Users can create own work sessions" ON public.work_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own work sessions" ON public.work_sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can update any work sessions" ON public.work_sessions
  FOR UPDATE USING (public.is_admin());
