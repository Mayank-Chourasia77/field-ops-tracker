// Database types for FieldOps Tracker Platform

export type AppRole = 'admin' | 'field_officer';
export type MeetingType = 'one_on_one' | 'group';
export type SaleType = 'b2b' | 'b2c';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface ClockLog {
  id: string;
  user_id: string;
  clock_in_at: string;
  clock_out_at: string | null;
  clock_in_lat: number | null;
  clock_in_lng: number | null;
  clock_out_lat: number | null;
  clock_out_lng: number | null;
  clock_in_odometer_url: string | null;
  clock_out_odometer_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkSession {
  id: string;
  user_id: string;
  login_at: string;
  logout_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: string;
  user_id: string;
  meeting_type: MeetingType;
  meeting_at: string;
  lat: number | null;
  lng: number | null;
  attendee_name: string | null;
  attendee_count: number;
  photo_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Distribution {
  id: string;
  user_id: string;
  distributed_at: string;
  sample_name: string;
  quantity: number;
  purpose: string | null;
  recipient_name: string | null;
  lat: number | null;
  lng: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OdometerLog {
  id: string;
  user_id: string;
  reading_km: number;
  photo_url: string | null;
  recorded_at: string;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  user_id: string;
  sold_at: string;
  sale_type: SaleType;
  sku: string;
  product_name: string | null;
  quantity: number;
  unit_price: number | null;
  total_amount: number | null;
  customer_name: string | null;
  lat: number | null;
  lng: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
