-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'field_officer');

-- Create enum for meeting types
CREATE TYPE public.meeting_type AS ENUM ('one_on_one', 'group');

-- Create enum for sale types
CREATE TYPE public.sale_type AS ENUM ('b2b', 'b2c');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'field_officer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create clock_logs table for clock in/out with GPS and odometer
CREATE TABLE public.clock_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  clock_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  clock_out_at TIMESTAMPTZ,
  clock_in_lat DOUBLE PRECISION,
  clock_in_lng DOUBLE PRECISION,
  clock_out_lat DOUBLE PRECISION,
  clock_out_lng DOUBLE PRECISION,
  clock_in_odometer_url TEXT,
  clock_out_odometer_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create meetings table
CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meeting_type meeting_type NOT NULL DEFAULT 'one_on_one',
  meeting_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  attendee_name TEXT,
  attendee_count INTEGER DEFAULT 1,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create distributions table
CREATE TABLE public.distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  distributed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sample_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  purpose TEXT,
  recipient_name TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create sales table
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sold_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sale_type sale_type NOT NULL DEFAULT 'b2c',
  sku TEXT NOT NULL,
  product_name TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2),
  total_amount DECIMAL(10,2),
  customer_name TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clock_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Create helper function to check if user is admin (SECURITY DEFINER to avoid recursion)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clock_logs_updated_at BEFORE UPDATE ON public.clock_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_distributions_updated_at BEFORE UPDATE ON public.distributions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  -- Default role is field_officer
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'field_officer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (public.is_admin());

-- RLS Policies for user_roles (read only for non-admins)
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.is_admin());

-- RLS Policies for clock_logs
CREATE POLICY "Users can view own clock logs" ON public.clock_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all clock logs" ON public.clock_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "Users can create own clock logs" ON public.clock_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clock logs" ON public.clock_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can update any clock log" ON public.clock_logs FOR UPDATE USING (public.is_admin());

-- RLS Policies for meetings
CREATE POLICY "Users can view own meetings" ON public.meetings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all meetings" ON public.meetings FOR SELECT USING (public.is_admin());
CREATE POLICY "Users can create own meetings" ON public.meetings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meetings" ON public.meetings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meetings" ON public.meetings FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for distributions
CREATE POLICY "Users can view own distributions" ON public.distributions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all distributions" ON public.distributions FOR SELECT USING (public.is_admin());
CREATE POLICY "Users can create own distributions" ON public.distributions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own distributions" ON public.distributions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own distributions" ON public.distributions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for sales
CREATE POLICY "Users can view own sales" ON public.sales FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all sales" ON public.sales FOR SELECT USING (public.is_admin());
CREATE POLICY "Users can create own sales" ON public.sales FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sales" ON public.sales FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sales" ON public.sales FOR DELETE USING (auth.uid() = user_id);

-- Create storage buckets for photos
INSERT INTO storage.buckets (id, name, public) VALUES ('odometer-photos', 'odometer-photos', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('meeting-photos', 'meeting-photos', false);

-- Storage policies for odometer photos
CREATE POLICY "Users can upload own odometer photos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'odometer-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can view own odometer photos" ON storage.objects FOR SELECT USING (
  bucket_id = 'odometer-photos' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
);
CREATE POLICY "Users can delete own odometer photos" ON storage.objects FOR DELETE USING (
  bucket_id = 'odometer-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for meeting photos
CREATE POLICY "Users can upload own meeting photos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'meeting-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can view own meeting photos" ON storage.objects FOR SELECT USING (
  bucket_id = 'meeting-photos' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
);
CREATE POLICY "Users can delete own meeting photos" ON storage.objects FOR DELETE USING (
  bucket_id = 'meeting-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);