-- 1. Profiles Updates
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS legal_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS artist_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS spotify_link TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'standard';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specializations TEXT[] DEFAULT '{}';

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  current_stage TEXT NOT NULL DEFAULT 'composer', -- 'composer', 'sound_designer', 'arranger', 'fx_mixer', 'mastering_engineer', 'completed'
  status TEXT DEFAULT 'active', -- 'active', 'completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read/write projects" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Tasks Table Updates
-- project_id is nullable to preserve standalone legacy tasks
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS stage TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS deadline TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS delay_penalty NUMERIC DEFAULT 0;
ALTER TABLE public.tasks ALTER COLUMN producer_id DROP NOT NULL;

-- 4. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL means broadcast
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read/write notifications" ON public.notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);
