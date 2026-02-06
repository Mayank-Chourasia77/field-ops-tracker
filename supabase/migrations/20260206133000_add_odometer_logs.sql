-- Create odometer_logs table for odometer submissions
CREATE TABLE public.odometer_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reading_km DOUBLE PRECISION NOT NULL,
  photo_url TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.odometer_logs ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger
CREATE TRIGGER update_odometer_logs_updated_at
  BEFORE UPDATE ON public.odometer_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for odometer_logs
CREATE POLICY "Users can view own odometer logs" ON public.odometer_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all odometer logs" ON public.odometer_logs
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Users can create own odometer logs" ON public.odometer_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own odometer logs" ON public.odometer_logs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can update any odometer logs" ON public.odometer_logs
  FOR UPDATE USING (public.is_admin());
