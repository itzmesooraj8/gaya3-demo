-- Migration: create schema for Gaya app
-- Run this in Supabase SQL editor or via Supabase CLI migrations

-- 1) Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2) Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('user','admin','host');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_status') THEN
    CREATE TYPE public.member_status AS ENUM ('Silver','Gold','Platinum');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vibe_category') THEN
    CREATE TYPE public.vibe_category AS ENUM ('Zen','Party','Workation','Adventure','Relax');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    CREATE TYPE public.booking_status AS ENUM ('pending','confirmed','completed','cancelled');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  role public.user_role DEFAULT 'user' NOT NULL,
  member_status public.member_status DEFAULT 'Silver' NOT NULL,
  vibe_score numeric DEFAULT 5.0 NOT NULL,
  total_revenue numeric DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 4) Properties table
CREATE TABLE IF NOT EXISTS public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text,
  description text,
  location_name text,
  price_per_night integer,
  vibe_category public.vibe_category,
  max_guests integer,
  rating numeric DEFAULT 0,
  coordinates geography(Point,4326),
  features text[],
  images text[],
  created_at timestamptz DEFAULT now()
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'coordinates'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE tablename = 'properties' AND indexname = 'properties_coordinates_gist'
    ) THEN
      EXECUTE 'CREATE INDEX properties_coordinates_gist ON public.properties USING GIST (coordinates)';
    END IF;
  END IF;
END$$;

-- 5) Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  check_in_date date,
  check_out_date date,
  total_price integer,
  status public.booking_status DEFAULT 'pending',
  addons jsonb DEFAULT '[]'::jsonb,
  payment_id text,
  created_at timestamptz DEFAULT now()
);

-- 6) Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_verified_stay boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Ensure expected columns exist (in case tables were created earlier with different schema)
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS host_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS location_name text,
  ADD COLUMN IF NOT EXISTS price_per_night integer,
  ADD COLUMN IF NOT EXISTS vibe_category public.vibe_category,
  ADD COLUMN IF NOT EXISTS max_guests integer,
  ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coordinates geography(Point,4326),
  ADD COLUMN IF NOT EXISTS features text[],
  ADD COLUMN IF NOT EXISTS images text[],
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS role public.user_role DEFAULT 'user' NOT NULL,
  ADD COLUMN IF NOT EXISTS member_status public.member_status DEFAULT 'Silver' NOT NULL,
  ADD COLUMN IF NOT EXISTS vibe_score numeric DEFAULT 5.0 NOT NULL,
  ADD COLUMN IF NOT EXISTS total_revenue numeric DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS check_in_date date,
  ADD COLUMN IF NOT EXISTS check_out_date date,
  ADD COLUMN IF NOT EXISTS total_price integer,
  ADD COLUMN IF NOT EXISTS status public.booking_status DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS addons jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS payment_id text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rating integer CHECK (rating >= 1 AND rating <= 5),
  ADD COLUMN IF NOT EXISTS comment text,
  ADD COLUMN IF NOT EXISTS is_verified_stay boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();


-- 7) Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 8) RLS: Profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies p WHERE p.policyname = 'Profiles: allow read to all' AND p.schemaname = 'public' AND p.tablename = 'profiles') THEN
    CREATE POLICY "Profiles: allow read to all" ON public.profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies p WHERE p.policyname = 'Profiles: insert own profile' AND p.schemaname = 'public' AND p.tablename = 'profiles') THEN
    CREATE POLICY "Profiles: insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies p WHERE p.policyname = 'Profiles: update own profile' AND p.schemaname = 'public' AND p.tablename = 'profiles') THEN
    CREATE POLICY "Profiles: update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
  END IF;
END$$;

