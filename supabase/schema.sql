-- Create custom users table wrapping auth.users
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'producer', -- 'admin' or 'producer'
  name TEXT,
  payment_method TEXT,
  payment_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create messages table
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id), -- NULL means broadcast to all
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES public.profiles(id) NOT NULL,
  producer_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  admin_file_url TEXT,
  producer_file_url TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create statistics table
CREATE TABLE public.statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.statistics ENABLE ROW LEVEL SECURITY;

-- Create awards table
CREATE TABLE public.awards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producer_id UUID REFERENCES public.profiles(id) NOT NULL,
  type TEXT NOT NULL, -- 'daily', 'monthly'
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;

-- Function to handle new user signups and create a profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, name)
  VALUES (new.id, 'producer', new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user when an auth.user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Basic Policies (allowing all authenticated users access for the prototype)
CREATE POLICY "Allow authenticated read/write profiles" ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated read/write messages" ON public.messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated read/write tasks" ON public.tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated read/write statistics" ON public.statistics FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated read/write awards" ON public.awards FOR ALL TO authenticated USING (true) WITH CHECK (true);
