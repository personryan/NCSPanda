-- =============================================================
-- Supabase RLS Policies & FK Constraint for NCS Panda
-- Run this script in the Supabase SQL Editor after Prisma migration
-- =============================================================

-- Add FK constraint to auth.users (Prisma can't model cross-schema references)
ALTER TABLE public.users
ADD CONSTRAINT users_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- =====================
-- Users table policies
-- =====================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own profile (e.g. after signup; backend may use direct connection that bypasses RLS)
CREATE POLICY "Users can insert own profile"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
ON public.users FOR SELECT
TO authenticated
USING (
  (SELECT role_name FROM users
   JOIN roles ON users.role_id = roles.role_id
   WHERE user_id = auth.uid()) = 'admin'
);

-- =====================
-- Roles table policies
-- =====================

-- All authenticated users can view roles
CREATE POLICY "All users can view roles"
ON public.roles FOR SELECT
TO authenticated
USING (true);