-- 9) RLS: Properties
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies p WHERE p.policyname = 'Properties: allow read to all' AND p.schemaname = 'public' AND p.tablename = 'properties') THEN
    CREATE POLICY "Properties: allow read to all" ON public.properties FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies p WHERE p.policyname = 'Properties: insert if host' AND p.schemaname = 'public' AND p.tablename = 'properties') THEN
    CREATE POLICY "Properties: insert if host" ON public.properties FOR INSERT WITH CHECK (
      host_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'host'
      )
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies p WHERE p.policyname = 'Properties: update if host owns' AND p.schemaname = 'public' AND p.tablename = 'properties') THEN
    CREATE POLICY "Properties: update if host owns" ON public.properties FOR UPDATE USING (
      host_id = auth.uid()
      AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'host')
    ) WITH CHECK (
      host_id = auth.uid()
    );
  END IF;
END$$;

-- 10) RLS: Bookings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies p WHERE p.policyname = 'Bookings: select owner or host or admin' AND p.schemaname = 'public' AND p.tablename = 'bookings') THEN
    CREATE POLICY "Bookings: select owner or host or admin" ON public.bookings FOR SELECT USING (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.properties p WHERE p.id = public.bookings.property_id AND p.host_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.profiles q WHERE q.id = auth.uid() AND q.role = 'admin'
      )
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies p WHERE p.policyname = 'Bookings: insert by authenticated user' AND p.schemaname = 'public' AND p.tablename = 'bookings') THEN
    CREATE POLICY "Bookings: insert by authenticated user" ON public.bookings FOR INSERT WITH CHECK (
      user_id = auth.uid()
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies p WHERE p.policyname = 'Bookings: update owner/host/admin' AND p.schemaname = 'public' AND p.tablename = 'bookings') THEN
    CREATE POLICY "Bookings: update owner/host/admin" ON public.bookings FOR UPDATE USING (
      user_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.properties p WHERE p.id = public.bookings.property_id AND p.host_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.profiles q WHERE q.id = auth.uid() AND q.role = 'admin')
    ) WITH CHECK (
      user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles q WHERE q.id = auth.uid() AND q.role = 'admin')
    );
  END IF;
END$$;

-- 11) RLS: Reviews
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies p WHERE p.policyname = 'Reviews: allow read to all' AND p.schemaname = 'public' AND p.tablename = 'reviews') THEN
    CREATE POLICY "Reviews: allow read to all" ON public.reviews FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies p WHERE p.policyname = 'Reviews: insert own' AND p.schemaname = 'public' AND p.tablename = 'reviews') THEN
    CREATE POLICY "Reviews: insert own" ON public.reviews FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies p WHERE p.policyname = 'Reviews: update/delete own' AND p.schemaname = 'public' AND p.tablename = 'reviews') THEN
    CREATE POLICY "Reviews: update/delete own" ON public.reviews FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies p WHERE p.policyname = 'Reviews: delete own' AND p.schemaname = 'public' AND p.tablename = 'reviews') THEN
    CREATE POLICY "Reviews: delete own" ON public.reviews FOR DELETE USING (user_id = auth.uid());
  END IF;
END$$;

-- 12) Admin revenue access example
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies p WHERE p.policyname = 'Bookings: admin revenue access' AND p.schemaname = 'public' AND p.tablename = 'bookings') THEN
    CREATE POLICY "Bookings: admin revenue access" ON public.bookings FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );
  END IF;
END$$;

-- 13) Booking confirmed trigger: update host total_revenue and notify
CREATE OR REPLACE FUNCTION public.on_booking_status_changed()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status = 'confirmed' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    UPDATE public.profiles AS h
    SET total_revenue = COALESCE(h.total_revenue,0) + COALESCE(NEW.total_price,0)
    FROM public.properties p
    WHERE p.id = NEW.property_id AND h.id = p.host_id;

    PERFORM pg_notify('booking_confirmed', row_to_json(NEW)::text);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_booking_status_changed ON public.bookings;
CREATE TRIGGER trg_booking_status_changed
AFTER UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.on_booking_status_changed();
